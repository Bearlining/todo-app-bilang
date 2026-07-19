import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Calendar,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { useTranslation } from '../i18n';
import { StatCard } from '../components/dashboard/StatCard';
import { ProgressRing } from '../components/ui/progress-ring';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TodoCard } from '../components/todo/TodoCard';
import { OfficeDecoration } from '../components/ui/office-decoration';
import { Todo } from '../types/todo';

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'todos' | 'statistics') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { getStats, getTodayTodos, toggleTodo, deleteTodo } = useTodo();
  const { t, language } = useTranslation();
  const stats = getStats();
  const todayTodos = getTodayTodos();
  const [greeting, setGreeting] = useState('');

  // 根据时间设置问候语
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t('dashboard.greeting.morning'));
    } else if (hour < 18) {
      setGreeting(t('dashboard.greeting.afternoon'));
    } else {
      setGreeting(t('dashboard.greeting.evening'));
    }
  }, [language, t]);

  // 编辑待办事项
  const handleEditTodo = (todo: Todo) => {
    // 设置编辑的待办事项
    window.dispatchEvent(new CustomEvent('edit-todo', { detail: todo }));
  };

  const dateLocale = language === 'en' ? 'en-US' : 'zh-CN';
  const suffix = language === 'en' ? 'En' : '';

  return (
    <div className="min-h-screen">
      {/* 头部 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{greeting}</h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString(dateLocale, {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* 今日完成率 */}
        <Card className="p-6 bg-gradient-to-r from-pink-100 to-peach-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{t(`dashboard.completionRate.title${suffix}`)}</h2>
              <p className="text-sm text-gray-600">
                {stats.todayCompleted} / {stats.todayTotal} {t(`dashboard.completionRate.completed${suffix}`)}
              </p>
            </div>
            <ProgressRing
              progress={stats.todayTotal > 0 ? (stats.todayCompleted / stats.todayTotal) * 100 : 0}
              size={80}
              color="#FFB7B2"
              label={t('dashboard.title.today')}
            />
          </div>
        </Card>

        {/* 超期提醒 */}
        {stats.overdue > 0 && (
          <Card className="bg-gradient-to-r from-red-100 to-peach-100 border-0">
            <div className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-full bg-red-200">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{t(`dashboard.overdue.title${suffix}`)}</p>
                <p className="text-sm text-gray-600">{t(`dashboard.overdue.desc${suffix}`, { count: stats.overdue })}</p>
              </div>
              <Button
                variant="macaron"
                size="sm"
                onClick={() => onNavigate('todos')}
              >
                {t(`dashboard.overdue.view${suffix}`)}
              </Button>
            </div>
          </Card>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title={t('dashboard.stat.totalTodos')}
            value={stats.total}
            subtitle={t('dashboard.stat.totalTodosDesc')}
            icon={Clock}
            color="#FFB7B2"
          />
          <StatCard
            title={t('dashboard.stat.completed')}
            value={stats.completed}
            subtitle={t('dashboard.stat.completedDesc')}
            icon={CheckCircle2}
            color="#B5EAD7"
          />
          <StatCard
            title={t('dashboard.stat.pending')}
            value={stats.pending}
            subtitle={t('dashboard.stat.pendingDesc')}
            icon={AlertCircle}
            color="#FFDAC1"
          />
          <StatCard
            title={t('dashboard.stat.completionRate')}
            value={`${Math.round(stats.completionRate)}%`}
            subtitle={t('dashboard.stat.completionRateDesc')}
            icon={TrendingUp}
            color="#C7CEEA"
          />
        </div>

        {/* 今日待办 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-400" />
                {t(`dashboard.todayTodos.title${suffix}`)}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('todos')}
                className="text-pink-400 hover:text-pink-500"
              >
                {t(`dashboard.todayTodos.viewAll${suffix}`)}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTodos.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-mint-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-mint-400" />
                </div>
                <p className="text-gray-500 text-sm">{t(`dashboard.todayTodos.empty${suffix}`)}</p>
                <p className="text-xs text-gray-400 mt-1">{t(`dashboard.todayTodos.emptyHint${suffix}`)}</p>
              </div>
            ) : (
              todayTodos.slice(0, 5).map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={handleEditTodo}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* 快捷统计 */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">{t(`dashboard.overview.title${suffix}`)}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-xl bg-pink-50">
              <p className="text-2xl font-bold text-pink-500">{stats.todayTotal}</p>
              <p className="text-xs text-gray-500">{t(`dashboard.overview.newToday${suffix}`)}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-mint-50">
              <p className="text-2xl font-bold text-mint-500">{stats.completed}</p>
              <p className="text-xs text-gray-500">{t(`dashboard.overview.totalCompleted${suffix}`)}</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
