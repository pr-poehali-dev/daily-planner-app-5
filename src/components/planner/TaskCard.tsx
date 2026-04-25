import { useState, useRef } from 'react';
import { Task, Priority, Direction } from '@/types/planner';
import Icon from '@/components/ui/icon';

interface TaskCardProps {
  task: Task;
  priorities: Priority[];
  directions: Direction[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
}

const SWIPE_OPEN = -156;
const THRESHOLD = 60;

export default function TaskCard({ task, priorities, directions, onToggle, onDelete, onOpen }: TaskCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);

  const priority = priorities.find(p => p.id === task.priorityId);
  const direction = directions.find(d => d.id === task.directionId);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const snapOpen = () => { setIsOpen(true); setSwipeX(SWIPE_OPEN); };
  const snapClose = () => { setIsOpen(false); setSwipeX(0); };

  const handleToggle = () => {
    if (task.done) { onToggle(task.id); return; }
    setCompleting(true);
    setTimeout(() => {
      onToggle(task.id);
      setCompleting(false);
    }, 420);
  };

  const onStart = (x: number) => {
    startX.current = x;
    dragging.current = true;
    moved.current = false;
  };

  const onMove = (x: number) => {
    if (!dragging.current) return;
    const delta = x - startX.current;
    if (Math.abs(delta) > 3) moved.current = true;
    const base = isOpen ? SWIPE_OPEN : 0;
    const next = Math.min(0, Math.max(SWIPE_OPEN, base + delta));
    setSwipeX(next);
  };

  const onEnd = () => {
    dragging.current = false;
    if (!moved.current) return;
    if (isOpen) {
      if (swipeX > SWIPE_OPEN + THRESHOLD) { snapClose(); } else { snapOpen(); }
    } else {
      if (swipeX < -THRESHOLD) { snapOpen(); } else { snapClose(); }
    }
  };

  const actions = [
    { icon: 'Check', color: '#6b9e78', action: () => { handleToggle(); snapClose(); } },
    { icon: 'Pencil', color: '#3b82f6', action: () => { onOpen(task); snapClose(); } },
    { icon: 'Trash2', color: '#ef4444', action: () => { onDelete(task.id); snapClose(); } },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 gap-1.5">
        {actions.map((a, i) => (
          <button
            key={i}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); a.action(); }}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: a.color + '18',
              transform: isOpen ? 'scale(1)' : 'scale(0.85)',
              opacity: isOpen ? 1 : 0,
              transitionDelay: `${i * 25}ms`,
            }}
          >
            <Icon name={a.icon} fallback="Circle" size={18} style={{ color: a.color }} />
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        className="relative bg-white shadow-soft px-4 py-3.5 flex items-start gap-3 cursor-pointer select-none"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: dragging.current ? 'none' : 'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)',
          borderRadius: 16,
          opacity: completing ? 0.6 : 1,
        }}
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={e => onStart(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onClick={() => {
          if (moved.current) return;
          if (isOpen) { snapClose(); return; }
          onOpen(task);
        }}
      >
        {/* Checkbox */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); if (!moved.current) handleToggle(); }}
          className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
          style={{
            borderColor: task.done ? '#6b9e78' : completing ? '#6b9e78' : priority?.color || '#d1d5db',
            backgroundColor: task.done || completing ? '#6b9e78' : 'transparent',
            transform: completing ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          {(task.done || completing) && (
            <Icon name="Check" size={11} color="white"
              style={{
                transition: 'opacity 0.2s',
                opacity: completing || task.done ? 1 : 0,
              }}
            />
          )}
        </button>

        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Title with animated strikethrough */}
          <div className="relative">
            <p className="text-sm font-medium leading-snug text-foreground"
              style={{
                color: task.done ? 'hsl(220 10% 55%)' : 'hsl(220 15% 16%)',
                transition: 'color 0.35s ease',
              }}>
              {task.title}
            </p>
            {/* Strikethrough line */}
            <div
              className="absolute left-0 top-1/2 h-px bg-muted-foreground pointer-events-none rounded-full"
              style={{
                width: task.done ? '100%' : completing ? '100%' : '0%',
                transition: completing
                  ? 'width 0.35s cubic-bezier(0.4,0,0.2,1)'
                  : task.done
                  ? 'none'
                  : 'width 0.2s ease',
                opacity: task.done || completing ? 0.45 : 0,
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5"
            style={{
              opacity: task.done || completing ? 0.5 : 1,
              transition: 'opacity 0.35s ease',
            }}>
            {priority && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: priority.color + '18', color: priority.color }}>
                {priority.name}
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Icon name="Calendar" size={11} />
                {formatDate(task.dueDate)}
              </span>
            )}
            {direction && <span className="text-xs text-muted-foreground">{direction.name}</span>}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">{doneSubtasks}/{task.subtasks.length} подзадач</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
