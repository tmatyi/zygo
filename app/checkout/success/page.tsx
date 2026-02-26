"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Mail, Calendar, QrCode } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OrderWithItems, EventWithTickets } from "@/lib/supabase/types";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrderDetails() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderResponse = await fetch(`/api/orders/${orderId}`);
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrder(orderData);

          const eventResponse = await fetch(
            `/api/events/${orderData.event_id}`,
          );
          if (eventResponse.ok) {
            const eventData = await eventResponse.json();
            setEvent(eventData);
          }
        }
      } catch (error) {
        console.error("Error loading order details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading order details...</p>
      </div>
    );
  }

  if (!order || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-zinc-600 mb-4">Order not found</p>
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your purchase. Your tickets have been confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-zinc-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Confirmation Email
                  </p>
                  <p className="text-sm text-zinc-600">
                    A confirmation email has been sent to{" "}
                    <span className="font-medium">{order.customer_email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Event Details
                  </p>
                  <p className="text-sm text-zinc-600">{event.title}</p>
                  <p className="text-sm text-zinc-600">{formattedDate}</p>
                  <p className="text-sm text-zinc-600">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Order ID</span>
                  <span className="font-mono text-xs">{order.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Customer Name</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600">Status</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Your Tickets
              </h3>
              <p className="text-sm text-zinc-600 mb-4">
                Show these QR codes at the event entrance for check-in
              </p>
              <div className="space-y-4">
                {order.order_items.map((item) => {
                  const ticket = event.tickets.find(
                    (t) => t.id === item.ticket_id,
                  );
                  const ticketUrl = `${window.location.origin}/tickets/${item.check_in_token}`;

                  return (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-shrink-0">
                          <QRCodeSVG
                            value={ticketUrl}
                            size={120}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <p className="font-semibold text-lg">
                            {ticket?.name || "Ticket"}
                          </p>
                          <p className="text-sm text-zinc-600">
                            {item.price_at_purchase.toLocaleString("hu-HU")} HUF
                          </p>
                          <p className="text-xs text-zinc-500 mt-2">
                            Token: {item.check_in_token?.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/tickets/${item.check_in_token}`}>
                              View Ticket
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total Amount</span>
                <span className="text-xl font-bold">
                  {order.total_amount.toLocaleString("hu-HU")} HUF
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href={`/events/${event.id}`}>View Event Details</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Browse More Events</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-zinc-500 pt-4">
              <p>Need help? Contact us at support@zygo.hu</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
