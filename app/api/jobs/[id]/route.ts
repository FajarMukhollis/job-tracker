import { NextRequest, NextResponse } from 'next/server'
import { getJobById, updateJob, deleteJob } from '@/app/service/job.service'
import { updateJobSchema } from '@/lib/schemas'
import { ZodError } from 'zod'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await getJobById(id)
    return NextResponse.json(job)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error(`GET /api/jobs/${error} error:`, error)
    return NextResponse.json({ error: message }, { status: 404 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const validated = updateJobSchema.parse(body)
    const job = await updateJob(id, validated)

    return NextResponse.json(job)
  } catch (error) {
    console.error(`PUT /api/jobs/${error} error:`, error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : 'Failed to update job'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteJob(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/jobs/${error} error:`, error)
    const message = error instanceof Error ? error.message : 'Failed to delete job'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
