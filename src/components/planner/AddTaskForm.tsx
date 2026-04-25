import { useState } from 'react';
import { Task, Priority } from '@/types/planner';
import Icon from '@/components/ui/icon';

interface AddTaskFormProps {
  categoryId: string;
  priorities: Priority[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function AddTaskForm({ categoryId, priorities, onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      done: false,
      priorityId: priorityId || null,
      dueDate: dueDate || null,
      categoryId,
      listId: null,
      directionId: null,
      subtasks: [],
      notes: '',
    });
    setTitle('');
    setPriorityId('');
    setDueDate('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-4 animate-fade-in">
      <input
        autoFocus
        className="w-full text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3"
        placeholder="Название задачи..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <select
          className="text-xs bg-muted rounded-xl px-2.5 py-1.5 outline-none border-none text-foreground"
          value={priorityId}
          onChange={e => setPriorityId(e.target.value)}
        >
          <option value="">Приоритет</option>
          {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          type="date"
          className="text-xs bg-muted rounded-xl px-2.5 py-1.5 outline-none border-none text-foreground"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <div className="flex-1" />
        <button
          onClick={onCancel}
          className="text-xs text-muted-foreground px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
