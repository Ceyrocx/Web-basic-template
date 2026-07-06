import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Home from './Home'
import { renderWithProviders } from '../test-utils'
import * as itemsApi from '../api/items'

// Mock the API module so tests never hit the network
vi.mock('../api/items')

describe('Home', () => {
    beforeEach(() => {
        vi.mocked(itemsApi.getItems).mockResolvedValue([])
        vi.mocked(itemsApi.createItem).mockResolvedValue({ id: 1, name: 'Alice' })
    })

    it('renders the title', () => {
        renderWithProviders(<Home />)
        expect(screen.getByText('Hello World 👋')).toBeInTheDocument()
    })

    it('submits the form with the typed name', async () => {
        const user = userEvent.setup()
        renderWithProviders(<Home />)

        await user.type(screen.getByLabelText('Nom'), 'Alice')
        await user.click(screen.getByRole('button', { name: 'Ajouter' }))

        // TanStack Query passes a 2nd (context) arg to mutationFn → check the 1st arg only
        await waitFor(() => expect(itemsApi.createItem).toHaveBeenCalled())
        expect(vi.mocked(itemsApi.createItem).mock.calls[0][0]).toEqual({ name: 'Alice' })
    })
})
