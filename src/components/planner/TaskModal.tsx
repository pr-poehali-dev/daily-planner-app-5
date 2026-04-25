import { useState } from 'react';
import { Task, Priority, Direction, SubTask } from '@/types/planner';
import Icon from '@/components/ui/icon';

interface TaskModalProps {
  task: Task | null;
  priorities: Priority[];
  directions: Direction[];
  timeCategories: { id: string; name: string }[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  generateId: () => string;
}

export default function TaskModal({
  task, priorities, directions, timeCategories,
  onClose, onUpdate, onToggleSubtask, onAddSubtask, onDeleteSubtask,
}: TaskModalProps) {
  const [newSubtask, setNewSubtask] = useState('');

  if (!task) return null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-soft-lg w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <button
              onClick={() => onUpdate(task.id, { done: !task.done })}
              className="mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: task.done ? '#6b9e78' : '#d1d5db',
                backgroundColor: task.done ? '#6b9e78' : 'transparent'
              }}
            >
              {task.done && <Icon name="Check" size={13} color="white" />}
            </button>
            <input
              className="flex-1 text-lg font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              value={task.title}
              onChange={e => onUpdate(task.id, { title: e.target.value })}
              placeholder="Название задачи"
            />
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Приоритет</label>
              <select
                className="w-full text-sm bg-muted rounded-xl px-3 py-2 outline-none border-none text-foreground"
                value={task.priorityId || ''}
                onChange={e => onUpdate(task.id, { priorityId: e.target.value || null })}
              >
                <option value="">Без приоритета</option>
                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Дата</label>
              <input
                type="date"
                className="w-full text-sm bg-muted rounded-xl px-3 py-2 outline-none border-none text-foreground"
                value={task.dueDate || ''}
                onChange={e => onUpdate(task.id, { dueDate: e.target.value || null })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Категория</label>
              <select
                className="w-full text-sm bg-muted rounded-xl px-3 py-2 outline-none border-none text-foreground"
                value={task.categoryId}
                onChange={e => onUpdate(task.id, { categoryId: e.target.value })}
              >
                {timeCategories.filter(c => c.id !== 'done').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Направление</label>
              <select
                className="w-full text-sm bg-muted rounded-xl px-3 py-2 outline-none border-none text-foreground"
                value={task.directionId || ''}
                onChange={e => onUpdate(task.id, { directionId: e.target.value || null })}
              >
                <option value="">—</option>
                {directions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Заметки</label>
            <textarea
              className="w-full text-sm bg-muted rounded-xl px-3 py-2.5 outline-none border-none text-foreground resize-none"
              rows={3}
              placeholder="Добавить заметку..."
              value={task.notes}
              onChange={e => onUpdate(task.id, { notes: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">
              Подзадачи {task.subtasks.length > 0 && `(${task.subtasks.filter(s => s.done).length}/${task.subtasks.length})`}
            </label>
            <div className="space-y-2 mb-3">
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2.5 group/st">
                  <button
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    className="shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: st.done ? '#6b9e78' : '#d1d5db',
                      backgroundColor: st.done ? '#6b9e78' : 'transparent',
                      width: 18, height: 18
                    }}
                  >
                    {st.done && <Icon name="Check" size={10} color="white" />}
                  </button>
                  <span className={`flex-1 text-sm ${st.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {st.title}
                  </span>
                  <button
                    onClick={() => onDeleteSubtask(task.id, st.id)}
                    className="opacity-0 group-hover/st:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Icon name="X" size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground text-foreground"
                placeholder="Добавить подзадачу..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              />
              <button
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Icon name="Plus" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
