import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// Providers: Mantine (theme) → React Query (data cache) → Router (navigation)
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MantineProvider>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </MantineProvider>
    </StrictMode>,
)
