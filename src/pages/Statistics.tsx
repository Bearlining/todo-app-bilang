import React, { useMemo } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { ProgressRing } from '../components/ui/progress-ring';
import { MACARON_COLORS } from '../types/todo';
import { useTranslation } from '../i18n';

export function Statistics() {
  const { t, language } = useTranslation();
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const { state, getStats, getWeeklyData, getMonthlyData } = useTodo();
  const stats = getStats();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // 计算分类统计数据
  const categoryStats = useMemo(() => {
    const categories: Record<string, { total: number; completed: number; name: string }> = {};

    state.todos.forEach(todo => {
      if (!categories[todo.category]) {
        const categoryInfo = state.categories.find(c => c.id === todo.category);
        categories[todo.category] = {
          total: 0,
          completed: 0,
          name: categoryInfo?.name || todo.category,
        };
      }
      categories[todo.category].total++;
      if (todo.isCompleted) {
        categories[todo.category].completed++;
      }
    });

    return Object.entries(categories).map(([id, data]) => ({
      id,
      name: data.name,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    }));
  }, [state.todos, state.categories]);

  // 饼图数据
  const pieData = [
    { name: t('stats.completed'), value: stats.completed, color: MACARON_COLORS.mint },
    { name: t('stats.pendingLabel'), value: stats.pending, color: MACARON_COLORS.pink },
  ];

  // 周数据格式化
  const formattedWeeklyData = weeklyData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(locale, { weekday: 'short' }),
    completionRate: Math.round(item.completionRate),
  }));

  // 月数据格式化（最近30天）
  const formattedMonthlyData = monthlyData.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(locale, { month: 'numeric', day: 'numeric' }),
    completionRate: Math.round(item.completionRate),
  })).slice(-14); // 只显示最近14天，避免图表太密集

  // 月度统计摘要
  const monthlySummary = useMemo(() => {
    const data = monthlyData.slice(-30);
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const completed = data.reduce((sum, item) => sum + item.completed, 0);
    const avgRate = total > 0 ? completed / total : 0;
    const bestDay = data.reduce((best, item) =>
      item.completionRate > best.completionRate ? item : best, data[0] || { completionRate: 0 });
    return { total, completed, avgRate, bestDay };
  }, [monthlyData]);

  // 计算连续完成天数
  const streakDays = useMemo(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTodos = state.todos.filter(todo => {
        const todoDate = new Date(todo.createdAt).toISOString().split('T')[0];
        return todoDate === dateStr;
      });

      if (dayTodos.length === 0) continue;
      const completed = dayTodos.filter(t => t.isCompleted).length;
      if (completed >= dayTodos.length / 2) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [state.todos]);

  // 计算饼图角度
  const totalPie = pieData.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* 总体完成率 */}
        <Card className="p-6 bg-gradient-to-r from-sky-100 to-lavender-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">{t('stats.overallCompletionRate')}</h2>
              <p className="text-sm text-gray-600">
                {stats.completed} / {stats.total} {t('stats.completion')}
              </p>
            </div>
            <ProgressRing
              progress={stats.completionRate}
              size={100}
              color={MACARON_COLORS.mint}
              label={t('stats.completionRate')}
            />
          </div>
        </Card>

        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-200 to-peach-200">
                <TrendingUp className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-sm text-gray-600">{t('stats.streakLabel')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{streakDays} {t('stats.days')}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-mint-200 to-sky-200">
                <Clock className="w-4 h-4 text-mint-500" />
              </div>
              <span className="text-sm text-gray-600">{t('stats.pendingLabel')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
          </Card>
        </div>

        {/* 周完成趋势 - 使用纯CSS条形图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              {t('stats.weeklyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {formattedWeeklyData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500"
                    style={{
                      height: `${item.completionRate}%`,
                      minHeight: item.completionRate > 0 ? '4px' : '0',
                      background: `linear-gradient(180deg, ${MACARON_COLORS.mint} 0%, ${MACARON_COLORS.mint}80 100%)`,
                    }}
                  />
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 月度统计摘要 */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-200 to-lavender-200">
                <Calendar className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-xs text-gray-600">{t('stats.monthTotal')}</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{monthlySummary.total}</p>
            <p className="text-xs text-gray-400">{t('stats.taskCount')}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-mint-200 to-green-200">
                <CheckCircle2 className="w-4 h-4 text-mint-500" />
              </div>
              <span className="text-xs text-gray-600">{t('stats.monthCompleted')}</span>
            </div>
            <p className="text-xl font-bold text-mint-600">{monthlySummary.completed}</p>
            <p className="text-xs text-gray-400">{t('stats.completed')}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-peach-200 to-orange-200">
                <TrendingUp className="w-4 h-4 text-peach-500" />
              </div>
              <span className="text-xs text-gray-600">{t('stats.monthlyAvg')}</span>
            </div>
            <p className="text-xl font-bold text-peach-600">{Math.round(monthlySummary.avgRate * 100)}%</p>
            <p className="text-xs text-gray-400">{t('stats.average')}</p>
          </Card>
        </div>

        {/* 月度趋势图 - 使用折线图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-mint-400" />
              {t('stats.monthlyTrend14')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-32">
              {/* Y轴标签 */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-1">
                <span className="text-xs text-gray-400">100%</span>
                <span className="text-xs text-gray-400">50%</span>
                <span className="text-xs text-gray-400">0%</span>
              </div>
              {/* 图表区域 */}
              <div className="ml-8 h-full relative">
                {/* 网格线 */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-gray-100" />
                  <div className="border-t border-gray-100" />
                  <div className="border-t border-gray-100" />
                </div>
                {/* 折线图 */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={MACARON_COLORS.mint} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={MACARON_COLORS.mint} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* 填充区域 */}
                  <polygon
                    fill="url(#monthlyGradient)"
                    points={formattedMonthlyData.map((item, index) => {
                      const x = (index / (formattedMonthlyData.length - 1)) * 100;
                      const y = 100 - item.completionRate;
                      return `${x}% ${y}%`;
                    }).join(', ') + ',100% 100%,0% 100%'}
                  />
                  {/* 折线 */}
                  <polyline
                    fill="none"
                    stroke={MACARON_COLORS.mint}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={formattedMonthlyData.map((item, index) => {
                      const x = (index / (formattedMonthlyData.length - 1)) * 100;
                      const y = 100 - item.completionRate;
                      return `${x}% ${y}%`;
                    }).join(', ')}
                  />
                  {/* 数据点 */}
                  {formattedMonthlyData.map((item, index) => {
                    const x = (index / (formattedMonthlyData.length - 1)) * 100;
                    const y = 100 - item.completionRate;
                    return (
                      <circle
                        key={index}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        fill={MACARON_COLORS.mint}
                        className="transition-all duration-300 hover:r-4"
                      />
                    );
                  })}
                </svg>
                {/* X轴标签 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  {formattedMonthlyData.filter((_, i) => i % 3 === 0 || i === formattedMonthlyData.length - 1).map((item, index) => (
                    <span key={index} className="text-xs text-gray-400">{item.date}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分类完成情况 - 水平条形图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-mint-400" />
              {t('stats.categoryCompletion')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryStats.length === 0 ? (
              <p className="text-center text-gray-400 py-4">{t('common.empty')}</p>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-xs text-gray-500">{Math.round(cat.completionRate)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.completionRate}%`,
                          backgroundColor: state.categories.find(c => c.id === cat.id)?.color || '#ccc',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 完成分布 - 纯CSS饼图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-peach-400" />
              {t('stats.completionDist')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36 rounded-full" style={{ background: `conic-gradient(${pieData.map((item, index) => {
                const angle = totalPie > 0 ? (item.value / totalPie) * 360 : 0;
                const startAngle = currentAngle;
                currentAngle += angle;
                return `${item.color} ${startAngle}deg ${currentAngle}deg`;
              }).join(', ')})` }}>
                <div className="absolute inset-4 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 分类详情列表 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('stats.categoryDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: state.categories.find(c => c.id === cat.id)?.color || '#ccc' }}
                >
                  {cat.completed}/{cat.total}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    <span className="text-xs text-gray-500">{Math.round(cat.completionRate)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.completionRate}%`,
                        backgroundColor: state.categories.find(c => c.id === cat.id)?.color || '#ccc',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <p className="text-center text-gray-400 py-4">{t('stats.noCategoryData')}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
