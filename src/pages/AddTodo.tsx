import React, { useState } from 'react';
import { X, Calendar, Tag, Repeat } from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PRIORITY_COLORS } from '../types/todo';
import { useTranslation } from '../i18n';

interface AddTodoProps {
  onClose: () => void;
}

export function AddTodo({ onClose }: AddTodoProps) {
  const { addTodo, state } = useTodo();
  const { t, language } = useTranslation();
  const locale = language === 'en' ? 'en-US' : 'zh-CN';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState(state.categories[0]?.id || 'other');
  const [dueDate, setDueDate] = useState('');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [repeatEndDate, setRepeatEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(t('todoForm.alert.noTitle'));
      return;
    }

    addTodo({
      title: title.trim(),
      description: description.trim(),
      isCompleted: false,
      priority,
      category,
      tags: [],
      isArchived: false,
      archivedAt: null,
      repeatType,
      repeatEndDate: repeatEndDate ? new Date(repeatEndDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      reminderTime: null,
      subTasks: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-pink-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">{t('todoForm.addTitle')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-pink-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('todoForm.field.title')} <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder={t('todoForm.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('todoForm.field.description')}
            </label>
            <textarea
              placeholder={t('todoForm.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24 px-4 py-3 rounded-xl border border-pink-200 bg-white/60 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-200 backdrop-blur-sm resize-none"
            />
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('todoForm.field.priority')}
            </label>
            <div className="flex gap-2">
              {[
                { key: 'high', label: t('todoForm.priority.high'), color: PRIORITY_COLORS.high },
                { key: 'medium', label: t('todoForm.priority.medium'), color: PRIORITY_COLORS.medium },
                { key: 'low', label: t('todoForm.priority.low'), color: PRIORITY_COLORS.low },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPriority(item.key as 'low' | 'medium' | 'high')}
                  className={`
                    flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${priority === item.key
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                    }
                  `}
                  style={{
                    backgroundColor: priority === item.key ? item.color : undefined,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-pink-400" />
              {t('todoForm.field.category')}
            </label>
            <div className="flex flex-wrap gap-2">
              {state.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${category === cat.id
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                    }
                  `}
                  style={{
                    backgroundColor: category === cat.id ? cat.color : undefined,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-mint-400" />
              {t('todoForm.field.dueDate')}
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-gray-600"
            />
          </div>

          {/* 周期循环 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-sky-400" />
              {t('todoForm.repeat.none')}
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'none', label: t('todoForm.repeat.none') },
                { key: 'daily', label: t('todoForm.repeat.daily') },
                { key: 'weekly', label: t('todoForm.repeat.weekly') },
                { key: 'monthly', label: t('todoForm.repeat.monthly') },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRepeatType(item.key as 'none' | 'daily' | 'weekly' | 'monthly')}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${repeatType === item.key
                      ? 'bg-sky-400 text-white shadow-md'
                      : 'bg-white/60 text-gray-600 hover:bg-white border border-gray-200'
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 重复结束日期 */}
          {repeatType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('todoForm.field.dueDate')}
              </label>
              <Input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
                className="text-gray-600"
              />
            </div>
          )}

          {/* 提交按钮 */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={!title.trim()}
            >
              {t('todoForm.add')}
            </Button>
          </div>
        </form>

        {/* 底部安全区域 */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );
}
