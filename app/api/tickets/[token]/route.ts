import { NextRequest, NextResponse } from 'next/server'
import { getTicketWithOrderDetails } from '@/lib/supabase/checkin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const ticket = await getTicketWithOrderDetails(token)

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  return NextResponse.json(ticket)
}
