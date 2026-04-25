import { useState } from 'react';
import { Task, Direction, Priority } from '@/types/planner';
import TaskCard from './TaskCard';
import AddTaskForm from './AddTaskForm';
import Icon from '@/components/ui/icon';

interface DirectionsViewProps {
  directions: Direction[];
  tasks: Task[];
  priorities: Priority[];
  onToggleTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onOpenTask: (task: Task) => void;
  onUpdateDirection: (id: string, updates: Partial<Direction>) => void;
  onAddDirection: (dir: Omit<Direction, 'id'>) => void;
  onDeleteDirection: (id: string) => void;
}

const DIRECTION_ICONS = ['Heart', 'Dumbbell', 'BookOpen', 'Star', 'Briefcase', 'Home', 'Music', 'Palette', 'Globe', 'Smile'];
const DIRECTION_COLORS = ['#f43f5e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6', '#6b9e78', '#06b6d4', '#10b981'];

export default function DirectionsView({
  directions, tasks, priorities,
  onToggleTask, onUpdateTask, onDeleteTask, onAddTask, onOpenTask,
  onUpdateDirection, onAddDirection, onDeleteDirection
}: DirectionsViewProps) {
  const [activeDir, setActiveDir] = useState(directions[0]?.id || '');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddDir, setShowAddDir] = useState(false);
  const [newDirName, setNewDirName] = useState('');
  const [newDirIcon, setNewDirIcon] = useState('Star');
  const [newDirColor, setNewDirColor] = useState('#6b9e78');
  const [editingDir, setEditingDir] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const currentDir = directions.find(d => d.id === activeDir);
  const dirTasks = tasks.filter(t => t.directionId === activeDir && !t.done);

  const handleAddDir = () => {
    if (!newDirName.trim()) return;
    onAddDirection({ name: newDirName, icon: newDirIcon, color: newDirColor });
    setNewDirName('');
    setShowAddDir(false);
  };

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Направления</h2>
        <button
          onClick={() => setShowAddDir(s => !s)}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Icon name="Plus" size={20} />
        </button>
      </div>

      {showAddDir && (
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-4 animate-fade-in">
          <input
            autoFocus
            className="w-full text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3 border-b border-border pb-2"
            placeholder="Название направления..."
            value={newDirName}
            onChange={e => setNewDirName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddDir()}
          />
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Иконка</p>
            <div className="flex flex-wrap gap-2">
              {DIRECTION_ICONS.map(ic => (
                <button key={ic} onClick={() => setNewDirIcon(ic)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newDirIcon === ic ? 'bg-primary/15 ring-2 ring-primary' : 'hover:bg-muted'}`}>
                  <Icon name={ic} fallback="Circle" size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Цвет</p>
            <div className="flex gap-2">
              {DIRECTION_COLORS.map(c => (
                <button key={c} onClick={() => setNewDirColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${newDirColor === c ? 'ring-2 ring-offset-2 ring-foreground/30 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddDir(false)} className="text-xs text-muted-foreground px-3 py-1.5 rounded-xl hover:bg-muted">Отмена</button>
            <button onClick={handleAddDir} className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-medium">Добавить</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {directions.map(dir => (
          <button
            key={dir.id}
            onClick={() => setActiveDir(dir.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: activeDir === dir.id ? dir.color : dir.color + '15',
              color: activeDir === dir.id ? 'white' : dir.color,
            }}
          >
            <Icon name={dir.icon} fallback="Circle" size={14} />
            {dir.name}
          </button>
        ))}
      </div>

      {currentDir && (
        <div>
          <div className="flex items-center justify-between mb-4">
            {editingDir === currentDir.id ? (
              <input
                autoFocus
                className="text-lg font-bold bg-transparent outline-none border-b border-border text-foreground"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => {
                  onUpdateDirection(currentDir.id, { name: editName });
                  setEditingDir(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    onUpdateDirection(currentDir.id, { name: editName });
                    setEditingDir(null);
                  }
                }}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: currentDir.color }}>{currentDir.name}</span>
                <button onClick={() => { setEditName(currentDir.name); setEditingDir(currentDir.id); }}
                  className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="Pencil" size={13} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{dirTasks.length} задач</span>
              {directions.length > 1 && (
                <button onClick={() => {
                  onDeleteDirection(currentDir.id);
                  setActiveDir(directions.find(d => d.id !== currentDir.id)?.id || '');
                }} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {dirTasks.map(task => (
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

            {showAdd ? (
              <AddTaskForm
                categoryId="today"
                priorities={priorities}
                onAdd={task => { onAddTask({ ...task, directionId: activeDir }); setShowAdd(false); }}
                onCancel={() => setShowAdd(false)}
              />
            ) : (
              <button
                onClick={() => setShowAdd(true)}
                className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 px-4 rounded-2xl hover:bg-white hover:shadow-soft transition-all duration-200"
              >
                <Icon name="Plus" size={15} />
                Добавить задачу
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
