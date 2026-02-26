import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  console.log("Fetching event with ID:", id);

  // First, try to get just the event without tickets
  const { data: eventOnly, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError) {
    console.error("Event query error:", eventError);
    return NextResponse.json(
      { error: "Event not found", details: eventError.message },
      { status: 404 },
    );
  }

  if (!eventOnly) {
    console.log("No event found for ID:", id);
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Now try to get tickets separately
  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", id);

  if (ticketsError) {
    console.error("Tickets query error:", ticketsError);
    // Return event without tickets if tickets query fails
    return NextResponse.json({ ...eventOnly, tickets: [] });
  }

  console.log(
    "Event found:",
    eventOnly.title,
    "with",
    tickets?.length || 0,
    "tickets",
  );
  return NextResponse.json({ ...eventOnly, tickets: tickets || [] });
}
