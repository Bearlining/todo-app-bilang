import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Todo, SubTask, TodoStats, DailySummary, DEFAULT_CATEGORIES } from '../types/todo';

// 状态类型
interface TodoState {
  todos: Todo[];
  categories: typeof DEFAULT_CATEGORIES;
  dailySummaries: DailySummary[];
}

// 动作类型
type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'LOAD_TODOS'; payload: Todo[] }
  | { type: 'LOAD_SUMMARIES'; payload: DailySummary[] }
  | { type: 'GENERATE_SUMMARY' }
  | { type: 'IMPORT_TODOS'; payload: Todo[] }
  | { type: 'ARCHIVE_TODOS'; payload: string[] }
  | { type: 'UNARCHIVE_TODOS'; payload: string[] }
  | { type: 'DELETE_TODOS'; payload: string[] }
  | { type: 'MOVE_CATEGORY'; payload: { ids: string[]; category: string } }
  | { type: 'ADD_SUBTASK'; payload: { todoId: string; subTask: SubTask } }
  | { type: 'UPDATE_SUBTASK'; payload: { todoId: string; subTask: SubTask } }
  | { type: 'DELETE_SUBTASK'; payload: { todoId: string; subTaskId: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { todoId: string; subTaskId: string } };

// 初始状态
const initialState: TodoState = {
  todos: [],
  categories: DEFAULT_CATEGORIES,
  dailySummaries: [],
};

// 创建Context
const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completedAt'>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (todo: Todo) => void;
  getStats: () => TodoStats;
  getTodayTodos: () => Todo[];
  getWeeklyData: () => DailySummary[];
  getMonthlyData: () => DailySummary[];
  importTodos: (todos: Todo[]) => void;
  exportTodos: () => string;
  archiveTodos: (ids: string[]) => void;
  unarchiveTodos: (ids: string[]) => void;
  deleteTodos: (ids: string[]) => void;
  moveCategory: (ids: string[], category: string) => void;
  searchTodos: (query: string) => Todo[];
  addSubTask: (todoId: string, title: string) => void;
  updateSubTask: (todoId: string, subTask: SubTask) => void;
  deleteSubTask: (todoId: string, subTaskId: string) => void;
  toggleSubTask: (todoId: string, subTaskId: string) => void;
} | null>(null);

// Reducer函数
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? {
                ...todo,
                isCompleted: !todo.isCompleted,
                completedAt: !todo.isCompleted ? new Date() : null,
              }
            : todo
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload),
      };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        ),
      };
    case 'LOAD_TODOS':
      // 确保向后兼容：为没有 subTasks 字段的旧数据添加空数组
      return {
        ...state,
        todos: action.payload.map((todo: Todo) => ({
          ...todo,
          subTasks: todo.subTasks || [],
          repeatType: todo.repeatType || 'none',
          repeatEndDate: todo.repeatEndDate || null,
        })),
      };
    case 'LOAD_SUMMARIES':
      return {
        ...state,
        dailySummaries: action.payload,
      };
    case 'GENERATE_SUMMARY':
      const today = new Date().toISOString().split('T')[0];
      const todayTodos = state.todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0];
        return todoDate === today;
      });
      const completed = todayTodos.filter(t => t.isCompleted).length;
      const newSummary: DailySummary = {
        date: today,
        total: todayTodos.length,
        completed,
        completionRate: todayTodos.length > 0 ? (completed / todayTodos.length) * 100 : 0,
      };
      return {
        ...state,
        dailySummaries: [...state.dailySummaries.filter(s => s.date !== today), newSummary],
      };
    case 'IMPORT_TODOS':
      // 合并导入的待办，保留已存在的数据
      const existingIds = new Set(state.todos.map(t => t.id));
      const newTodos = action.payload.filter(t => !existingIds.has(t.id));
      return {
        ...state,
        todos: [...state.todos, ...newTodos],
      };
    case 'ARCHIVE_TODOS':
      return {
        ...state,
        todos: state.todos.map(todo =>
          action.payload.includes(todo.id)
            ? { ...todo, isArchived: true, archivedAt: new Date() }
            : todo
        ),
      };
    case 'UNARCHIVE_TODOS':
      return {
        ...state,
        todos: state.todos.map(todo =>
          action.payload.includes(todo.id)
            ? { ...todo, isArchived: false, archivedAt: null }
            : todo
        ),
      };
    case 'DELETE_TODOS':
      return {
        ...state,
        todos: state.todos.filter(todo => !action.payload.includes(todo.id)),
      };
    case 'MOVE_CATEGORY':
      return {
        ...state,
        todos: state.todos.map(todo =>
          action.payload.ids.includes(todo.id)
            ? { ...todo, category: action.payload.category }
            : todo
        ),
      };
    case 'ADD_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? { ...todo, subTasks: [...(todo.subTasks || []), action.payload.subTask] }
            : todo
        ),
      };
    case 'UPDATE_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                subTasks: (todo.subTasks || []).map(st =>
                  st.id === action.payload.subTask.id ? action.payload.subTask : st
                ),
              }
            : todo
        ),
      };
    case 'DELETE_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.todoId
            ? {
                ...todo,
                subTasks: (todo.subTasks || []).filter(st => st.id !== action.payload.subTaskId),
              }
            : todo
        ),
      };
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        todos: state.todos.map(todo => {
          if (todo.id !== action.payload.todoId) return todo;
          const updatedSubTasks = (todo.subTasks || []).map(st =>
            st.id === action.payload.subTaskId
              ? { ...st, isCompleted: !st.isCompleted }
              : st
          );
          // 检查是否所有子任务都完成了
          const allCompleted = updatedSubTasks.length > 0 && updatedSubTasks.every(st => st.isCompleted);
          return {
            ...todo,
            subTasks: updatedSubTasks,
            isCompleted: allCompleted,
            completedAt: allCompleted ? new Date() : todo.isCompleted ? null : todo.completedAt,
          };
        }),
      };
    default:
      return state;
  }
}

// Provider组件
export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  // 从本地存储加载数据
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedSummaries = localStorage.getItem('dailySummaries');
    if (savedTodos) {
      dispatch({ type: 'LOAD_TODOS', payload: JSON.parse(savedTodos) });
    }
    if (savedSummaries) {
      dispatch({ type: 'LOAD_SUMMARIES', payload: JSON.parse(savedSummaries) });
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
    localStorage.setItem('dailySummaries', JSON.stringify(state.dailySummaries));
  }, [state.todos, state.dailySummaries]);

  // 添加待办事项
  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'completedAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completedAt: null,
      subTasks: todoData.subTasks || [],
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };

  // 切换完成状态
  const toggleTodo = (id: string) => {
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    // 处理周期循环待办
    if (!todo.isCompleted && todo.repeatType !== 'none') {
      // 检查是否超过重复结束日期
      if (todo.repeatEndDate && new Date(todo.repeatEndDate) < new Date()) {
        // 已超过结束日期，只标记为完成，不创建下一个
        dispatch({ type: 'TOGGLE_TODO', payload: id });
        return;
      }

      // 计算下一个截止日期
      const currentDueDate = todo.dueDate ? new Date(todo.dueDate) : new Date();
      let nextDueDate: Date;

      switch (todo.repeatType) {
        case 'daily':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate = new Date(currentDueDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        default:
          nextDueDate = currentDueDate;
      }

      // 创建新的待办实例（下一次循环）
      const newTodo: Todo = {
        ...todo,
        id: crypto.randomUUID(),
        dueDate: nextDueDate,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date(),
        subTasks: todo.subTasks?.map(st => ({
          ...st,
          id: crypto.randomUUID(),
          isCompleted: false,
        })) || [],
      };

      dispatch({ type: 'ADD_TODO', payload: newTodo });
    }

    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };

  // 删除待办事项
  const deleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  };

  // 更新待办事项
  const updateTodo = (todo: Todo) => {
    dispatch({ type: 'UPDATE_TODO', payload: todo });
  };

  // 获取统计数据
  const getStats = (): TodoStats => {
    const today = new Date().toISOString().split('T')[0];
    // 今日待办 = 今天创建的 或 截止日期在今天的（未完成的）
    const todayTodos = state.todos.filter(todo => {
      const createdDate = new Date(todo.createdAt).toISOString().split('T')[0];
      const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : null;
      return createdDate === today || dueDateStr === today;
    });
    // 今日已完成 = 今日待办中已完成的
    const todayCompleted = todayTodos.filter(t => t.isCompleted).length;
    const overdue = state.todos.filter(todo =>
      !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < new Date()
    ).length;

    return {
      total: state.todos.length,
      completed: state.todos.filter(t => t.isCompleted).length,
      pending: state.todos.filter(t => !t.isCompleted).length,
      todayTotal: todayTodos.length,
      todayCompleted,
      overdue,
      completionRate: state.todos.length > 0
        ? (state.todos.filter(t => t.isCompleted).length / state.todos.length) * 100
        : 0,
    };
  };

  // 获取今日待办（包括今天创建的 或 截止日期在今天的）
  const getTodayTodos = (): Todo[] => {
    const today = new Date().toISOString().split('T')[0];
    return state.todos.filter(todo => {
      const createdDate = new Date(todo.createdAt).toISOString().split('T')[0];
      const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : null;
      // 今天创建的 或 截止日期在今天的
      return createdDate === today || dueDateStr === today;
    }).sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });
  };

  // 获取近7天数据
  const getWeeklyData = (): DailySummary[] => {
    const data: DailySummary[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTodos = state.todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0];
        return todoDate === dateStr;
      });

      const completed = dayTodos.filter(t => t.isCompleted).length;
      data.push({
        date: dateStr,
        total: dayTodos.length,
        completed,
        completionRate: dayTodos.length > 0 ? (completed / dayTodos.length) * 100 : 0,
      });
    }
    return data;
  };

  // 获取近30天数据
  const getMonthlyData = (): DailySummary[] => {
    const data: DailySummary[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTodos = state.todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0];
        return todoDate === dateStr;
      });

      const completed = dayTodos.filter(t => t.isCompleted).length;
      data.push({
        date: dateStr,
        total: dayTodos.length,
        completed,
        completionRate: dayTodos.length > 0 ? (completed / dayTodos.length) * 100 : 0,
      });
    }
    return data;
  };

  // 归档待办事项
  const archiveTodos = (ids: string[]) => {
    dispatch({ type: 'ARCHIVE_TODOS', payload: ids });
  };

  // 取消归档待办事项
  const unarchiveTodos = (ids: string[]) => {
    dispatch({ type: 'UNARCHIVE_TODOS', payload: ids });
  };

  // 批量删除待办事项
  const deleteTodos = (ids: string[]) => {
    dispatch({ type: 'DELETE_TODOS', payload: ids });
  };

  // 批量移动分类
  const moveCategory = (ids: string[], category: string) => {
    dispatch({ type: 'MOVE_CATEGORY', payload: { ids, category } });
  };

  // 搜索待办事项
  const searchTodos = (query: string): Todo[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.todos.filter(todo =>
      !todo.isArchived &&
      (todo.title.toLowerCase().includes(q) ||
       todo.description.toLowerCase().includes(q) ||
       todo.tags.some(tag => tag.toLowerCase().includes(q)) ||
       state.categories.find(c => c.id === todo.category)?.name.toLowerCase().includes(q))
    );
  };

  // 添加子待办
  const addSubTask = (todoId: string, title: string) => {
    const subTask: SubTask = {
      id: crypto.randomUUID(),
      title,
      isCompleted: false,
    };
    dispatch({ type: 'ADD_SUBTASK', payload: { todoId, subTask } });
  };

  // 更新子待办
  const updateSubTask = (todoId: string, subTask: SubTask) => {
    dispatch({ type: 'UPDATE_SUBTASK', payload: { todoId, subTask } });
  };

  // 删除子待办
  const deleteSubTask = (todoId: string, subTaskId: string) => {
    dispatch({ type: 'DELETE_SUBTASK', payload: { todoId, subTaskId } });
  };

  // 切换子待办完成状态
  const toggleSubTask = (todoId: string, subTaskId: string) => {
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { todoId, subTaskId } });
  };

  // 导出待办事项为CSV格式
  const exportTodos = (): string => {
    // CSV表头
    const headers = ['标题', '描述', '完成状态', '优先级', '分类', '截止日期', '提醒时间', '创建时间', '完成时间', '子待办', '重复类型', '重复结束日期'];

    // 转换数据为CSV行
    const rows = state.todos.map(todo => {
      const category = state.categories.find(c => c.id === todo.category);
      // 将子待办序列化为JSON字符串
      const subTasksJson = JSON.stringify(todo.subTasks || []);
      return [
        `"${todo.title.replace(/"/g, '""')}"`,
        `"${todo.description.replace(/"/g, '""')}"`,
        todo.isCompleted ? '已完成' : '未完成',
        todo.priority,
        category?.name || todo.category,
        todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('zh-CN') : '',
        todo.reminderTime ? new Date(todo.reminderTime).toLocaleString('zh-CN') : '',
        new Date(todo.createdAt).toLocaleString('zh-CN'),
        todo.completedAt ? new Date(todo.completedAt).toLocaleString('zh-CN') : '',
        `"${subTasksJson.replace(/"/g, '""')}"`,
        todo.repeatType || 'none',
        todo.repeatEndDate ? new Date(todo.repeatEndDate).toLocaleDateString('zh-CN') : '',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // 导入待办事项
  const importTodos = (todos: Todo[]) => {
    dispatch({ type: 'IMPORT_TODOS', payload: todos });
  };

  return (
    <TodoContext.Provider
      value={{
        state,
        dispatch,
        addTodo,
        toggleTodo,
        deleteTodo,
        updateTodo,
        getStats,
        getTodayTodos,
        getWeeklyData,
        getMonthlyData,
        importTodos,
        exportTodos,
        archiveTodos,
        unarchiveTodos,
        deleteTodos,
        moveCategory,
        searchTodos,
        addSubTask,
        updateSubTask,
        deleteSubTask,
        toggleSubTask,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

// 自定义Hook
export function useTodo() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodo必须在TodoProvider内部使用');
  }
  return context;
}
