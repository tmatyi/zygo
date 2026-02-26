'use client'

import { useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An error occurred during checkout'

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Payment Failed</CardTitle>
            <CardDescription className="text-base">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-zinc-50 p-4">
              <p className="text-sm text-zinc-600">
                Your payment could not be processed. No charges have been made to your account.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/">Browse Events</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-zinc-500 pt-4">
              <p>Need help? Contact us at support@zygo.hu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
