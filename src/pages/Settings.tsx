import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Info,
  FileText,
  CheckCircle,
  AlertCircle,
  Palette,
  Globe
} from 'lucide-react';
import { useTodo } from '../context/TodoContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { themes, ThemeName } from '../lib/theme';
import { generateSyncLink } from '../lib/sync';
import { Card } from '../components/ui/card';
import { Todo, SubTask } from '../types/todo';

export function Settings() {
  const { state, importTodos, exportTodos, dispatch } = useTodo();
  const { theme, setTheme, themeNames } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [importStatus, setImportStatus] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 导出待办事项
  const handleExport = () => {
    const csvContent = exportTodos();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const locale = language === 'en' ? 'en-US' : 'zh-CN';
    const filename = t('settings.data.exportFilename').replace('{date}', new Date().toLocaleDateString(locale));
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 导入待办事项
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');

        // 跳过表头，解析CSV数据
        const importedTodos: Todo[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // 解析CSV行
          const fields = parseCSVLine(line);

          if (fields.length >= 4) {
            // 解析子待办（字段9）
            let subTasks: SubTask[] = [];
            if (fields[9]) {
              try {
                subTasks = JSON.parse(fields[9]);
              } catch (e) {
                subTasks = [];
              }
            }

            const todo: Todo = {
              id: crypto.randomUUID(),
              title: fields[0],
              description: fields[1],
              isCompleted: fields[2] === '已完成',
              priority: fields[3] as 'low' | 'medium' | 'high',
              category: fields[4] || 'default',
              tags: [],
              isArchived: false,
              archivedAt: null,
              repeatType: (fields[10] as 'none' | 'daily' | 'weekly' | 'monthly') || 'none',
              repeatEndDate: fields[11] ? new Date(fields[11]) : null,
              dueDate: fields[5] ? new Date(fields[5]) : null,
              reminderTime: null,
              createdAt: fields[7] ? new Date(fields[7]) : new Date(),
              completedAt: fields[8] ? new Date(fields[8]) : null,
              subTasks: subTasks,
            };
            importedTodos.push(todo);
          }
        }

        importTodos(importedTodos);
        setImportSuccess(true);
        setImportStatus(t('settings.data.importSuccess', { count: importedTodos.length }));
        setTimeout(() => setImportStatus(''), 3000);
      } catch (error) {
        setImportSuccess(false);
        setImportStatus(t('settings.data.importFailed'));
        setTimeout(() => setImportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 简单的CSV行解析函数
  const parseCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());

    return fields;
  };

  // 清除所有数据
  const handleClearData = () => {
    dispatch({ type: 'LOAD_TODOS', payload: [] });
    dispatch({ type: 'LOAD_SUMMARIES', payload: [] });
    setShowClearConfirm(false);
  };

  // 获取主题颜色用于显示
  const getThemePreviewColors = (themeName: ThemeName) => {
    const colors = themes[themeName].colors;
    return [
      colors.pink[100],
      colors.peach[100],
      colors.mint[100],
      colors.sky[100],
    ];
  };

  // 判断 importStatus 是否表示成功(用于配色),需要在所有语言下都识别
  // 思路:用独立的 success 状态而非字符串包含判断
  const [importSuccess, setImportSuccess] = useState(false);


  // 复制同步链接
  const handleCopySyncLink = async () => {
    const link = generateSyncLink(state.todos);
    try {
      await navigator.clipboard.writeText(link);
      setImportStatus(t('sync.linkCopied'));
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setImportStatus(t('sync.failed'));
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* 主题选择 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-200 to-purple-200">
              <Palette className="w-5 h-5 text-pink-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('settings.theme.title')}</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t('settings.theme.desc')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {themeNames.map(({ key, nameKey }) => {
              const colors = getThemePreviewColors(key);
              const isSelected = theme === key;

            
  // 复制同步链接
  const handleCopySyncLink = async () => {
    const link = generateSyncLink(state.todos);
    try {
      await navigator.clipboard.writeText(link);
      setImportStatus(t('sync.linkCopied'));
      setTimeout(() => setImportStatus(''), 3000);
    } catch {
      setImportStatus(t('sync.failed'));
    }
  };

  return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  <div className="flex gap-1 mb-2">
                    {colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-pink-600' : 'text-gray-600'
                  }`}>
                    {t(nameKey)}
                  </span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 text-pink-500 float-right" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 语言切换 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-200 to-mint-200">
              <Globe className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('settings.language.title')}</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t('settings.language.desc')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('zh')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                language === 'zh'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
              }`}
            >
              <span className={`text-sm font-medium ${
                language === 'zh' ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {t('settings.language.zh')}
              </span>
              {language === 'zh' && <CheckCircle className="w-4 h-4 text-pink-500" />}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                language === 'en'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-200'
              }`}
            >
              <span className={`text-sm font-medium ${
                language === 'en' ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {t('settings.language.en')}
              </span>
              {language === 'en' && <CheckCircle className="w-4 h-4 text-pink-500" />}
            </button>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-pink-200 to-peach-200">
              <FileText className="w-5 h-5 text-pink-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('settings.data.title')}</h2>
          </div>

          {/* 状态提示 */}
          {importStatus && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              importSuccess
                ? 'bg-mint-100 text-mint-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {importSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {importStatus}
            </div>
          )}

          <div className="space-y-3">
            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              disabled={state.todos.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-300 to-peach-300 text-white font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {t('settings.data.export')}
              {state.todos.length > 0 && (
                <span className="text-xs opacity-80">({state.todos.length}{t('common.unit.items')})</span>
              )}
            </button>

            {/* 导入按钮 */}
            <div className="relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-300 to-mint-300 text-white font-medium flex items-center justify-center gap-2 hover:shadow-md transition-all">
                <Upload className="w-4 h-4" />
                {t('settings.data.import')}
              </button>
            </div>
          </div>

                    </div>

          {/* 复制同步链接 */}
          <button
            onClick={handleCopySyncLink}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-lavender-50 to-peach-50 rounded-xl hover:from-lavender-100 hover:to-peach-100 transition-all duration-200 mt-3"
          >
            <Link2 className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-700">{t('sync.copyLink')}</div>
              <div className="text-xs text-gray-400">{t('sync.linkCopiedHint')}</div>
            </div>
          </button>

          <p className="mt-3 text-xs text-gray-400 text-center">
            {t('sync.howItWorksDesc')}
          </p>
        </Card>

        {/* 清除数据 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-200 to-orange-200">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('settings.clear.title')}</h2>
          </div>

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full py-3 px-4 rounded-xl bg-white/60 text-red-500 border border-red-200 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              {t('settings.clear.button')}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-600">
                {t('settings.clear.confirm')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/60 text-gray-600 font-medium hover:bg-white transition-all"
                >
                  {t('settings.clear.cancel')}
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-400 text-white font-medium hover:bg-red-500 transition-all"
                >
                  {t('settings.clear.confirmAction')}
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* 关于 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-200 to-mint-200">
              <Info className="w-5 h-5 text-sky-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">{t('settings.about.title')}</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('settings.about.appName')}</span>
              <span className="font-medium text-gray-800">{t('settings.about.appNameValue')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('settings.about.version')}</span>
              <span className="font-medium text-gray-800">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('settings.about.todoCount')}</span>
              <span className="font-medium text-gray-800">{state.todos.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('settings.about.completedCount')}</span>
              <span className="font-medium text-mint-600">{state.todos.filter(t => t.isCompleted).length}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
