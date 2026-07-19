import React from 'react';
import { I18nContext } from '../../i18n';

const searilizeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  static contextType = I18nContext;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const ctx = this.context as React.ContextType<typeof I18nContext> | null;
      const t = ctx?.t ?? ((key: string) => key);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-peach-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🥺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {t('error.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('error.desc')}
            </p>
            <pre className="mt-2 text-xs text-left text-gray-500 bg-gray-50 p-3 rounded-lg overflow-auto max-h-40 mb-4">
              {searilizeError(this.state.error)}
            </pre>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-gradient-to-r from-pink-400 to-peach-400 text-white font-medium rounded-full hover:scale-105 transition-transform"
            >
              {t('error.reload')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
