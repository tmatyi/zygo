import { createClient } from "./server";
import type { OrderItem } from "./types";

export async function getTicketByToken(
  token: string,
): Promise<OrderItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("check_in_token", token)
    .single();

  if (error) {
    console.error("Error fetching ticket by token:", error);
    return null;
  }

  return data;
}

export async function markTicketAsUsed(
  ticketId: string,
): Promise<OrderItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .update({ used_at: new Date().toISOString() })
    .eq("id", ticketId)
    .select()
    .single();

  if (error) {
    console.error("Error marking ticket as used:", error);
    return null;
  }

  return data;
}

export async function getTicketWithOrderDetails(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      *,
      orders (
        id,
        customer_name,
        customer_email,
        status,
        event_id,
        events (
          id,
          title,
          event_date,
          location
        )
      ),
      tickets (
        id,
        name,
        price
      )
    `,
    )
    .eq("check_in_token", token)
    .single();

  if (error) {
    console.error("Error fetching ticket with details:", error);
    return null;
  }

  return data;
}
