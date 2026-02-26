"use server";

import { getTicketByToken, markTicketAsUsed } from "@/lib/supabase/checkin";
import { getOrderById } from "@/lib/supabase/orders";

export interface ValidationResult {
  success: boolean;
  message: string;
  ticketInfo?: {
    ticketName: string;
    customerName: string;
    eventTitle: string;
    alreadyUsed: boolean;
    usedAt?: string;
  };
}

export async function validateTicket(
  token: string,
): Promise<ValidationResult> {
  if (!token) {
    return {
      success: false,
      message: "Invalid QR code",
    };
  }

  const ticket = await getTicketByToken(token);

  if (!ticket) {
    return {
      success: false,
      message: "Ticket not found",
    };
  }

  const order = await getOrderById(ticket.order_id);

  if (!order) {
    return {
      success: false,
      message: "Order not found",
    };
  }

  if (order.status !== "paid") {
    return {
      success: false,
      message: `Payment not confirmed (Status: ${order.status})`,
    };
  }

  if (ticket.used_at) {
    return {
      success: false,
      message: "Ticket already used",
      ticketInfo: {
        ticketName: "Ticket",
        customerName: order.customer_name,
        eventTitle: "Event",
        alreadyUsed: true,
        usedAt: ticket.used_at,
      },
    };
  }

  const updatedTicket = await markTicketAsUsed(ticket.id);

  if (!updatedTicket) {
    return {
      success: false,
      message: "Failed to mark ticket as used",
    };
  }

  return {
    success: true,
    message: "Ticket validated successfully",
    ticketInfo: {
      ticketName: "Ticket",
      customerName: order.customer_name,
      eventTitle: "Event",
      alreadyUsed: false,
    },
  };
}
