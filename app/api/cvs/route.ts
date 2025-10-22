import { NextResponse } from 'next/server'
import { loadRealCVs } from '@/lib/loadCVs'

export async function GET() {
  try {
    const cvs = loadRealCVs()
    return NextResponse.json(cvs)
  } catch (error) {
    console.error('Error loading CVs:', error)
    return NextResponse.json(
      { error: 'Failed to load CVs' },
      { status: 500 }
    )
  }
}
