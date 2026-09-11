import prisma from '@/lib/prisma'
import { CreateJobInput, UpdateJobInput } from '@/lib/schemas'

export async function getAllJobs() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { apply_date: 'desc' },
    })
    return jobs
  } catch (error) {
    throw new Error('Failed to fetch jobs')
  }
}

export async function getJobById(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    })

    if (!job) {
      throw new Error('Job not found')
    }

    return job
  } catch (error) {
    throw error
  }
}

export async function createJob(data: CreateJobInput) {
  try {
    const job = await prisma.job.create({
      data: {
        company_name: data.company_name.trim(),
        position: data.position.trim(),
        apply_date: new Date(data.apply_date),
        status: data.status,
        description: data.description.trim(),
      },
    })

    return job
  } catch (error) {
    throw new Error('Failed to create job')
  }
}

export async function updateJob(id: string, data: UpdateJobInput) {
  try {
    const job = await prisma.job.update({
      where: { id },
      data: {
        company_name: data.company_name.trim(),
        position: data.position.trim(),
        apply_date: new Date(data.apply_date),
        status: data.status,
        description: data.description.trim(),
      },
    })

    return job
  } catch (error) {
    throw new Error('Failed to update job')
  }
}

export async function deleteJob(id: string) {
  try {
    await prisma.job.delete({
      where: { id },
    })

    return { success: true }
  } catch (error) {
    throw new Error('Failed to delete job')
  }
}

export async function getJobStats() {
  try {
    const jobs = await prisma.job.findMany()

    const stats = {
      total: jobs.length,
      apply: jobs.filter((j: any) => j.status === 'Apply').length,
      hr_interview: jobs.filter((j: any) => j.status === 'HR_Interview').length,
      test: jobs.filter((j: any) => j.status === 'Test').length,
      user_interview: jobs.filter((j: any) => j.status === 'User_Interview').length,
      offering: jobs.filter((j: any) => j.status === 'Offering').length,
      gagal: jobs.filter((j: any) => j.status === 'Gagal').length,
    }

    return stats
  } catch (error) {
    throw new Error('Failed to fetch job stats')
  }
}
