import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/supabase/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Calendar, Shield } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const profile = await getProfile(user.id)

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
            <div className="rounded-full bg-black p-3">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Full Name</p>
              <p className="text-base font-semibold">
                {profile?.full_name || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
            <div className="rounded-full bg-black p-3">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Email</p>
              <p className="text-base font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
            <div className="rounded-full bg-black p-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Role</p>
              <p className="text-base font-semibold capitalize">
                {profile?.role || 'customer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg">
            <div className="rounded-full bg-black p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">Member Since</p>
              <p className="text-base font-semibold">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
