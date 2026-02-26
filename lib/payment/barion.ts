import { z } from "zod";

const BARION_API_URL =
  process.env.BARION_API_URL || "https://api.test.barion.com";
const BARION_POS_KEY = process.env.BARION_POS_KEY || "";
const BARION_PIXEL_ID = process.env.BARION_PIXEL_ID || "";

export interface BarionPaymentItem {
  Name: string;
  Description: string;
  Quantity: number;
  Unit: string;
  UnitPrice: number;
  ItemTotal: number;
  SKU?: string;
}

export interface BarionTransaction {
  POSTransactionId: string;
  Payee: string;
  Total: number;
  Items: BarionPaymentItem[];
}

export interface PreparePaymentRequest {
  PaymentType: "Immediate" | "Reservation" | "DelayedCapture";
  ReservationPeriod?: string;
  PaymentWindow?: string;
  GuestCheckOut: boolean;
  FundingSources: string[];
  PaymentRequestId: string;
  OrderNumber: string;
  Currency: string;
  Locale: string;
  RedirectUrl: string;
  CallbackUrl: string;
  Transactions: BarionTransaction[];
}

export interface PreparePaymentResponse {
  PaymentId: string;
  PaymentRequestId: string;
  Status: string;
  QRUrl: string;
  RecurrenceResult: string;
  GatewayUrl: string;
  RedirectUrl: string;
  CallbackUrl: string;
  Transactions: Array<{
    POSTransactionId: string;
    TransactionId: string;
    Status: string;
    Currency: string;
    TransactionTime: string;
    RelatedId: string | null;
  }>;
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
    AuthData: string;
    HappenedAt: string;
  }>;
}

export interface GetPaymentStateRequest {
  PaymentId: string;
}

export interface GetPaymentStateResponse {
  PaymentId: string;
  PaymentRequestId: string;
  POSId: string;
  POSName: string;
  Status: string;
  PaymentType: string;
  FundingSource: string;
  AllowedFundingSources: string[];
  GuestCheckout: boolean;
  CreatedAt: string;
  ValidUntil: string;
  CompletedAt: string | null;
  ReservedUntil: string | null;
  Total: number;
  Currency: string;
  Transactions: Array<{
    POSTransactionId: string;
    TransactionId: string;
    Status: string;
    TransactionTime: string;
    RelatedId: string | null;
    Currency: string;
    Total: number;
  }>;
  Errors?: Array<{
    ErrorCode: string;
    Title: string;
    Description: string;
  }>;
}

const preparePaymentSchema = z.object({
  PaymentId: z.string(),
  PaymentRequestId: z.string(),
  Status: z.string(),
  GatewayUrl: z.string(),
});

const getPaymentStateSchema = z.object({
  PaymentId: z.string(),
  Status: z.string(),
  Total: z.number(),
});

export async function preparePayment(
  request: PreparePaymentRequest,
): Promise<PreparePaymentResponse> {
  const payload = {
    POSKey: BARION_POS_KEY,
    ...request,
  };

  const response = await fetch(`${BARION_API_URL}/v2/Payment/Start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Barion API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  console.log("Barion PreparePayment response:", JSON.stringify(data, null, 2));

  if (data.Errors && data.Errors.length > 0) {
    const errorMessages = data.Errors.map(
      (err: { Title: string; Description: string }) =>
        `${err.Title}: ${err.Description}`,
    ).join(", ");
    console.error("Barion errors:", data.Errors);
    throw new Error(`Barion payment preparation failed: ${errorMessages}`);
  }

  preparePaymentSchema.parse(data);

  return data as PreparePaymentResponse;
}

export async function getPaymentState(
  paymentId: string,
): Promise<GetPaymentStateResponse> {
  const url = new URL(`${BARION_API_URL}/v2/Payment/GetPaymentState`);
  url.searchParams.append("POSKey", BARION_POS_KEY);
  url.searchParams.append("PaymentId", paymentId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Barion API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (data.Errors && data.Errors.length > 0) {
    const errorMessages = data.Errors.map(
      (err: { Title: string; Description: string }) =>
        `${err.Title}: ${err.Description}`,
    ).join(", ");
    throw new Error(`Barion get payment state failed: ${errorMessages}`);
  }

  getPaymentStateSchema.parse(data);

  return data as GetPaymentStateResponse;
}

export function getBarionPixelId(): string {
  return BARION_PIXEL_ID;
}

export function isBarionConfigured(): boolean {
  return !!(BARION_POS_KEY && BARION_API_URL);
}
