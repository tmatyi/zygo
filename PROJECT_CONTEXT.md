# ZYGO - Project Strategy & Context

## 1. Executive Summary

ZYGO is a modern, high-performance ticket sales platform specifically tailored for the Hungarian market. It aims to disrupt current competitors (e.g., Cooltix) by offering superior UI/UX and a more competitive pricing model.

## 2. Competitive Advantage

- **Target Competitor:** Cooltix.hu
- **ZYGO Advantage:** - 20-30% lower handling fees for customers.
  - Mobile-first, blazing fast purchasing flow.
  - Modern, minimalist aesthetic for event organizers.

## 3. Business Model (Model B)

- **Organizer Revenue:** Receives 100% of the ticket base price.
- **Platform Revenue:** Generated via a "Handling Fee" paid by the customer.
- **Pricing Target:** Approx. 3.2% + 140 HUF per ticket (subject to final payment provider costs).

## 4. Technical Architecture

- **Framework:** Next.js (App Router, TS)
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Storage)
- **Styling:** Tailwind CSS + ShadcnUI
- **Integrations:** - Barion (Primary Payment Gateway)
  - Billingo (Automated Invoicing)

## 5. Full Project Roadmap

- **M1 (Completed):** Strategy & Conceptualization.
- **M2 (Current):** Core Infrastructure, Database & Auth.
- **M3:** Event Management (Organizer Dashboard).
- **M4:** Ticket Logic & Purchasing Flow (Customer View).
- **M5:** Payment Integration (Barion/Stripe).
- **M6:** Check-in App & QR Code validation system.
- **M7:** Invoicing (Billingo) & Launch.

## 6. Critical Success Factors

- **Trust:** The purchasing flow must be bug-free and highly secure.
- **Speed:** The platform must handle high-traffic ticket drops without latency.
- **Simplicity:** Onboarding an organizer should take less than 5 minutes.
