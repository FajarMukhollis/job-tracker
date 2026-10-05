import prisma from '@/lib/prisma'
import { CreateJobInput, UpdateJobInput } from '@/lib/schemas'

export async function getAllJobs() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { apply_date: 'desc' },
    })
    return jobs
  } catch (error) {
    // throw new Error('Failed to fetch jobs')
    throw error
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
        // Hanya simpan reject_note jika statusnya Reject, selain itu null
        reject_note: data.status === 'Reject' ? (data.reject_note?.trim() || null) : null,
      },
    })

    return job
  } catch {
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
        // Hanya simpan reject_note jika statusnya Reject, selain itu null
        reject_note: data.status === 'Reject' ? (data.reject_note?.trim() || null) : null,
      },
    })

    return job
  } catch {
    throw new Error('Failed to update job')
  }
}

export async function deleteJob(id: string) {
  try {
    await prisma.job.delete({
      where: { id },
    })

    return { success: true }
  } catch {
    throw new Error('Failed to delete job')
  }
}

export async function getJobStats() {
  try {
    const jobs = await prisma.job.findMany()

    const stats = {
      total: jobs.length,
      apply: jobs.filter(j => j.status === 'Apply').length,
      hr_interview: jobs.filter(j => j.status === 'HR_Interview').length,
      test: jobs.filter(j => j.status === 'Test').length,
      user_interview: jobs.filter(j => j.status === 'User_Interview').length,
      offering: jobs.filter(j => j.status === 'Offering').length,
      rejected: jobs.filter(j => j.status === 'Reject').length,
    }

    return stats
  } catch {
    throw new Error('Failed to fetch job stats')
  }
}
