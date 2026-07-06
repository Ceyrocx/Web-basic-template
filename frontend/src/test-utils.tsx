import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Render a component wrapped in the app's providers (Mantine + a fresh Query client)
export function renderWithProviders(ui: ReactNode) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },  // fail fast in tests
    })
    return render(
        <MantineProvider>
            <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
        </MantineProvider>,
    )
}
