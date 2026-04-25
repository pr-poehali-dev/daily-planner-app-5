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
  const startX = useRef(0);
  const currentX = useRef(0);
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

  const onStart = (x: number) => {
    startX.current = x;
    currentX.current = isOpen ? SWIPE_OPEN : 0;
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
    { icon: 'Check', color: '#6b9e78', action: () => { onToggle(task.id); snapClose(); } },
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
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); if (!moved.current) onToggle(task.id); }}
          className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: task.done ? '#6b9e78' : priority?.color || '#d1d5db',
            backgroundColor: task.done ? '#6b9e78' : 'transparent',
          }}
        >
          {task.done && <Icon name="Check" size={11} color="white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
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