export type UserRole = "admin" | "organizer" | "customer";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity: number;
  quantity_available: number;
  created_at: string;
  updated_at: string;
}

export interface EventWithTickets extends Event {
  tickets: Ticket[];
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  event_id: string;
  total_amount: number;
  status: "pending" | "paid" | "cancelled";
  payment_id: string | null;
  payment_request_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_id: string;
  quantity: number;
  price_at_purchase: number;
  check_in_token: string | null;
  used_at: string | null;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface CartItem {
  ticket_id: string;
  ticket_name: string;
  price: number;
  quantity: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<Event, "id" | "organizer_id" | "created_at" | "updated_at">
        >;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<Ticket, "id" | "event_id" | "created_at" | "updated_at">
        >;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at">;
        Update: Partial<Omit<OrderItem, "id" | "created_at">>;
      };
    };
  };
}
