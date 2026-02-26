import { createClient } from './server'
import type { Event, EventWithTickets, Ticket } from './types'

export async function getOrganizerEvents(organizerId: string): Promise<EventWithTickets[]> {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      tickets (*)
    `)
    .eq('organizer_id', organizerId)
    .order('event_date', { ascending: true })

  if (error) {
    console.error('Error fetching organizer events:', error)
    return []
  }

  return events as EventWithTickets[]
}

export async function getEventById(eventId: string): Promise<EventWithTickets | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      tickets (*)
    `)
    .eq('id', eventId)
    .single()

  if (error) {
    console.error('Error fetching event:', error)
    return null
  }

  return data as EventWithTickets
}

export async function createEvent(
  event: {
    organizer_id: string
    title: string
    description: string | null
    event_date: string
    location: string
    image_url: string | null
  }
): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    return null
  }

  return data
}

export async function updateEvent(
  eventId: string,
  updates: {
    title?: string
    description?: string | null
    event_date?: string
    location?: string
    image_url?: string | null
  }
): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    return null
  }

  return data
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event:', error)
    return false
  }

  return true
}

export async function createTickets(tickets: Array<{
  event_id: string
  name: string
  price: number
  quantity: number
}>): Promise<Ticket[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .insert(tickets)
    .select()

  if (error) {
    console.error('Error creating tickets:', error)
    return []
  }

  return data
}

export async function updateTicket(
  ticketId: string,
  updates: {
    name?: string
    price?: number
    quantity?: number
  }
): Promise<Ticket | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) {
    console.error('Error updating ticket:', error)
    return null
  }

  return data
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)

  if (error) {
    console.error('Error deleting ticket:', error)
    return false
  }

  return true
}
