import React, { useState, useEffect } from 'react';
import {
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  LayoutList,
  LayoutGrid,
  Grid3X3,
  Trash2,
  FolderInput,
  CheckSquare,
  X
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { useTranslation } from '../i18n';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { TodoCard } from '../components/todo/TodoCard';
import { CalendarView } from '../components/todo/CalendarView';
import { KanbanView } from '../components/todo/KanbanView';
import { Todo } from '../types/todo';

type FilterType = 'all' | 'pending' | 'completed' | 'overdue' | 'today' | 'week' | 'month';
type ViewType = 'list' | 'calendar' | 'kanban';

interface TodoListProps {
  showAddModal?: boolean;
  onAddClose?: () => void;
}

export function TodoList({ showAddModal = false, onAddClose }: TodoListProps) {
  const { state, toggleTodo, deleteTodo, archiveTodos, deleteTodos, moveCategory } = useTodo();
  const { t, language } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [view, setView] = useState<ViewType>('list');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // 监听编辑事件
  useEffect(() => {
    const handleEdit = (e: CustomEvent<Todo>) => {
      setEditingTodo(e.detail);
    };
    window.addEventListener('edit-todo', handleEdit as EventListener);
    return () => window.removeEventListener('edit-todo', handleEdit as EventListener);
  }, []);

  // 选择模式处理
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTodos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTodos.map(t => t.id)));
    }
  };

  const handleBatchArchive = () => {
    if (selectedIds.size > 0) {
      archiveTodos(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.size > 0) {
      deleteTodos(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
  };

  const handleBatchMoveCategory = (category: string) => {
    if (selectedIds.size > 0) {
      moveCategory(Array.from(selectedIds), category);
      setSelectedIds(new Set());
      setSelectionMode(false);
      setShowCategoryPicker(false);
    }
  };

  // 过滤待办事项
  const filteredTodos = state.todos.filter(todo => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!todo.title.toLowerCase().includes(query) &&
          !todo.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 日期区间过滤
    if (dateRange.start && todo.createdAt) {
      const todoDate = new Date(todo.createdAt);
      if (new Date(dateRange.start) > todoDate) {
        return false;
      }
    }
    if (dateRange.end && todo.createdAt) {
      const todoDate = new Date(todo.createdAt);
      if (new Date(dateRange.end) < todoDate) {
        return false;
      }
    }

    // 状态过滤
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'pending':
        return !todo.isCompleted;
      case 'completed':
        return todo.isCompleted;
      case 'overdue':
        return !todo.isCompleted && todo.dueDate && new Date(todo.dueDate) < now;
      case 'today':
        return todo.createdAt && new Date(todo.createdAt) >= today;
      case 'week':
        return todo.createdAt && new Date(todo.createdAt) >= weekAgo;
      case 'month':
        return todo.createdAt && new Date(todo.createdAt) >= monthAgo;
      default:
        return true;
    }
  }).sort((a, b) => {
    // 优先显示未完成的事项
    if (a.isCompleted === b.isCompleted) return 0;
    return a.isCompleted ? 1 : -1;
  });

  const handleEditTodo = (todo: Todo) => {
    window.dispatchEvent(new CustomEvent('edit-todo', { detail: todo }));
  };

  // 统计各状态数量
  const counts = {
    all: state.todos.length,
    pending: state.todos.filter(t => !t.isCompleted).length,
    completed: state.todos.filter(t => t.isCompleted).length,
    overdue: state.todos.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length,
    today: state.todos.filter(t => t.createdAt && new Date(t.createdAt) >= new Date(new Date().setHours(0, 0, 0, 0))).length,
    week: state.todos.filter(t => t.createdAt && new Date(t.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    month: state.todos.filter(t => t.createdAt && new Date(t.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
  };

  // 筛选选项配置
  const filterOptions = [
    { key: 'all', label: t('todolist.tabs.all'), icon: Filter, color: 'from-gray-300 to-gray-400' },
    { key: 'pending', label: t('todolist.tabs.pending'), icon: Clock, color: 'from-peach-300 to-orange-300' },
    { key: 'completed', label: t('todolist.tabs.completed'), icon: CheckCircle2, color: 'from-mint-300 to-green-300' },
    { key: 'overdue', label: t('todolist.tabs.overdue'), icon: AlertCircle, color: 'from-red-300 to-pink-300' },
    { key: 'today', label: t('todolist.tabs.today'), icon: Calendar, color: 'from-pink-300 to-peach-300' },
    { key: 'week', label: t('todolist.tabs.week'), icon: Calendar, color: 'from-sky-300 to-blue-300' },
    { key: 'month', label: t('todolist.tabs.month'), icon: Calendar, color: 'from-purple-300 to-violet-300' },
  ];

  // 视图选项
  const viewOptions = [
    { key: 'list', icon: LayoutList, label: t('todolist.view.list') },
    { key: 'calendar', icon: Grid3X3, label: t('todolist.view.calendar') },
    { key: 'kanban', icon: LayoutGrid, label: t('todolist.view.kanban') },
  ] as const;

  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* 标题行 */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              {selectionMode ? t('todolist.selectedCount', { count: selectedIds.size }) : t('todolist.title')}
            </h1>
            <div className="flex items-center gap-2">
              {selectionMode ? (
                <button
                  onClick={toggleSelectionMode}
                  className="p-2 rounded-full bg-gray-100 text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={toggleSelectionMode}
                  className="p-2 rounded-full bg-pink-100 text-pink-500"
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* 选择模式工具栏 */}
          {selectionMode && (
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-full text-sm bg-pink-100 text-pink-600 whitespace-nowrap"
              >
                {selectedIds.size === filteredTodos.length && filteredTodos.length > 0 ? t('todolist.actions.deselect') : t('todolist.actions.selectAll')}
              </button>
              <button
                onClick={handleBatchArchive}
                disabled={selectedIds.size === 0}
                className="px-3 py-1.5 rounded-full text-sm bg-sky-100 text-sky-600 whitespace-nowrap disabled:opacity-50"
              >
                {t('todolist.actions.batchArchive')}
              </button>
              <button
                onClick={() => setShowCategoryPicker(true)}
                disabled={selectedIds.size === 0}
                className="px-3 py-1.5 rounded-full text-sm bg-mint-100 text-mint-600 whitespace-nowrap disabled:opacity-50"
              >
                {t('todolist.actions.moveCategory')}
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={selectedIds.size === 0}
                className="px-3 py-1.5 rounded-full text-sm bg-red-100 text-red-500 whitespace-nowrap disabled:opacity-50"
              >
                {t('todolist.actions.delete')}
              </button>
            </div>
          )}

          {/* 过滤标签 - 非选择模式下显示 */}
          {!selectionMode && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filterOptions.map(item => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as FilterType)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${filter === item.key
                      ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                    }
                  `}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  <span className="text-xs opacity-80">({counts[item.key as FilterType]})</span>
                </button>
              ))}
            </div>
          )}

          {/* 日期区间筛选（显示在特定筛选下） */}
          {!selectionMode && ['week', 'month'].includes(filter) && (
            <div className="flex gap-2 mt-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 text-xs"
                placeholder={t('todolist.filter.startDate')}
              />
              <span className="text-gray-400 text-sm self-center">{t('todolist.filter.dateTo')}</span>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 text-xs"
                placeholder={t('todolist.filter.endDate')}
              />
            </div>
          )}

          {/* 视图切换 - 非选择模式下显示 */}
          {!selectionMode && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-pink-100">
              {viewOptions.map(item => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${view === item.key
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-white/60 text-gray-500 hover:bg-white'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-md mx-auto px-4 py-4">
        {/* 列表视图 */}
        {view === 'list' && (
          <>
            {filteredTodos.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-peach-100 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-pink-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {searchQuery ? t('todolist.empty.searchTitle') : t('todolist.empty.firstTitle')}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery ? t('todolist.empty.searchHint') : t('todolist.empty.firstHint')}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredTodos.map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={handleEditTodo}
                    isSelected={selectedIds.has(todo.id)}
                    onSelect={handleSelect}
                    selectionMode={selectionMode}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* 日历视图 */}
        {view === 'calendar' && (
          <CalendarView
            onEdit={(todo) => window.dispatchEvent(new CustomEvent('edit-todo', { detail: todo }))}
            onToggle={toggleTodo}
          />
        )}

        {/* 看板视图 */}
        {view === 'kanban' && (
          <KanbanView
            onEdit={(todo) => window.dispatchEvent(new CustomEvent('edit-todo', { detail: todo }))}
            onToggle={toggleTodo}
          />
        )}
      </main>

      {/* 分类选择器弹窗 */}
      {showCategoryPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('todolist.categoryPicker.title')}</h3>
              <button onClick={() => setShowCategoryPicker(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {state.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleBatchMoveCategory(cat.id)}
                  className="w-full p-3 rounded-xl bg-white border border-gray-100 hover:bg-pink-50 flex items-center gap-3 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-gray-700">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
