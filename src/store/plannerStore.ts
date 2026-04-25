import { useState, useCallback } from 'react';
import { Task, TaskList, TimeCategory, Direction, Habit, Priority, SubTask } from '@/types/planner';

const generateId = () => Math.random().toString(36).slice(2, 10);

const today = () => new Date().toISOString().split('T')[0];
const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const defaultPriorities: Priority[] = [
  { id: 'p1', name: 'Срочно', color: '#ef4444', order: 1 },
  { id: 'p2', name: 'Важно', color: '#f97316', order: 2 },
  { id: 'p3', name: 'Обычно', color: '#6b9e78', order: 3 },
  { id: 'p4', name: 'Когда-нибудь', color: '#94a3b8', order: 4 },
];

const defaultTimeCategories: TimeCategory[] = [
  { id: 'inbox', name: 'Входящие', icon: 'Inbox', color: '#6b7280', type: 'inbox' },
  { id: 'today', name: 'Сегодня', icon: 'Sun', color: '#f59e0b', type: 'today' },
  { id: 'tomorrow', name: 'Завтра', icon: 'Sunrise', color: '#8b5cf6', type: 'tomorrow' },
  { id: 'scheduled', name: 'Запланировано', icon: 'CalendarDays', color: '#3b82f6', type: 'scheduled' },
  { id: 'someday', name: 'Когда-нибудь', icon: 'Cloud', color: '#6b9e78', type: 'someday' },
  { id: 'done', name: 'Завершённые', icon: 'CheckCircle2', color: '#10b981', type: 'done' },
];

const defaultDirections: Direction[] = [
  { id: 'personal', name: 'Личное', icon: 'Heart', color: '#f43f5e' },
  { id: 'sport', name: 'Спорт', icon: 'Dumbbell', color: '#f97316' },
  { id: 'study', name: 'Учёба', icon: 'BookOpen', color: '#3b82f6' },
  { id: 'wishlist', name: 'Вишлист', icon: 'Star', color: '#eab308' },
];

const defaultHabits: Habit[] = [
  { id: 'h1', name: 'Утренняя зарядка', icon: '🌅', color: '#f97316', frequency: 'daily', completedDates: [], createdAt: today() },
  { id: 'h2', name: 'Читать книгу', icon: '📚', color: '#3b82f6', frequency: 'daily', completedDates: [], createdAt: today() },
  { id: 'h3', name: 'Медитация', icon: '🧘', color: '#8b5cf6', frequency: 'daily', completedDates: [], createdAt: today() },
];

const sampleTasks: Task[] = [
  {
    id: 't1', title: 'Проверить почту', done: false, priorityId: 'p3',
    dueDate: today(), categoryId: 'today', listId: null, directionId: 'personal',
    subtasks: [], notes: '', createdAt: today()
  },
  {
    id: 't2', title: 'Подготовить отчёт', done: false, priorityId: 'p1',
    dueDate: today(), categoryId: 'today', listId: null, directionId: null,
    subtasks: [
      { id: 'st1', title: 'Собрать данные', done: true },
      { id: 'st2', title: 'Написать выводы', done: false },
    ],
    notes: 'Не забыть добавить графики', createdAt: today()
  },
  {
    id: 't3', title: 'Купить продукты', done: false, priorityId: 'p3',
    dueDate: tomorrow(), categoryId: 'tomorrow', listId: null, directionId: 'personal',
    subtasks: [], notes: '', createdAt: today()
  },
  {
    id: 't4', title: 'Купить новые наушники', done: false, priorityId: 'p4',
    dueDate: null, categoryId: 'someday', listId: null, directionId: 'wishlist',
    subtasks: [], notes: 'Sony или Bose', createdAt: today()
  },
];

export function usePlannerStore() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [timeCategories, setTimeCategories] = useState<TimeCategory[]>(defaultTimeCategories);
  const [directions, setDirections] = useState<Direction[]>(defaultDirections);
  const [priorities, setPriorities] = useState<Priority[]>(defaultPriorities);
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...task, id: generateId(), createdAt: today() }]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const done = !t.done;
      return { ...t, done, categoryId: done ? 'done' : t.categoryId };
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st) };
    }));
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const subtask: SubTask = { id: generateId(), title, done: false };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...t.subtasks, subtask] } : t));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) } : t
    ));
  }, []);

  const addList = useCallback((list: Omit<TaskList, 'id'>) => {
    setLists(prev => [...prev, { ...list, id: generateId() }]);
  }, []);

  const updateList = useCallback((id: string, updates: Partial<TaskList>) => {
    setLists(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteList = useCallback((id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateTimeCategory = useCallback((id: string, updates: Partial<TimeCategory>) => {
    setTimeCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const updateDirection = useCallback((id: string, updates: Partial<Direction>) => {
    setDirections(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const addDirection = useCallback((dir: Omit<Direction, 'id'>) => {
    setDirections(prev => [...prev, { ...dir, id: generateId() }]);
  }, []);

  const deleteDirection = useCallback((id: string) => {
    setDirections(prev => prev.filter(d => d.id !== id));
  }, []);

  const updatePriority = useCallback((id: string, updates: Partial<Priority>) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    setHabits(prev => [...prev, { ...habit, id: generateId(), completedDates: [], createdAt: today() }]);
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const toggleHabit = useCallback((id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const has = h.completedDates.includes(date);
      return { ...h, completedDates: has ? h.completedDates.filter(d => d !== date) : [...h.completedDates, date] };
    }));
  }, []);

  const getTasksByCategory = useCallback((categoryId: string) => {
    return tasks.filter(t => t.categoryId === categoryId);
  }, [tasks]);

  const getTasksByDirection = useCallback((directionId: string) => {
    return tasks.filter(t => t.directionId === directionId && !t.done);
  }, [tasks]);

  const getTasksByList = useCallback((listId: string) => {
    return tasks.filter(t => t.listId === listId);
  }, [tasks]);

  return {
    tasks, lists, timeCategories, directions, priorities, habits,
    addTask, updateTask, deleteTask, toggleTask,
    toggleSubtask, addSubtask, deleteSubtask,
    addList, updateList, deleteList,
    updateTimeCategory, updateDirection, addDirection, deleteDirection,
    updatePriority,
    addHabit, updateHabit, deleteHabit, toggleHabit,
    getTasksByCategory, getTasksByDirection, getTasksByList,
    generateId,
    today, tomorrow,
  };
}
