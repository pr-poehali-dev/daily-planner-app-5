import { useState } from 'react';
import { Task, Priority, Direction } from '@/types/planner';
import Icon from '@/components/ui/icon';

interface TaskModalProps {
  task: Task | null;
  priorities: Priority[];
  directions: Direction[];
  timeCategories: { id: string; name: string; type?: string }[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  generateId: () => string;
}

const getDateStr = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

const RESCHEDULE_OPTIONS = [
  { label: 'Сегодня', icon: 'Sun', color: '#f59e0b', date: () => getDateStr(0), categoryId: 'today' },
  { label: 'Завтра', icon: 'Sunrise', color: '#8b5cf6', date: () => getDateStr(1), categoryId: 'tomorrow' },
  { label: 'Через 3 дня', icon: 'CalendarDays', color: '#3b82f6', date: () => getDateStr(3), categoryId: 'scheduled' },
  { label: 'На неделю', icon: 'Calendar', color: '#6b9e78', date: () => getDateStr(7), categoryId: 'scheduled' },
  { label: 'Когда-нибудь', icon: 'Cloud', color: '#94a3b8', date: () => null, categoryId: 'someday' },
];

export default function TaskModal({
  task, priorities, directions, timeCategories,
  onClose, onUpdate, onToggleSubtask, onAddSubtask, onDeleteSubtask,
}: TaskModalProps) {
  const [newSubtask, setNewSubtask] = useState('');
  const [showReschedule, setShowReschedule] = useState(false);

  if (!task) return null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleReschedule = (opt: typeof RESCHEDULE_OPTIONS[0]) => {
    onUpdate(task.id, {
      dueDate: opt.date(),
      categoryId: opt.categoryId,
      done: false,
    });
    setShowReschedule(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-soft-lg w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
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

          {/* Reschedule block */}
          <div className="mb-5">
            <button
              onClick={() => setShowReschedule(s => !s)}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon name="CalendarClock" size={15} style={{ color: 'hsl(150 25% 42%)' }} />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                Перенести задачу
              </span>
              <Icon name={showReschedule ? 'ChevronUp' : 'ChevronDown'} size={14} className="ml-auto text-muted-foreground" />
            </button>

            {showReschedule && (
              <div className="mt-2 grid grid-cols-1 gap-1.5 animate-fade-in">
                {RESCHEDULE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => handleReschedule(opt)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.color + '20' }}>
                      <Icon name={opt.icon} fallback="Calendar" size={14} style={{ color: opt.color }} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    {opt.date() && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(opt.date()! + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fields */}
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

          {/* Notes */}
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

          {/* Subtasks */}
          <div>
            <label className="text-xs text-muted-foreground mb-3 block font-medium">
              Подзадачи {task.subtasks.length > 0 && `(${task.subtasks.filter(s => s.done).length}/${task.subtasks.length})`}
            </label>
            <div className="space-y-2 mb-3">
              {task.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2.5 group/st">
                  <button
                    onClick={() => onToggleSubtask(task.id, st.id)}
                    className="shrink-0 rounded-full border-2 flex items-center justify-center transition-all"
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
