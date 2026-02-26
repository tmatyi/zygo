import { NextRequest, NextResponse } from 'next/server'
import { getPaymentState } from '@/lib/payment/barion'
import { getOrderByPaymentId, updateOrderPayment } from '@/lib/supabase/orders'
import { decrementTicketQuantity } from '@/lib/supabase/orders'
import { createClient } from '@/lib/supabase/server'

const WEBHOOK_SECRET = process.env.BARION_WEBHOOK_SECRET || ''

const BARION_IPS = [
  '193.224.24.0/24',
  '193.224.25.0/24',
  '193.224.26.0/24',
  '193.224.27.0/24',
]

function isValidBarionIP(ip: string): boolean {
  if (!ip) return false
  
  for (const range of BARION_IPS) {
    const [rangeIP, mask] = range.split('/')
    const rangeParts = rangeIP.split('.').map(Number)
    const ipParts = ip.split('.').map(Number)
    const maskNum = parseInt(mask)
    
    const rangeNum = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3]
    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]
    const maskBits = 0xFFFFFFFF << (32 - maskNum)
    
    if ((rangeNum & maskBits) === (ipNum & maskBits)) {
      return true
    }
  }
  
  return false
}

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown'

  if (!isValidBarionIP(clientIP) && process.env.NODE_ENV === 'production') {
    console.warn(`Webhook called from invalid IP: ${clientIP}`)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const authHeader = request.headers.get('authorization')
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    console.warn('Webhook called with invalid secret')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const paymentId = body.PaymentId

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing PaymentId' }, { status: 400 })
    }

    console.log('Webhook received for payment:', paymentId)

    const paymentState = await getPaymentState(paymentId)
    const order = await getOrderByPaymentId(paymentId)

    if (!order) {
      console.error('Order not found for payment:', paymentId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (paymentState.Status === 'Succeeded' && order.status !== 'paid') {
      console.log('Payment succeeded, updating order:', order.id)

      await updateOrderPayment(order.id, {
        payment_id: paymentId,
        status: 'paid',
      })

      const supabase = await createClient()
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('ticket_id, quantity')
        .eq('order_id', order.id)

      if (orderItems) {
        for (const item of orderItems) {
          await decrementTicketQuantity(item.ticket_id, item.quantity)
        }
      }

      console.log('Order updated successfully:', order.id)
    } else if (paymentState.Status === 'Canceled' || paymentState.Status === 'Failed') {
      console.log('Payment failed/cancelled, updating order:', order.id)

      await updateOrderPayment(order.id, {
        payment_id: paymentId,
        status: 'cancelled',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
