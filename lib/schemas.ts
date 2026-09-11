import { z } from 'zod'

export const createJobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  apply_date: z.string().datetime('Invalid date format'),
  status: z.enum(['Apply', 'HR_Interview', 'Test', 'User_Interview', 'Offering', 'Gagal']),
  description: z.string().min(1, 'Description is required'),
})

export const updateJobSchema = createJobSchema

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
