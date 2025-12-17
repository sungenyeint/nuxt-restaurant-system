import { z } from 'zod'

export const userSchema = (isEdit: boolean) => z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: isEdit
    ? z.string().optional() // optional on edit
    : z.string().min(6, 'Password is required'), // required on create
  role: z.enum(['cashier','admin','chef','waiter']),
})
