import React, { useState, useEffect } from 'react';
import { TodoProvider } from './context/TodoContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider, useTranslation } from './i18n';
import { FallingItemsProvider, FallingItemsLayer } from './components/ui/FallingItems';
import { Dashboard } from './pages/Dashboard';
import { TodoList } from './pages/TodoList';
import { AddTodo } from './pages/AddTodo';
import { EditTodo } from './pages/EditTodo';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';
import { Home, List, TrendingUp, Settings as SettingsIcon, Plus } from 'lucide-react';
import { initTheme } from './lib/theme';

type TabType = 'dashboard' | 'todos' | 'statistics' | 'settings';

function AppContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, []);

  // 监听编辑待办事件
  useEffect(() => {
    const handleEditTodo = () => {
      setShowEditModal(true);
    };
    window.addEventListener('edit-todo', handleEditTodo);
    return () => window.removeEventListener('edit-todo', handleEditTodo);
  }, []);

  // 渲染当前页面
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'todos':
        return <TodoList />;
      case 'statistics':
        return <Statistics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <ThemeProvider>
      <TodoProvider>
        <FallingItemsProvider>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-mint-50">
          {/* 主内容 */}
          <main className="pb-20">
            {renderContent()}
          </main>

          {/* 添加按钮（右上角固定，留出安全边距） */}
          <button
            onClick={() => setShowAddModal(true)}
            className="fixed top-4 right-16 z-40 w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-peach-400 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* 底部Tab导航栏 - 4个均匀分布 */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 z-50">
            <div className="max-w-md mx-auto flex justify-around items-center py-2 px-2">
              {/* 首页Tab */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  activeTab === 'dashboard'
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
                <span className="text-xs mt-1 font-medium">{t('nav.dashboard')}</span>
                {activeTab === 'dashboard' && (
                  <div className="absolute bottom-0 w-6 h-1 bg-gradient-to-r from-pink-400 to-peach-400 rounded-full" />
                )}
              </button>

              {/* 待办列表Tab */}
              <button
                onClick={() => setActiveTab('todos')}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  activeTab === 'todos'
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className={`w-5 h-5 ${activeTab === 'todos' ? 'scale-110' : ''}`} />
                <span className="text-xs mt-1 font-medium">{t('nav.todos')}</span>
                {activeTab === 'todos' && (
                  <div className="absolute bottom-0 w-6 h-1 bg-gradient-to-r from-pink-400 to-peach-400 rounded-full" />
                )}
              </button>

              {/* 统计Tab */}
              <button
                onClick={() => setActiveTab('statistics')}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  activeTab === 'statistics'
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${activeTab === 'statistics' ? 'scale-110' : ''}`} />
                <span className="text-xs mt-1 font-medium">{t('nav.statistics')}</span>
                {activeTab === 'statistics' && (
                  <div className="absolute bottom-0 w-6 h-1 bg-gradient-to-r from-pink-400 to-peach-400 rounded-full" />
                )}
              </button>

              {/* 设置Tab */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  activeTab === 'settings'
                    ? 'text-pink-500 bg-pink-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <SettingsIcon className={`w-5 h-5 ${activeTab === 'settings' ? 'scale-110' : ''}`} />
                <span className="text-xs mt-1 font-medium">{t('nav.settings')}</span>
                {activeTab === 'settings' && (
                  <div className="absolute bottom-0 w-6 h-1 bg-gradient-to-r from-pink-400 to-peach-400 rounded-full" />
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* 添加待办弹窗 */}
        {showAddModal && (
          <AddTodo onClose={() => setShowAddModal(false)} />
        )}

        {/* 编辑待办弹窗 */}
        {showEditModal && (
          <EditTodo onClose={() => setShowEditModal(false)} />
        )}

        {/* 彩蛋动画层 */}
        <FallingItemsLayer />
        </FallingItemsProvider>
      </TodoProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
