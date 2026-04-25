import { useState } from 'react';
import { Task, TimeCategory, Priority, Direction } from '@/types/planner';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';
import Icon from '@/components/ui/icon';

interface CategorySectionProps {
  category: TimeCategory;
  tasks: Task[];
  priorities: Priority[];
  directions: Direction[];
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onOpenTask: (task: Task) => void;
  onUpdateCategory: (id: string, name: string) => void;
}

export default function CategorySection({
  category, tasks, priorities, directions,
  onToggleTask, onUpdateTask, onDeleteTask, onAddTask, onOpenTask, onUpdateCategory
}: CategorySectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(category.name);
  const [collapsed, setCollapsed] = useState(category.type === 'done');

  const count = tasks.length;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: category.color + '18' }}>
          <Icon name={category.icon} fallback="Circle" size={16} style={{ color: category.color }} />
        </div>

        {editingName ? (
          <input
            autoFocus
            className="flex-1 text-sm font-semibold bg-transparent outline-none border-b border-border text-foreground"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onBlur={() => {
              onUpdateCategory(category.id, tempName);
              setEditingName(false);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                onUpdateCategory(category.id, tempName);
                setEditingName(false);
              }
            }}
          />
        ) : (
          <button
            className="flex-1 text-left text-sm font-semibold text-foreground hover:text-primary transition-colors"
            onDoubleClick={() => setEditingName(true)}
          >
            {category.name}
          </button>
        )}

        {count > 0 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        )}

        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronDown'} size={16} />
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-2 ml-1">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              priorities={priorities}
              directions={directions}
              onToggle={onToggleTask}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              onOpen={onOpenTask}
            />
          ))}

          {category.type !== 'done' && (
            showAdd ? (
              <AddTaskForm
                categoryId={category.id}
                priorities={priorities}
                onAdd={task => { onAddTask(task); setShowAdd(false); }}
                onCancel={() => setShowAdd(false)}
              />
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 px-4 rounded-2xl hover:bg-white hover:shadow-soft transition-all duration-200 group"
              >
                <Icon name="Plus" size={15} className="group-hover:text-primary transition-colors" />
                Добавить задачу
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}