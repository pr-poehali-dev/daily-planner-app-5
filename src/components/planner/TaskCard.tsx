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

export default function TaskCard({ task, priorities, directions, onToggle, onDelete, onOpen, onUpdate }: TaskCardProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const priority = priorities.find(p => p.id === task.priorityId);
  const direction = directions.find(d => d.id === task.directionId);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;

  const THRESHOLD = 72;

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    if (dx < 0) setSwipeX(Math.max(dx, -THRESHOLD * 3));
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    if (swipeX < -THRESHOLD) {
      setSwiped(true);
      setSwipeX(-THRESHOLD * 3);
    } else {
      setSwiped(false);
      setSwipeX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    if (dx < 0) setSwipeX(Math.max(dx, -THRESHOLD * 3));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (swipeX < -THRESHOLD) {
      setSwiped(true);
      setSwipeX(-THRESHOLD * 3);
    } else {
      setSwiped(false);
      setSwipeX(0);
    }
  };

  const closeSwipe = () => {
    setSwiped(false);
    setSwipeX(0);
  };

  const actions = [
    {
      icon: 'Check',
      color: '#6b9e78',
      bg: '#6b9e78',
      action: () => { onToggle(task.id); closeSwipe(); }
    },
    {
      icon: 'Pencil',
      color: '#3b82f6',
      bg: '#3b82f6',
      action: () => { onOpen(task); closeSwipe(); }
    },
    {
      icon: 'Trash2',
      color: '#ef4444',
      bg: '#ef4444',
      action: () => { onDelete(task.id); closeSwipe(); }
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl" onClick={swiped ? closeSwipe : undefined}>
      {/* Action buttons behind card */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1.5">
        {actions.map((a, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); a.action(); }}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200"
            style={{
              backgroundColor: a.bg + '22',
              transform: swiped ? 'scale(1)' : 'scale(0.8)',
              transitionDelay: `${i * 30}ms`,
            }}
          >
            <Icon name={a.icon} fallback="Circle" size={18} style={{ color: a.bg }} />
          </button>
        ))}
      </div>

      {/* Card itself */}
      <div
        className="relative bg-white shadow-soft px-4 py-3.5 flex items-start gap-3 cursor-pointer select-none"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)',
          borderRadius: 16,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={e => {
          if (Math.abs(swipeX) > 4) return;
          onOpen(task);
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggle(task.id); }}
          className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: task.done ? '#6b9e78' : priority?.color || '#d1d5db',
            backgroundColor: task.done ? '#6b9e78' : 'transparent'
          }}
        >
          {task.done && <Icon name="Check" size={11} color="white" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug transition-all duration-200 ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
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
            {direction && (
              <span className="text-xs text-muted-foreground">{direction.name}</span>
            )}
            {task.subtasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {doneSubtasks}/{task.subtasks.length} подзадач
              </span>
            )}
          </div>
        </div>

        {/* Swipe hint arrow */}
        {!swiped && swipeX < -8 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40">
            <Icon name="ChevronLeft" size={14} />
          </div>
        )}
      </div>
    </div>
  );
}
