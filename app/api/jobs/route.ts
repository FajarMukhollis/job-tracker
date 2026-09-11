import { NextRequest, NextResponse } from 'next/server'
import { getAllJobs, createJob } from '@/app/service/job.service'
import { createJobSchema } from '@/lib/schemas'

export async function GET(req: NextRequest) {
  try {
    const jobs = await getAllJobs()
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('GET /api/jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const validated = createJobSchema.parse(body)
    const job = await createJob(validated)

    return NextResponse.json(job, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/jobs error:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create job' },
      { status: 500 }
    )
  }
}
