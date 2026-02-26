import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-zinc-100 p-4 mb-4">
          <Calendar className="h-8 w-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No events yet</h3>
        <p className="text-sm text-zinc-600 mb-6 text-center max-w-sm">
          Get started by creating your first event. Add event details and ticket types to start selling.
        </p>
        <Button asChild>
          <Link href="/dashboard/events/new">Create First Event</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
