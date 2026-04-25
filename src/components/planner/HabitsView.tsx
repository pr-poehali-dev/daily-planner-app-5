import { useState } from 'react';
import { Habit } from '@/types/planner';
import Icon from '@/components/ui/icon';

interface HabitsViewProps {
  habits: Habit[];
  onToggle: (id: string, date: string) => void;
  onAdd: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
}

const HABIT_ICONS = ['🌅', '📚', '🧘', '🏃', '💧', '🍎', '🎯', '🌿', '✍️', '🎵', '💪', '🧠'];
const HABIT_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#6b9e78', '#f43f5e', '#eab308', '#06b6d4', '#10b981'];

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
};

const getDayLabel = (date: string) => {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 2);
};

export default function HabitsView({ habits, onToggle, onAdd, onDelete }: HabitsViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🎯');
  const [newColor, setNewColor] = useState('#6b9e78');
  const days = getLast7Days();
  const todayStr = days[6];

  const getStreak = (habit: Habit) => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (habit.completedDates.includes(days[i])) streak++;
      else break;
    }
    return streak;
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({ name: newName.trim(), icon: newIcon, color: newColor, frequency: 'daily' });
    setNewName('');
    setNewIcon('🎯');
    setNewColor('#6b9e78');
    setShowAdd(false);
  };

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Трекер привычек</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Последние 7 дней</p>
        </div>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="flex items-center gap-1.5 bg-primary text-white text-sm font-medium px-3.5 py-2 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Icon name="Plus" size={15} />
          Привычка
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-4 animate-fade-in">
          <input
            autoFocus
            className="w-full text-sm font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground mb-3 border-b border-border pb-2"
            placeholder="Название привычки..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Иконка</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setNewIcon(ic)}
                  className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all ${newIcon === ic ? 'bg-primary/15 ring-2 ring-primary' : 'hover:bg-muted'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Цвет</p>
            <div className="flex gap-2">
              {HABIT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-foreground/30 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground px-3 py-1.5 rounded-xl hover:bg-muted">Отмена</button>
            <button onClick={handleAdd} className="text-xs bg-primary text-white px-3 py-1.5 rounded-xl font-medium hover:opacity-90">Добавить</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {habits.length === 0 && !showAdd && (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-4xl mb-3 block">🌱</span>
            <p className="text-sm font-medium">Нет привычек</p>
            <p className="text-xs mt-1">Добавьте первую привычку для отслеживания</p>
          </div>
        )}

        {habits.map(habit => {
          const streak = getStreak(habit);
          const doneToday = habit.completedDates.includes(todayStr);
          return (
            <div key={habit.id} className="bg-white rounded-2xl shadow-soft p-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: habit.color + '20' }}>
                  {habit.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{habit.name}</p>
                  {streak > 0 && (
                    <p className="text-xs text-muted-foreground">🔥 {streak} дней подряд</p>
                  )}
                </div>
                <button
                  onClick={() => onToggle(habit.id, todayStr)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: doneToday ? habit.color : habit.color + '15',
                    color: doneToday ? 'white' : habit.color
                  }}
                >
                  <Icon name={doneToday ? 'Check' : 'Circle'} size={16} />
                </button>
                <button onClick={() => onDelete(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>

              <div className="flex gap-1.5">
                {days.map(day => {
                  const done = habit.completedDates.includes(day);
                  const isToday = day === todayStr;
                  return (
                    <button
                      key={day}
                      onClick={() => onToggle(habit.id, day)}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <span className={`text-[10px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {getDayLabel(day)}
                      </span>
                      <div
                        className="w-full aspect-square rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: done ? habit.color : habit.color + '15',
                          maxWidth: 32
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
