import { Priority, TimeCategory, Direction } from '@/types/planner';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface SettingsModalProps {
  priorities: Priority[];
  timeCategories: TimeCategory[];
  directions: Direction[];
  onClose: () => void;
  onUpdatePriority: (id: string, updates: Partial<Priority>) => void;
  onUpdateTimeCategory: (id: string, updates: Partial<TimeCategory>) => void;
  onUpdateDirection: (id: string, updates: Partial<Direction>) => void;
}

const PRIORITY_COLORS = ['#ef4444', '#f97316', '#eab308', '#6b9e78', '#3b82f6', '#8b5cf6', '#94a3b8'];

export default function SettingsModal({
  priorities, timeCategories, directions, onClose,
  onUpdatePriority, onUpdateTimeCategory, onUpdateDirection
}: SettingsModalProps) {
  const [tab, setTab] = useState<'priorities' | 'categories' | 'directions'>('priorities');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-soft-lg w-full max-w-lg max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Настройки</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-6">
            {(['priorities', 'categories', 'directions'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-xl transition-all ${tab === t ? 'bg-white shadow-soft text-foreground' : 'text-muted-foreground'}`}>
                {t === 'priorities' ? 'Приоритеты' : t === 'categories' ? 'Категории' : 'Направления'}
              </button>
            ))}
          </div>

          {tab === 'priorities' && (
            <div className="space-y-3">
              {priorities.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <input
                    className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground"
                    value={p.name}
                    onChange={e => onUpdatePriority(p.id, { name: e.target.value })}
                  />
                  <div className="flex gap-1.5">
                    {PRIORITY_COLORS.map(c => (
                      <button key={c} onClick={() => onUpdatePriority(p.id, { color: c })}
                        className={`w-5 h-5 rounded-full transition-all ${p.color === c ? 'ring-2 ring-offset-1 ring-foreground/30 scale-110' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'categories' && (
            <div className="space-y-3">
              {timeCategories.map(c => (
                <div key={c.id} className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: c.color + '20' }}>
                    <Icon name={c.icon} fallback="Circle" size={14} style={{ color: c.color }} />
                  </div>
                  <input
                    className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground"
                    value={c.name}
                    onChange={e => onUpdateTimeCategory(c.id, { name: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'directions' && (
            <div className="space-y-3">
              {directions.map(d => (
                <div key={d.id} className="flex items-center gap-3 bg-muted rounded-2xl px-4 py-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: d.color + '20' }}>
                    <Icon name={d.icon} fallback="Circle" size={14} style={{ color: d.color }} />
                  </div>
                  <input
                    className="flex-1 text-sm font-medium bg-transparent outline-none text-foreground"
                    value={d.name}
                    onChange={e => onUpdateDirection(d.id, { name: e.target.value })}
                  />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: d.color }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
