import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(200, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(1000, 'La descripción es demasiado larga')
    .optional(),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo'),
  category_id: z
    .string()
    .min(1, 'La categoría es requerida'),
  stock: z
    .number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  active: z.boolean(),
})

export type ProductFormData = z.infer<typeof productSchema>