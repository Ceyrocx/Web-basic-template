import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { Container, Title, TextInput, Button, Stack, Card, Text, Group } from '@mantine/core'

import { itemCreateSchema, type ItemCreate } from '../schemas/item'
import { useItems, useCreateItem } from '../hooks/useItems'

export default function Home() {
    const { data: items, isLoading, isError } = useItems()
    const createItem = useCreateItem()

    // Reuse the API's zod schema to validate the form
    const form = useForm<ItemCreate>({
        initialValues: { name: '' },
        validate: zodResolver(itemCreateSchema),
    })

    const handleSubmit = form.onSubmit((values) => {
        createItem.mutate(values, {
            onSuccess: () => form.reset(),
        })
    })

    return (
        <Container size="sm" py="xl">
            <Title order={1} mb="lg">Hello World 👋</Title>

            <form onSubmit={handleSubmit}>
                <Group align="flex-end">
                    <TextInput
                        label="Nom"
                        placeholder="Entre un nom"
                        style={{ flex: 1 }}
                        // wires value + onChange + error to the form state
                        {...form.getInputProps('name')}
                    />
                    <Button type="submit" loading={createItem.isPending}>
                        Ajouter
                    </Button>
                </Group>
            </form>

            <Stack mt="xl">
                {isLoading && <Text>Chargement…</Text>}
                {isError && <Text c="red">Erreur de chargement</Text>}
                {items?.map((item) => (
                    <Card key={item.id} withBorder padding="md">
                        <Text>{item.name}</Text>
                    </Card>
                ))}
                {items?.length === 0 && <Text c="dimmed">Aucun item pour l'instant.</Text>}
            </Stack>
        </Container>
    )
}
