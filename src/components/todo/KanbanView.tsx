import React, { useMemo } from 'react';
import { useTodo } from '../../context/TodoContext';
import { TodoCard } from './TodoCard';
import { Card } from '../ui/card';
import { PRIORITY_COLORS } from '../../types/todo';
import { useTranslation } from '../../i18n';

interface KanbanViewProps {
  onEdit: (todo: any) => void;
  onToggle: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function KanbanView({ onEdit, onToggle, onArchive }: KanbanViewProps) {
  const { state } = useTodo();
  const { t } = useTranslation();

  // Group todos by category
  const todosByCategory = useMemo(() => {
    const grouped: Record<string, typeof state.todos> = {};

    // Add all categories
    state.categories.forEach(cat => {
      grouped[cat.id] = [];
    });

    // Add uncategorized todos
    grouped['other'] = [];

    // Group todos by category
    state.todos
      .filter(todo => !todo.isArchived)
      .forEach(todo => {
        if (!grouped[todo.category]) {
          grouped[todo.category] = [];
        }
        grouped[todo.category].push(todo);
      });

    return grouped;
  }, [state.todos, state.categories]);

  // Separate pending and completed
  const pendingTodos = useMemo(() => {
    const pending: Record<string, typeof state.todos> = {};
    const completed: Record<string, typeof state.todos> = {};

    Object.entries(todosByCategory).forEach(([category, todos]) => {
      pending[category] = todos.filter(t => !t.isCompleted);
      completed[category] = todos.filter(t => t.isCompleted);
    });

    return { pending, completed };
  }, [todosByCategory]);

  const totalPending = Object.values(pendingTodos.pending || {}).reduce((sum, todos) => sum + (todos as typeof state.todos).length, 0);
  const totalCompleted = Object.values(pendingTodos.completed || {}).reduce((sum, todos) => sum + (todos as typeof state.todos).length, 0);

  const getCategoryInfo = (categoryId: string) => {
    return state.categories.find(c => c.id === categoryId) || {
      id: categoryId,
      name: t('kanban.otherCategory'),
      color: '#ccc',
      icon: 'more-horizontal'
    };
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-r from-peach-100 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-peach-600">{totalPending}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('kanban.column.todo')}</p>
              <p className="text-xs text-gray-400">{t('kanban.groupByCategory')}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-mint-100 to-sky-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-mint-600">{totalCompleted}</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('kanban.column.done')}</p>
              <p className="text-xs text-gray-400">{t('kanban.groupByCategory')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kanban columns */}
      <div className="space-y-4">
        {state.categories.map(category => {
          const pending = pendingTodos.pending?.[category.id] || [];
          const completed = (pendingTodos.completed?.[category.id] as typeof state.todos) || [];
          const categoryInfo = getCategoryInfo(category.id);

          return (
            <div key={category.id}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoryInfo.color }}
                />
                <h3 className="font-medium text-gray-800">{categoryInfo.name}</h3>
                <span className="text-xs text-gray-400">
                  ({pending.length + completed.length})
                </span>
              </div>

              {/* Pending column */}
              {pending.length > 0 && (
                <div className="space-y-2 mb-3">
                  {pending.map(todo => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={() => {}}
                      onEdit={onEdit}
                      onArchive={onArchive}
                    />
                  ))}
                </div>
              )}

              {/* Completed column */}
              {completed.length > 0 && (
                <div className="space-y-2 opacity-60">
                  {completed.slice(0, 3).map(todo => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={() => {}}
                      onEdit={onEdit}
                    />
                  ))}
                  {completed.length > 3 && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      {t('kanban.moreCompleted', { count: completed.length - 3 })}
                    </p>
                  )}
                </div>
              )}

              {pending.length === 0 && completed.length === 0 && (
                <div className="py-4 text-center text-gray-400 text-sm">
                  {t('kanban.empty')}
                </div>
              )}
            </div>
          );
        })}

        {/* Other category */}
        {(pendingTodos.pending?.['other']?.length > 0 || pendingTodos.completed?.['other']?.length > 0) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <h3 className="font-medium text-gray-800">{t('kanban.otherCategory')}</h3>
            </div>
            <div className="space-y-2">
              {(pendingTodos.pending?.['other'] || []).map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onDelete={() => {}}
                  onEdit={onEdit}
                  onArchive={onArchive}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
