"use server";

import { createClient } from "@/lib/supabase/server";
import { createEvent, createTickets } from "@/lib/supabase/events";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  event_date: z.string().min(1, "Event date is required"),
  location: z.string().min(1, "Location is required").max(200),
  image_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const ticketSchema = z.object({
  name: z.string().min(1, "Ticket name is required").max(100),
  price: z.number().min(0, "Price must be 0 or greater"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export async function createEventAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const eventData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    event_date: formData.get("event_date") as string,
    location: formData.get("location") as string,
    image_url: (formData.get("image_url") as string) || null,
  };

  const validatedEvent = eventSchema.safeParse(eventData);
  if (!validatedEvent.success) {
    return { error: validatedEvent.error.issues[0].message };
  }

  const ticketsJson = formData.get("tickets") as string;
  let tickets: Array<{ name: string; price: number; quantity: number }> = [];

  try {
    tickets = JSON.parse(ticketsJson);
  } catch {
    return { error: "Invalid ticket data" };
  }

  if (tickets.length === 0) {
    return { error: "At least one ticket type is required" };
  }

  for (const ticket of tickets) {
    const validatedTicket = ticketSchema.safeParse(ticket);
    if (!validatedTicket.success) {
      return {
        error: `Ticket error: ${validatedTicket.error.issues[0].message}`,
      };
    }
  }

  const event = await createEvent({
    organizer_id: user.id,
    title: validatedEvent.data.title,
    description: validatedEvent.data.description || null,
    event_date: validatedEvent.data.event_date,
    location: validatedEvent.data.location,
    image_url: validatedEvent.data.image_url || null,
  });

  if (!event) {
    return { error: "Failed to create event" };
  }

  const ticketsWithEventId = tickets.map((ticket) => ({
    event_id: event.id,
    name: ticket.name,
    price: ticket.price,
    quantity: ticket.quantity,
    quantity_available: ticket.quantity,
  }));

  const createdTickets = await createTickets(ticketsWithEventId);

  if (createdTickets.length === 0) {
    return { error: "Failed to create tickets" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
