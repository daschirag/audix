import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#e0e6ed',
              border: '1px solid rgba(0,240,255,0.15)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              style: {
                background: '#111827',
                color: '#e0e6ed',
                borderLeft: '4px solid #39ff14',
              },
              iconTheme: { primary: '#39ff14', secondary: '#111827' },
            },
            error: {
              style: {
                background: '#111827',
                color: '#e0e6ed',
                borderLeft: '4px solid #ff3860',
              },
              iconTheme: { primary: '#ff3860', secondary: '#111827' },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)
