"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Ticket, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketData {
  id: string;
  check_in_token: string;
  used_at: string | null;
  price_at_purchase: number;
  orders: {
    customer_name: string;
    customer_email: string;
    status: string;
    events: {
      title: string;
      event_date: string;
      location: string;
    };
  };
  tickets: {
    name: string;
    price: number;
  };
}

export default function TicketPage() {
  const params = useParams();
  const token = params.token as string;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        const response = await fetch(`/api/tickets/${token}`);
        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        } else {
          setError("Ticket not found");
        }
      } catch (err) {
        console.error("Error loading ticket:", err);
        setError("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-zinc-600">Loading ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-zinc-600">{error || "Ticket not found"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(ticket.orders.events.event_date);
  const formattedDate = eventDate.toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const ticketUrl = `${window.location.origin}/tickets/${token}`;
  const isUsed = !!ticket.used_at;

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div
                className={`rounded-full p-3 ${isUsed ? "bg-zinc-100" : "bg-blue-100"}`}
              >
                <Ticket
                  className={`h-12 w-12 ${isUsed ? "text-zinc-600" : "text-blue-600"}`}
                />
              </div>
            </div>
            <CardTitle className="text-2xl">{ticket.tickets.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isUsed && ticket.used_at && (
              <div className="rounded-lg bg-zinc-100 p-4 text-center">
                <CheckCircle className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="font-semibold text-zinc-900">
                  Ticket Already Used
                </p>
                <p className="text-sm text-zinc-600 mt-1">
                  Checked in: {new Date(ticket.used_at).toLocaleString("hu-HU")}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-2 border-zinc-200">
                <QRCodeSVG
                  value={ticketUrl}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Event</p>
                  <p className="text-sm text-zinc-600">
                    {ticket.orders.events.title}
                  </p>
                  <p className="text-sm text-zinc-600">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Location</p>
                  <p className="text-sm text-zinc-600">
                    {ticket.orders.events.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Ticket Holder
                  </p>
                  <p className="text-sm text-zinc-600">
                    {ticket.orders.customer_name}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {ticket.orders.customer_email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-zinc-500 text-center">
                Token: {token}
              </p>
            </div>

            {!isUsed && (
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm font-medium text-blue-900">
                  Show this QR code at the event entrance
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Keep this page accessible on your phone
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
