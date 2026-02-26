# ZYGO - Modern Ticket Sales Platform

A high-performance ticket sales platform built for the Hungarian market, designed to compete with platforms like Cooltix with superior UX and lower fees.

## Tech Stack

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **Styling:** Tailwind CSS + ShadcnUI
- **Icons:** Lucide React
- **Validation:** Zod
- **Payment:** Barion (planned)
- **Invoicing:** Billingo (planned)

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project created

### 2. Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions including:

- Environment variables configuration
- Database schema and RLS policies
- Authentication setup

### 3. Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   └── auth/              # Authentication routes
├── components/            # React components
│   └── ui/               # ShadcnUI components
├── lib/                   # Utilities and configurations
│   └── supabase/         # Supabase client and helpers
│       ├── client.ts     # Browser client
│       ├── server.ts     # Server client
│       ├── types.ts      # TypeScript types
│       ├── queries.ts    # Database queries
│       └── auth.ts       # Auth helpers
├── middleware.ts          # Session management
└── .windsurfrules        # Development standards
```

## Development Standards

See [.windsurfrules](./.windsurfrules) for:

- TypeScript strict mode (no `any`)
- File size limits (300-400 lines)
- Component architecture
- Security best practices

## Project Roadmap

- ✅ **M1:** Strategy & Conceptualization
- ✅ **M2:** Core Infrastructure, Database & Auth
- ✅ **M3:** Event Management (Organizer Dashboard)
- ✅ **M4:** Ticket Logic & Purchasing Flow
- ✅ **M5:** Payment Integration (Barion)
- ✅ **M6:** Check-in App & QR validation
- 🔄 **M7:** Invoicing (Billingo) & Launch

## 🎉 Current Version: v0.3.0

**Complete M6 Implementation - QR Check-in System**

### ✅ Features Available

- **Event Management** - Create and manage events with tickets
- **Online Ticketing** - Customer purchase flow with payment
- **Barion Integration** - Real payment processing
- **QR Code Generation** - Unique tokens for every ticket
- **Mobile Scanner** - Camera-based check-in system
- **Check-in Tracking** - Usage validation and timestamps

### 📱 Mobile Ready

- Scanner works on mobile browsers
- QR codes optimized for phone display
- Touch-friendly interface
- Camera permission handling

### 🚀 Production Features

- Complete authentication system
- Payment processing with Barion
- QR-based check-in validation
- Real-time feedback screens
- Database tracking and reporting

**GitHub Repository:** https://github.com/tmatyi/zygo
**Latest Release:** https://github.com/tmatyi/zygo/releases/tag/v0.3.0

## Documentation

- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Business strategy and goals
- [SETUP.md](./SETUP.md) - M2 setup and configuration guide
- [M3_DATABASE_SCHEMA.sql](./M3_DATABASE_SCHEMA.sql) - M3 database schema
- [M3_COMPLETION_SUMMARY.md](./M3_COMPLETION_SUMMARY.md) - M3 implementation details
- [M4_DATABASE_SCHEMA.sql](./M4_DATABASE_SCHEMA.sql) - M4 database schema
- [M4_COMPLETION_SUMMARY.md](./M4_COMPLETION_SUMMARY.md) - M4 implementation details
- [M5_DATABASE_SCHEMA.sql](./M5_DATABASE_SCHEMA.sql) - M5 database schema
- [M5_COMPLETION_SUMMARY.md](./M5_COMPLETION_SUMMARY.md) - M5 implementation details
- [M6_DATABASE_SCHEMA.sql](./M6_DATABASE_SCHEMA.sql) - M6 database schema
- [RELEASE_NOTES_v0.3.0.md](./RELEASE_NOTES_v0.3.0.md) - Complete M6 implementation details
