"use client";

import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, XCircle, Camera } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { validateTicket, type ValidationResult } from "./actions";

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner]);

  const startScanning = async () => {
    setCameraError(null);
    setResult(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await html5QrCode.stop();
          setScanning(false);

          const tokenMatch = decodedText.match(/\/tickets\/([a-f0-9-]+)/);
          const token = tokenMatch ? tokenMatch[1] : decodedText;

          const validationResult = await validateTicket(token);
          setResult(validationResult);

          setTimeout(() => {
            setResult(null);
          }, 5000);
        },
        () => {
          // Ignore scan errors (happens frequently during scanning)
        },
      );

      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        "Failed to access camera. Please ensure camera permissions are granted.",
      );
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan ticket QR codes to validate entry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result && (
            <div className="space-y-4">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-zinc-900"
                style={{ minHeight: scanning ? "300px" : "0px" }}
              />

              {cameraError && (
                <div className="rounded-lg bg-red-50 p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-800">{cameraError}</p>
                </div>
              )}

              <div className="flex gap-3">
                {!scanning ? (
                  <Button onClick={startScanning} className="w-full" size="lg">
                    <Camera className="h-5 w-5 mr-2" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={stopScanning}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Stop Scanning
                  </Button>
                )}
              </div>
            </div>
          )}

          {result && (
            <div
              className={`rounded-lg p-8 text-center ${
                result.success
                  ? "bg-green-50 border-2 border-green-500"
                  : "bg-red-50 border-2 border-red-500"
              }`}
            >
              {result.success ? (
                <>
                  <CheckCircle className="h-24 w-24 text-green-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-900 mb-2">
                    VALID TICKET
                  </h2>
                  <p className="text-lg text-green-800 mb-4">
                    {result.message}
                  </p>
                  {result.ticketInfo && (
                    <div className="bg-white rounded-lg p-4 text-left space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Customer:</span>{" "}
                        {result.ticketInfo.customerName}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Ticket:</span>{" "}
                        {result.ticketInfo.ticketName}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <XCircle className="h-24 w-24 text-red-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-red-900 mb-2">
                    {result.ticketInfo?.alreadyUsed
                      ? "ALREADY USED"
                      : "INVALID TICKET"}
                  </h2>
                  <p className="text-lg text-red-800 mb-4">{result.message}</p>
                  {result.ticketInfo && (
                    <div className="bg-white rounded-lg p-4 text-left space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Customer:</span>{" "}
                        {result.ticketInfo.customerName}
                      </p>
                      {result.ticketInfo.usedAt && (
                        <p className="text-sm">
                          <span className="font-semibold">Used at:</span>{" "}
                          {new Date(result.ticketInfo.usedAt).toLocaleString(
                            "hu-HU",
                          )}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <Button
                onClick={() => {
                  setResult(null);
                  startScanning();
                }}
                className="w-full mt-6"
                size="lg"
              >
                Scan Next Ticket
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
