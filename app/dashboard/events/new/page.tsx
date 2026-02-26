"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createEventAction } from "./actions";

interface TicketType {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([
    { id: "1", name: "", price: "", quantity: "" },
  ]);

  const addTicket = () => {
    setTickets([
      ...tickets,
      { id: Date.now().toString(), name: "", price: "", quantity: "" },
    ]);
  };

  const removeTicket = (id: string) => {
    if (tickets.length > 1) {
      setTickets(tickets.filter((t) => t.id !== id));
    }
  };

  const updateTicket = (id: string, field: keyof TicketType, value: string) => {
    setTickets(
      tickets.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const ticketsData = tickets.map((t) => ({
      name: t.name,
      price: parseInt(t.price) || 0,
      quantity: parseInt(t.quantity) || 0,
    }));

    formData.append("tickets", JSON.stringify(ticketsData));

    try {
      const result = await createEventAction(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the event details and add at least one ticket type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Summer Music Festival 2026"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Tell people about your event..."
                  rows={4}
                  disabled={isLoading}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date & Time *</Label>
                  <Input
                    id="event_date"
                    name="event_date"
                    type="datetime-local"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Budapest, Hungary"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  type="url"
                  placeholder="https://example.com/event-image.jpg"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Ticket Types</h3>
                  <p className="text-sm text-zinc-600">
                    Add at least one ticket type
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicket}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ticket
                </Button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`ticket-name-${ticket.id}`}>
                              Ticket Name *
                            </Label>
                            <Input
                              id={`ticket-name-${ticket.id}`}
                              placeholder="General Admission"
                              value={ticket.name}
                              onChange={(e) =>
                                updateTicket(ticket.id, "name", e.target.value)
                              }
                              required
                              disabled={isLoading}
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`ticket-price-${ticket.id}`}>
                                Price (HUF) *
                              </Label>
                              <Input
                                id={`ticket-price-${ticket.id}`}
                                type="number"
                                min="0"
                                placeholder="5000"
                                value={ticket.price}
                                onChange={(e) =>
                                  updateTicket(
                                    ticket.id,
                                    "price",
                                    e.target.value,
                                  )
                                }
                                required
                                disabled={isLoading}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`ticket-quantity-${ticket.id}`}>
                                Quantity *
                              </Label>
                              <Input
                                id={`ticket-quantity-${ticket.id}`}
                                type="number"
                                min="1"
                                placeholder="100"
                                value={ticket.quantity}
                                onChange={(e) =>
                                  updateTicket(
                                    ticket.id,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                required
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </div>

                        {tickets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTicket(ticket.id)}
                            disabled={isLoading}
                            className="mt-8"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
