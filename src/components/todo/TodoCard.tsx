import React, { useState, useContext } from 'react';
import { Check, Trash2, Edit2, Bell, Clipboard, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import { Todo, SubTask, PRIORITY_COLORS } from '../../types/todo';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { OfficeDecoration } from '../ui/office-decoration';
import { useFallingItems } from '../ui/FallingItems';
import { cn } from '../../lib/utils';
import { useTodo } from '../../context/TodoContext';
import { useTranslation } from '../../i18n';

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onArchive?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
}

// 彩蛋触发概率 25%
const EASTER_EGG_PROBABILITY = 0.25;

export function TodoCard({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onArchive,
  isSelected = false,
  onSelect,
  selectionMode = false
}: TodoCardProps) {
  const { state, addSubTask, deleteSubTask, toggleSubTask } = useTodo();
  const { triggerFallingItems } = useFallingItems();
  const { t, language } = useTranslation();
  const locale = language === 'en' ? 'en-US' : 'zh-CN';
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const priorityColor = PRIORITY_COLORS[todo.priority];
  const category = state.categories.find(c => c.id === todo.category);
  const subTasks = todo.subTasks || [];
  const completedSubTasks = subTasks.filter(st => st.isCompleted).length;
  const hasSubTasks = subTasks.length > 0;
  const allSubTasksCompleted = hasSubTasks && completedSubTasks === subTasks.length;

  // 处理完成状态切换，触发彩蛋
  const handleToggle = () => {
    // 如果有子待办且未全部完成，禁止勾选
    if (hasSubTasks && !allSubTasksCompleted) {
      return;
    }
    // 如果是标记为完成状态，有概率触发彩蛋
    if (!todo.isCompleted && Math.random() < EASTER_EGG_PROBABILITY) {
      triggerFallingItems(todo.category || 'other');
    }
    onToggle(todo.id);
  };

  // 处理点击展开/收起
  const handleCardClick = (e: React.MouseEvent) => {
    // 如果点击的是复选框或编辑按钮，不触发展开
    if ((e.target as HTMLElement).closest('.checkbox-area') ||
        (e.target as HTMLElement).closest('.edit-button') ||
        (e.target as HTMLElement).closest('.expand-button')) {
      return;
    }
    // 始终允许展开/收起（有子待办时或显示添加按钮时）
    setIsExpanded(!isExpanded);
  };

  // 添加子待办
  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      addSubTask(todo.id, newSubTaskTitle.trim());
      setNewSubTaskTitle('');
      setShowAddInput(false);
    }
  };

  // 根据优先级选择装饰图标
  const getDecorationIcon = () => {
    switch (todo.priority) {
      case 'high': return 'clipboard';
      case 'medium': return 'pencil';
      default: return 'sticky';
    }
  };

  return (
    <>
      <Card
        variant="colored-border"
        decorationColor={category?.color || priorityColor}
        className={cn(
          "p-4 transition-all duration-300 group relative overflow-hidden",
          todo.isCompleted ? "bg-gray-50/50" : "bg-white/90",
          isSelected && "ring-2 ring-pink-400",
        )}
        onClick={handleCardClick}
      >
        {/* Office decoration icon */}
        <OfficeDecoration
          type={getDecorationIcon() as any}
          position="top-right"
          size="sm"
          color={category?.color || priorityColor}
          opacity={0.4}
        />

        <div className="flex items-start gap-3">
          {/* Selection checkbox in selection mode */}
          {selectionMode ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(todo.id, !isSelected);
              }}
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0",
                isSelected
                  ? "bg-pink-400 border-pink-400"
                  : "border-gray-300"
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          ) : (
            <div className="checkbox-area">
              <Checkbox
                checked={todo.isCompleted}
                onCheckedChange={handleToggle}
                disabled={hasSubTasks && !allSubTasksCompleted}
                className={cn(hasSubTasks && !allSubTasksCompleted && "opacity-50")}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0"
                style={{ backgroundColor: priorityColor }}
              >
                {todo.priority === 'high' ? t('todoForm.priority.high') : todo.priority === 'medium' ? t('todoForm.priority.medium') : t('todoForm.priority.low')}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-xs text-white flex-shrink-0"
                style={{ backgroundColor: category?.color || '#ccc' }}
              >
                {category?.name || todo.category}
              </span>
              {todo.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                >
                  #{tag}
                </span>
              ))}
              {todo.reminderTime && (
                <span className="flex items-center gap-1 text-xs text-pink-400">
                  <Bell className="w-3 h-3" />
                </span>
              )}
              {todo.repeatType !== 'none' && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-600 flex-shrink-0">
                  {todo.repeatType === 'daily' ? t('todoCard.repeat.daily') : todo.repeatType === 'weekly' ? t('todoCard.repeat.weekly') : t('todoCard.repeat.monthly')}
                </span>
              )}
              {/* 子待办进度徽章 */}
              {hasSubTasks && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs flex-shrink-0",
                    allSubTasksCompleted
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {t('todoCard.subtaskProgress', { done: completedSubTasks, total: subTasks.length })}
                </span>
              )}
            </div>

            <h3
              className={cn(
                "text-base font-medium text-gray-800 mb-1",
                todo.isCompleted && "line-through text-gray-400"
              )}
            >
              {todo.title}
            </h3>

            {todo.description && (
              <p className={cn(
                "text-sm text-gray-500 line-clamp-2",
                todo.isCompleted && "line-through"
              )}>
                {todo.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
              {todo.dueDate && (
                <span className={cn(
                  todo.dueDate < new Date() && !todo.isCompleted && "text-red-400"
                )}>
                  {t('todoCard.dueDate', { date: new Date(todo.dueDate).toLocaleDateString(locale) })}
                </span>
              )}
              <span>
                {new Date(todo.createdAt).toLocaleDateString(locale)}
              </span>
            </div>
          </div>

          {/* 展开/收起按钮 */}
          {!selectionMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="expand-button p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}

          {/* Action buttons (only in non-selection mode) */}
          {!selectionMode && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(todo);
                }}
                className="edit-button h-8 w-8 hover:bg-blue-50"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* 子待办列表展开区域 */}
      {isExpanded && (
        <div className="mt-1 ml-4 pl-4 border-l-2 border-pink-200 space-y-2">
          {subTasks.map((subTask) => (
            <div
              key={subTask.id}
              className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg group"
            >
              <Checkbox
                checked={subTask.isCompleted}
                onCheckedChange={() => toggleSubTask(todo.id, subTask.id)}
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  subTask.isCompleted && "line-through text-gray-400"
                )}
              >
                {subTask.title}
              </span>
              <button
                onClick={() => deleteSubTask(todo.id, subTask.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}

          {/* 添加子待办输入框 */}
          {showAddInput ? (
            <div className="flex items-center gap-2 py-2">
              <Input
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                placeholder={t('todoForm.subtaskPlaceholder')}
                className="flex-1 h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubTask();
                  if (e.key === 'Escape') {
                    setShowAddInput(false);
                    setNewSubTaskTitle('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAddSubTask}
                className="h-8 px-3"
              >
                {t('todoForm.add')}
              </Button>
              <button
                onClick={() => {
                  setShowAddInput(false);
                  setNewSubTaskTitle('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddInput(true)}
              className="flex items-center gap-1 py-2 text-sm text-pink-400 hover:text-pink-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('todoForm.subtask.add')}
            </button>
          )}
        </div>
      )}
    </>
  );
}
