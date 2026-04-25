import { useState } from 'react';
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

export default function TaskCard({ task, priorities, directions, onToggle, onDelete, onOpen }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const priority = priorities.find(p => p.id === task.priorityId);
  const direction = directions.find(d => d.id === task.directionId);
  const doneSubtasks = task.subtasks.filter(s => s.done).length;

  const formatDate = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      className="group bg-white rounded-2xl shadow-soft px-4 py-3.5 flex items-start gap-3 cursor-pointer transition-all duration-200 hover:shadow-soft-md animate-fade-in"
      style={{ animationDelay: '0ms' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(task)}
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
            <span className="text-xs text-muted-foreground">
              {direction.name}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {doneSubtasks}/{task.subtasks.length} подзадач
            </span>
          )}
        </div>
      </div>

      {hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <Icon name="Trash2" size={14} />
        </button>
      )}
    </div>
  );
}
