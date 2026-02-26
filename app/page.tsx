import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut } from "./login/actions";
import { Ticket } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-black p-3">
              <Ticket className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to ZYGO</CardTitle>
          <CardDescription>
            Modern ticket sales platform for the Hungarian market
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <div className="rounded-lg bg-zinc-100 p-4">
                <p className="text-sm font-medium text-zinc-900">
                  Signed in as
                </p>
                <p className="text-sm text-zinc-600 mt-1">{user.email}</p>
              </div>
              <form action={signOut}>
                <Button type="submit" variant="outline" className="w-full">
                  Sign Out
                </Button>
              </form>
            </>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-zinc-500">
              M2 Sprint: Core Infrastructure ✅
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
