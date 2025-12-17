import { z } from 'zod'

export const tableSchema = z.object({
  tableNumber: z.number().min(1, 'Table number is required'),
  seats: z.number().min(1, 'Seats must be at least 1'),
  status: z.enum(['available','occupied','reserved','cleaning'])
})
