import { Task, Habit, Direction } from '@/types/planner';

interface StatsViewProps {
  tasks: Task[];
  habits: Habit[];
  directions: Direction[];
}

const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
};

const getDayShort = (date: string) => {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 2);
};

export default function StatsView({ tasks, habits, directions }: StatsViewProps) {
  const days = getLast7Days();
  const todayStr = days[6];

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.done).length;
  const activeTasks = totalTasks - doneTasks;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Per-day done tasks (simulate by dueDate match)
  const dayStats = days.map(day => {
    const dayDone = tasks.filter(t => t.done && (t.dueDate === day || (!t.dueDate && day === todayStr))).length;
    const dayTotal = tasks.filter(t => t.dueDate === day || (!t.dueDate && day === todayStr)).length;
    return { day, done: dayDone, total: Math.max(dayDone, dayTotal) };
  });
  const maxBar = Math.max(...dayStats.map(d => d.total), 1);

  // Habits completion today
  const habitsToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const habitRate = habits.length > 0 ? Math.round((habitsToday / habits.length) * 100) : 0;

  // By direction
  const dirStats = directions.map(d => ({
    dir: d,
    total: tasks.filter(t => t.directionId === d.id).length,
    done: tasks.filter(t => t.directionId === d.id && t.done).length,
  })).filter(d => d.total > 0);

  // Streaks for habits
  const topHabit = habits.reduce((best, h) => {
    const streak = (() => {
      let s = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (h.completedDates.includes(days[i])) s++;
        else break;
      }
      return s;
    })();
    return streak > (best?.streak ?? 0) ? { habit: h, streak } : best;
  }, null as { habit: Habit; streak: number } | null);

  return (
    <div className="px-4 pb-8 space-y-4">
      <div className="pt-2">
        <h2 className="text-xl font-bold text-foreground mb-1">Статистика</h2>
        <p className="text-xs text-muted-foreground">Общая картина вашей продуктивности</p>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего задач', value: totalTasks, icon: '📋', color: '#6b7280' },
          { label: 'Выполнено', value: doneTasks, icon: '✅', color: '#6b9e78' },
          { label: 'Активных', value: activeTasks, icon: '⚡', color: '#f97316' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl shadow-soft p-3.5 text-center">
            <div className="text-xl mb-1">{kpi.icon}</div>
            <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-tight">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl shadow-soft p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Активность за неделю</p>
            <p className="text-xs text-muted-foreground">задачи по дням</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              выполнено
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-muted inline-block" />
              всего
            </span>
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-28">
          {dayStats.map(({ day, done, total }) => {
            const isToday = day === todayStr;
            const totalH = total > 0 ? (total / maxBar) * 100 : 6;
            const doneH = done > 0 ? (done / maxBar) * 100 : 0;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col justify-end relative" style={{ height: 88 }}>
                  {/* Total bar */}
                  <div
                    className="w-full rounded-lg absolute bottom-0"
                    style={{
                      height: `${totalH}%`,
                      backgroundColor: isToday ? 'hsl(150 25% 42% / 0.15)' : 'hsl(220 10% 94%)',
                      minHeight: 6,
                    }}
                  />
                  {/* Done bar */}
                  {doneH > 0 && (
                    <div
                      className="w-full rounded-lg absolute bottom-0 transition-all duration-500"
                      style={{
                        height: `${doneH}%`,
                        backgroundColor: isToday ? 'hsl(150 25% 42%)' : 'hsl(150 25% 65%)',
                        minHeight: 4,
                      }}
                    />
                  )}
                  {done > 0 && (
                    <span className="absolute -top-5 left-0 right-0 text-center text-[10px] font-semibold"
                      style={{ color: isToday ? 'hsl(150 25% 42%)' : 'hsl(220 10% 55%)' }}>
                      {done}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium capitalize ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {getDayShort(day)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion ring */}
      <div className="bg-white rounded-2xl shadow-soft p-4 flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="30" fill="none" stroke="hsl(220 10% 94%)" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="30" fill="none"
              stroke="hsl(150 25% 42%)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - completionRate / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{completionRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Процент выполнения</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {doneTasks} из {totalTasks} задач завершено
          </p>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 bg-muted rounded-xl p-2 text-center">
              <p className="text-xs text-muted-foreground">Привычки</p>
              <p className="text-sm font-bold text-foreground">{habitRate}%</p>
              <p className="text-[10px] text-muted-foreground">сегодня</p>
            </div>
            {topHabit && topHabit.streak > 0 && (
              <div className="flex-1 bg-muted rounded-xl p-2 text-center">
                <p className="text-xs text-muted-foreground">Рекорд</p>
                <p className="text-sm font-bold text-foreground">🔥 {topHabit.streak}д</p>
                <p className="text-[10px] text-muted-foreground truncate">{topHabit.habit.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* By direction */}
      {dirStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-soft p-4">
          <p className="text-sm font-semibold text-foreground mb-3">По направлениям</p>
          <div className="space-y-3">
            {dirStats.map(({ dir, total, done }) => {
              const pct = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={dir.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center text-xs"
                        style={{ backgroundColor: dir.color + '25' }}>
                        <span style={{ color: dir.color }}>●</span>
                      </div>
                      <span className="text-xs font-medium text-foreground">{dir.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: dir.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
