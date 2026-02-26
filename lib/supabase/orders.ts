import { createClient } from "./server";
import type { Order, OrderWithItems, OrderItem } from "./types";

export async function createOrder(orderData: {
  customer_email: string;
  customer_name: string;
  event_id: string;
  total_amount: number;
  status: "pending" | "paid";
  payment_id?: string | null;
  payment_request_id?: string | null;
}): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("Error creating order:", error);
    return null;
  }

  return data;
}

export async function updateOrderPayment(
  orderId: string,
  paymentData: {
    payment_id: string;
    status: "pending" | "paid" | "cancelled";
  },
): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update(paymentData)
    .eq("id", orderId)
    .select()
    .single();

  if (error) {
    console.error("Error updating order payment:", error);
    return null;
  }

  return data;
}

export async function getOrderByPaymentId(
  paymentId: string,
): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("payment_id", paymentId)
    .single();

  if (error) {
    console.error("Error fetching order by payment ID:", error);
    return null;
  }

  return data;
}

export async function createOrderItems(
  items: Array<{
    order_id: string;
    ticket_id: string;
    quantity: number;
    price_at_purchase: number;
  }>,
): Promise<OrderItem[]> {
  const supabase = await createClient();

  const itemsWithTokens = items.map((item) => ({
    ...item,
    check_in_token: crypto.randomUUID(),
  }));

  const { data, error } = await supabase
    .from("order_items")
    .insert(itemsWithTokens)
    .select();

  if (error) {
    console.error("Error creating order items:", error);
    return [];
  }

  return data;
}

export async function getOrderById(
  orderId: string,
): Promise<OrderWithItems | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data as OrderWithItems;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data;
}

export async function getEventOrders(
  eventId: string,
): Promise<OrderWithItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (*)
    `,
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching event orders:", error);
    return [];
  }

  return data as OrderWithItems[];
}

export async function decrementTicketQuantity(
  ticketId: string,
  quantity: number,
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("decrement_ticket_quantity", {
    ticket_uuid: ticketId,
    decrement_amount: quantity,
  });

  if (error) {
    console.error("Error decrementing ticket quantity:", error);
    return false;
  }

  return true;
}
