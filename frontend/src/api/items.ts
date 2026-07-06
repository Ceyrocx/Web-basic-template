import { z } from 'zod'

import axiosInstance from './axiosInstance'
import { itemSchema, type Item, type ItemCreate } from '../schemas/item'

export async function getItems(): Promise<Item[]> {
    const response = await axiosInstance.get('/items')
    return z.array(itemSchema).parse(response.data)  // validate the response at runtime
}

export async function createItem(data: ItemCreate): Promise<Item> {
    const response = await axiosInstance.post('/items', data)
    return itemSchema.parse(response.data)
}
