export type Priority = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type SubTask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priorityId: string | null;
  dueDate: string | null;
  categoryId: string;
  listId: string | null;
  directionId: string | null;
  subtasks: SubTask[];
  notes: string;
  createdAt: string;
};

export type TaskList = {
  id: string;
  name: string;
  categoryId: string;
  color: string;
};

export type TimeCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'inbox' | 'today' | 'tomorrow' | 'scheduled' | 'done' | 'someday';
};

export type Direction = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
  createdAt: string;
};

export type AppView = 'time' | 'directions' | 'habits' | 'stats';