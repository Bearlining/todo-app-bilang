import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './index.css'
import App from './App.tsx'
import { assertTranslationsComplete } from './i18n'

// 开发模式下自检中英翻译 key 完整性,缺/多都会在 console 报错
if (import.meta.env.DEV) {
  assertTranslationsComplete();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
