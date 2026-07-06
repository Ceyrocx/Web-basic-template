import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { getItems, createItem } from '../api/items'

export function useItems() {
    return useQuery({
        queryKey: ['items'],
        queryFn: getItems,
    })
}

export function useCreateItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createItem,
        // Refetch the list after a successful create
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] })
        },
    })
}
