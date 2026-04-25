import { useState } from 'react';
import { usePlannerStore } from '@/store/plannerStore';
import { Task, AppView } from '@/types/planner';
import CategorySection from '@/components/planner/CategorySection';
import DirectionsView from '@/components/planner/DirectionsView';
import HabitsView from '@/components/planner/HabitsView';
import StatsView from '@/components/planner/StatsView';
import TaskModal from '@/components/planner/TaskModal';
import Icon from '@/components/ui/icon';

const NAV_ITEMS: { id: AppView; icon: string; label: string }[] = [
  { id: 'time', icon: 'Clock', label: 'Задачи' },
  { id: 'directions', icon: 'Compass', label: 'Цели' },
  { id: 'habits', icon: 'TrendingUp', label: 'Привычки' },
  { id: 'stats', icon: 'BarChart2', label: 'Статистика' },
];

export default function Index() {
  const store = usePlannerStore();
  const [view, setView] = useState<AppView>('time');
  const [dayTab, setDayTab] = useState<'today' | 'tomorrow' | 'other'>('today');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const todayLabel = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const today = todayLabel;
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();

  const getTasksForTimeCategory = (catId: string) => {
    const cat = store.timeCategories.find(c => c.id === catId);
    if (!cat) return [];
    if (cat.type === 'done') return store.tasks.filter(t => t.done);
    if (cat.type === 'today') return store.tasks.filter(t => !t.done && (t.categoryId === 'today' || t.dueDate === todayStr));
    if (cat.type === 'tomorrow') return store.tasks.filter(t => !t.done && (t.categoryId === 'tomorrow' || t.dueDate === tomorrowStr));
    if (cat.type === 'scheduled') return store.tasks.filter(t => !t.done && t.dueDate && t.dueDate > tomorrowStr);
    return store.tasks.filter(t => !t.done && t.categoryId === catId);
  };

  const totalToday = store.tasks.filter(t => !t.done && (t.categoryId === 'today' || t.dueDate === todayStr)).length;
  const totalTomorrow = store.tasks.filter(t => !t.done && (t.categoryId === 'tomorrow' || t.dueDate === tomorrowStr)).length;
  const doneToday = store.tasks.filter(t => t.done).length;

  const todayCats = store.timeCategories.filter(c => c.type === 'today' || c.type === 'inbox');
  const tomorrowCats = store.timeCategories.filter(c => c.type === 'tomorrow');
  const otherCats = store.timeCategories.filter(c => c.type === 'scheduled' || c.type === 'someday' || c.type === 'done');

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground capitalize mb-0.5">{today}</p>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {view === 'time' ? 'Мои задачи' : view === 'directions' ? 'Направления' : view === 'habits' ? 'Привычки' : 'Статистика'}
            </h1>
            {view === 'time' && totalToday > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {doneToday} из {totalToday + doneToday} выполнено сегодня
              </p>
            )}
          </div>
          <div className="w-9 h-9" />
        </div>

        {view === 'time' && (totalToday + doneToday) > 0 && (
          <div className="mt-4 bg-white rounded-2xl shadow-soft px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Прогресс дня</span>
              <span className="text-xs font-semibold text-primary">
                {Math.round((doneToday / (totalToday + doneToday)) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(doneToday / (totalToday + doneToday)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {view === 'time' && (
          <div className="mt-4 flex gap-1 bg-muted rounded-2xl p-1">
            {([
              { id: 'today' as const, label: 'Сегодня', count: totalToday },
              { id: 'tomorrow' as const, label: 'Завтра', count: totalTomorrow },
              { id: 'other' as const, label: 'Остальное', count: 0 },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setDayTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: dayTab === tab.id ? 'white' : 'transparent',
                  color: dayTab === tab.id ? 'hsl(220 15% 16%)' : 'hsl(220 10% 55%)',
                  boxShadow: dayTab === tab.id ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: dayTab === tab.id ? 'hsl(150 25% 42% / 0.15)' : 'transparent',
                      color: dayTab === tab.id ? 'hsl(150 25% 42%)' : 'hsl(220 10% 65%)',
                    }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'time' && (
          <div className="px-4 animate-fade-in" key={dayTab}>
            {(dayTab === 'today' ? todayCats : dayTab === 'tomorrow' ? tomorrowCats : otherCats).map(category => {
              const tasks = getTasksForTimeCategory(category.id);
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  tasks={tasks}
                  priorities={store.priorities}
                  directions={store.directions}
                  onToggleTask={store.toggleTask}
                  onUpdateTask={store.updateTask}
                  onDeleteTask={store.deleteTask}
                  onAddTask={store.addTask}
                  onOpenTask={setSelectedTask}
                  onUpdateCategory={(id, name) => store.updateTimeCategory(id, { name })}
                />
              );
            })}
          </div>
        )}

        {view === 'directions' && (
          <DirectionsView
            directions={store.directions}
            tasks={store.tasks}
            priorities={store.priorities}
            onToggleTask={store.toggleTask}
            onUpdateTask={store.updateTask}
            onDeleteTask={store.deleteTask}
            onAddTask={store.addTask}
            onOpenTask={setSelectedTask}
            onUpdateDirection={store.updateDirection}
            onAddDirection={store.addDirection}
            onDeleteDirection={store.deleteDirection}
          />
        )}

        {view === 'habits' && (
          <HabitsView
            habits={store.habits}
            onToggle={store.toggleHabit}
            onAdd={store.addHabit}
            onDelete={store.deleteHabit}
            onUpdate={store.updateHabit}
          />
        )}

        {view === 'stats' && (
          <StatsView
            tasks={store.tasks}
            habits={store.habits}
            directions={store.directions}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="px-4 pb-6 pt-3">
        <div className="bg-white rounded-2xl shadow-soft-md flex p-1.5 gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: view === item.id ? 'hsl(150 25% 42% / 0.12)' : 'transparent',
              }}
            >
              <Icon
                name={item.icon}
                fallback="Circle"
                size={20}
                style={{ color: view === item.id ? 'hsl(150 25% 42%)' : 'hsl(220 10% 55%)' }}
              />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: view === item.id ? 'hsl(150 25% 42%)' : 'hsl(220 10% 55%)' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={store.tasks.find(t => t.id === selectedTask.id) || selectedTask}
          priorities={store.priorities}
          directions={store.directions}
          timeCategories={store.timeCategories}
          onClose={() => setSelectedTask(null)}
          onUpdate={store.updateTask}
          onToggleSubtask={store.toggleSubtask}
          onAddSubtask={store.addSubtask}
          onDeleteSubtask={store.deleteSubtask}
          generateId={store.generateId}
        />
      )}

    </div>
  );
}