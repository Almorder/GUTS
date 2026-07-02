import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Initialize Dark Mode based on OS preference or localStorage
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
  localStorage.theme = 'dark';
} else {
  document.documentElement.classList.remove('dark');
  localStorage.theme = 'light';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/GUTS">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
