import { NextRequest, NextResponse } from "next/server";
import { getPaymentState } from "@/lib/payment/barion";
import { getOrderByPaymentId, updateOrderPayment } from "@/lib/supabase/orders";
import { decrementTicketQuantity } from "@/lib/supabase/orders";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get("paymentId");

  console.log("Payment callback received for paymentId:", paymentId);

  if (!paymentId) {
    return NextResponse.redirect(
      new URL("/checkout/error?message=Missing payment ID", request.url),
    );
  }

  try {
    const paymentState = await getPaymentState(paymentId);
    console.log("Payment state:", paymentState.Status);

    const order = await getOrderByPaymentId(paymentId);
    console.log("Order found:", order ? order.id : "null");

    if (!order) {
      console.error("Order not found for payment_id:", paymentId);
      return NextResponse.redirect(
        new URL("/checkout/error?message=Order not found", request.url),
      );
    }

    if (paymentState.Status === "Succeeded") {
      if (order.status !== "paid") {
        await updateOrderPayment(order.id, {
          payment_id: paymentId,
          status: "paid",
        });

        const supabase = await createClient();
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("ticket_id, quantity")
          .eq("order_id", order.id);

        if (orderItems) {
          for (const item of orderItems) {
            await decrementTicketQuantity(item.ticket_id, item.quantity);
          }
        }
      }

      return NextResponse.redirect(
        new URL(`/checkout/success?order=${order.id}`, request.url),
      );
    } else if (
      paymentState.Status === "Canceled" ||
      paymentState.Status === "Failed"
    ) {
      await updateOrderPayment(order.id, {
        payment_id: paymentId,
        status: "cancelled",
      });

      return NextResponse.redirect(
        new URL(
          `/checkout/error?message=Payment ${paymentState.Status.toLowerCase()}`,
          request.url,
        ),
      );
    } else {
      return NextResponse.redirect(
        new URL(
          `/checkout/error?message=Payment status: ${paymentState.Status}`,
          request.url,
        ),
      );
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      new URL(
        "/checkout/error?message=Payment verification failed",
        request.url,
      ),
    );
  }
}
