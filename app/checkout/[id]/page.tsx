"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { processCheckout } from "./actions";
import type { CartItem, EventWithTickets } from "@/lib/supabase/types";

export default function CheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventWithTickets | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const cartParam = searchParams.get("cart");
        if (cartParam) {
          const cartData = JSON.parse(decodeURIComponent(cartParam));
          setCart(cartData);
        }

        const response = await fetch(`/api/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, searchParams]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    formData.append("event_id", eventId);
    formData.append("cart", JSON.stringify(cart));

    try {
      const result = await processCheckout(formData);

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading checkout...</p>
      </div>
    );
  }

  if (!event || cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-zinc-600 mb-4">No items in cart</p>
            <Button asChild className="w-full">
              <Link href={`/events/${eventId}`}>Back to Event</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-6">
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Event
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete your ticket purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">Full Name *</Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email">Email Address *</Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Processing..."
                      : `Pay ${totalAmount.toLocaleString("hu-HU")} HUF`}
                  </Button>

                  <p className="text-xs text-center text-zinc-500">
                    By completing this purchase, you agree to our terms and
                    conditions.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <p className="text-sm text-zinc-600">
                    {new Date(event.event_date).toLocaleDateString("hu-HU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.ticket_id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-zinc-600">
                        {item.quantity}x {item.ticket_name}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString("hu-HU")}{" "}
                        HUF
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-600">Total Tickets</span>
                    <span className="font-medium">{totalTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">
                      {totalAmount.toLocaleString("hu-HU")} HUF
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
