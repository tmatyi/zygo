'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, MapPin, Minus, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { EventWithTickets, CartItem } from '@/lib/supabase/types'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventWithTickets | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (response.ok) {
          const data = await response.json()
          setEvent(data)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  const updateQuantity = (ticketId: string, ticketName: string, price: number, delta: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.ticket_id === ticketId)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + delta
        
        if (newQuantity <= 0) {
          return prevCart.filter(item => item.ticket_id !== ticketId)
        }
        
        return prevCart.map(item =>
          item.ticket_id === ticketId
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else if (delta > 0) {
        return [...prevCart, { ticket_id: ticketId, ticket_name: ticketName, price, quantity: delta }]
      }
      
      return prevCart
    })
  }

  const getTicketQuantity = (ticketId: string) => {
    const item = cart.find(item => item.ticket_id === ticketId)
    return item ? item.quantity : 0
  }

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    if (cart.length === 0) return
    
    const cartData = encodeURIComponent(JSON.stringify(cart))
    router.push(`/checkout/${eventId}?cart=${cartData}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600">Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-zinc-600">Event not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const eventDate = new Date(event.event_date)
  const formattedDate = eventDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <Card className="mb-6">
          {event.image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
              <img
                src={event.image_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-3xl">{event.title}</CardTitle>
            <CardDescription className="text-base">
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-700 whitespace-pre-wrap">
              {event.description || 'No description available'}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Available Tickets</h2>
            <div className="space-y-4">
              {event.tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ticket.name}</h3>
                        <p className="text-2xl font-bold text-zinc-900 mt-1">
                          {ticket.price.toLocaleString('hu-HU')} HUF
                        </p>
                        <p className="text-sm text-zinc-600 mt-1">
                          {ticket.quantity_available} available
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(ticket.id, ticket.name, ticket.price, -1)}
                          disabled={getTicketQuantity(ticket.id) === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="0"
                          max={ticket.quantity_available}
                          value={getTicketQuantity(ticket.id)}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0
                            const currentQty = getTicketQuantity(ticket.id)
                            updateQuantity(ticket.id, ticket.name, ticket.price, newQty - currentQty)
                          }}
                          className="w-20 text-center"
                        />
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(ticket.id, ticket.name, ticket.price, 1)}
                          disabled={getTicketQuantity(ticket.id) >= ticket.quantity_available}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-sm text-zinc-600 text-center py-4">
                    No tickets selected
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.ticket_id} className="flex justify-between text-sm">
                          <span className="text-zinc-600">
                            {item.quantity}x {item.ticket_name}
                          </span>
                          <span className="font-medium">
                            {(item.price * item.quantity).toLocaleString('hu-HU')} HUF
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-600">Total Tickets</span>
                        <span className="font-medium">{totalTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold">
                          {totalAmount.toLocaleString('hu-HU')} HUF
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
