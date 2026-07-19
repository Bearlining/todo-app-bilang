// 子待办类型定义
export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

// 待办事项类型定义
export interface Todo {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[]; // 标签
  createdAt: Date;
  dueDate: Date | null;
  reminderTime: Date | null;
  completedAt: Date | null;
  isArchived: boolean; // 是否归档
  archivedAt: Date | null; // 归档时间
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly'; // 重复类型
  repeatEndDate: Date | null; // 重复结束日期
  subTasks: SubTask[];
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  todayTotal: number;
  todayCompleted: number;
  overdue: number;
  completionRate: number;
}

export interface Category {
  id: string;
  // 分类名(显示给用户)。注:为兼容旧的"工作"/"生活"数据,
  // 这里直接保留中文 default 值作为 fallback; i18n 化主要通过
  // 组件里读 DEFAULT_CATEGORY_KEYS[id] + t() 实现。
  name: string;
  color: string;
  icon: string;
}

export interface DailySummary {
  date: string;
  total: number;
  completed: number;
  completionRate: number;
}

// 马卡龙色板
export const MACARON_COLORS = {
  pink: '#FFB7B2',      // 粉红
  mint: '#B5EAD7',      // 薄荷绿
  lavender: '#E2F0CB',  // 淡紫（实际是浅黄绿）
  peach: '#FFDAC1',     // 桃色
  sky: '#C7CEEA',       // 天蓝
  cream: '#FFF5BA',     // 奶油黄
  coral: '#FF9AA2',     // 珊瑚红
  mintBlue: '#B5EAD7',  // 薄荷蓝
} as const;

export const PRIORITY_COLORS = {
  low: '#B5EAD7',      // 薄荷绿 - 低优先级
  medium: '#FFDAC1',   // 桃色 - 中优先级
  high: '#FFB7B2',     // 粉红 - 高优先级
} as const;

// 默认分类(用户的 category 字段会用这里的 id 和 name)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '工作', color: '#FFB7B2', icon: 'briefcase' },
  { id: 'life', name: '生活', color: '#B5EAD7', icon: 'home' },
  { id: 'study', name: '学习', color: '#C7CEEA', icon: 'book' },
  { id: 'health', name: '健康', color: '#FFDAC1', icon: 'heart' },
  { id: 'other', name: '其他', color: '#E2F0CB', icon: 'more-horizontal' },
];

// i18n key 映射(组件用 t(categoryKey[id]) 显示本地化名)
export const CATEGORY_KEYS: Record<string, string> = {
  work: 'category.work',
  life: 'category.life',
  study: 'category.study',
  health: 'category.health',
  other: 'category.other',
};
