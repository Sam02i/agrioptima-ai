import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './fixes.css'
import './nearby.css'
import './buyerMarketplaceFixes.css'
import './buyerInteractive.css'
import './farmEditorialTheme.css'
import App from './App.tsx'
import BackendReady from './components/BackendReady'
import { LanguageProvider } from './agriloop/i18n/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><BackendReady><App /></BackendReady></LanguageProvider>
  </StrictMode>,
)
