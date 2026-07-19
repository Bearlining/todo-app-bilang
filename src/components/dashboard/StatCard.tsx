import React from 'react';
import { useTranslation } from '../i18n';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  const { t } = useTranslation();
  return (
    <Card
      variant="colored-border"
      decorationColor={color}
      className="p-4 hover:scale-105 transition-transform duration-300"
    >
      <div className="flex items-start gap-3">
        {/* Small icon with colored background */}
        <div
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      {trend && (
        <div className={cn(
          "mt-3 text-xs font-medium",
          trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-gray-400"
        )}>
          {trend === 'up' ? t('stats.trend.up') : trend === 'down' ? t('stats.trend.down') : t('stats.trend.neutral')}
        </div>
      )}
    </Card>
  );
}
