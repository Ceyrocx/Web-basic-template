import { z } from 'zod'

export const itemSchema = z.object({
    id: z.number(),
    name: z.string(),
})

export const itemCreateSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
})

// Types inferred from the schemas — single source of truth
export type Item = z.infer<typeof itemSchema>
export type ItemCreate = z.infer<typeof itemCreateSchema>
