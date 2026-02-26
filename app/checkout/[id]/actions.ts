"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrder, createOrderItems } from "@/lib/supabase/orders";
import { preparePayment, isBarionConfigured } from "@/lib/payment/barion";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "crypto";

const checkoutSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(100),
  customer_email: z.string().email("Invalid email address"),
});

export async function processCheckout(formData: FormData) {
  const supabase = await createClient();

  const customerData = {
    customer_name: formData.get("customer_name") as string,
    customer_email: formData.get("customer_email") as string,
  };

  const validatedData = checkoutSchema.safeParse(customerData);
  if (!validatedData.success) {
    return { error: validatedData.error.issues[0].message };
  }

  const eventId = formData.get("event_id") as string;
  const cartJson = formData.get("cart") as string;

  let cart: Array<{
    ticket_id: string;
    ticket_name: string;
    price: number;
    quantity: number;
  }> = [];

  try {
    cart = JSON.parse(cartJson);
  } catch {
    return { error: "Invalid cart data" };
  }

  if (cart.length === 0) {
    return { error: "Cart is empty" };
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  for (const item of cart) {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("quantity_available")
      .eq("id", item.ticket_id)
      .single();

    if (!ticket || ticket.quantity_available < item.quantity) {
      return { error: `Not enough tickets available for ${item.ticket_name}` };
    }
  }

  const paymentRequestId = randomUUID();

  const order = await createOrder({
    customer_email: validatedData.data.customer_email,
    customer_name: validatedData.data.customer_name,
    event_id: eventId,
    total_amount: totalAmount,
    status: "pending",
    payment_request_id: paymentRequestId,
  });

  if (!order) {
    return { error: "Failed to create order" };
  }

  const orderItems = cart.map((item) => ({
    order_id: order.id,
    ticket_id: item.ticket_id,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }));

  const createdItems = await createOrderItems(orderItems);

  if (createdItems.length === 0) {
    return { error: "Failed to create order items" };
  }

  if (!isBarionConfigured()) {
    console.warn("Barion not configured, skipping payment");
    revalidatePath(`/events/${eventId}`);
    redirect(`/checkout/success?order=${order.id}`);
  }

  try {
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    const barionItems = cart.map((item) => ({
      Name: item.ticket_name,
      Description: `Ticket for ${event?.title || "event"}`,
      Quantity: item.quantity,
      Unit: "db",
      UnitPrice: item.price,
      ItemTotal: item.price * item.quantity,
    }));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const paymentResponse = await preparePayment({
      PaymentType: "Immediate",
      GuestCheckOut: true,
      FundingSources: ["All"],
      PaymentRequestId: paymentRequestId,
      OrderNumber: order.id,
      Currency: "HUF",
      Locale: "hu-HU",
      RedirectUrl: `${appUrl}/api/payment/callback`,
      CallbackUrl: `${appUrl}/api/payment/webhook`,
      Transactions: [
        {
          POSTransactionId: order.id,
          Payee:
            process.env.BARION_PAYEE_EMAIL || validatedData.data.customer_email,
          Total: totalAmount,
          Items: barionItems,
        },
      ],
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({ payment_id: paymentResponse.PaymentId })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order with payment_id:", updateError);
      return { error: "Failed to save payment information" };
    }

    console.log("Order updated with payment_id:", paymentResponse.PaymentId);

    revalidatePath(`/events/${eventId}`);

    return { success: true, redirectUrl: paymentResponse.GatewayUrl };
  } catch (error) {
    console.error("Barion payment error:", error);
    return { error: "Failed to initiate payment. Please try again." };
  }
}
