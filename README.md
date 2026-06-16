# EduResult Pro v2.0

A comprehensive Multi-School Educational Ecosystem Platform connecting **Parents, Schools, and Vendors** through a Universal QR Passport system.

## Architecture

```
EduResult Pro/
├── frontend/          # React + TypeScript + Tailwind CSS + shadcn/ui
│   ├── src/pages/     # 18 pages (Landing, Parent, Vendor, School, Admin)
│   ├── src/components/# Shared components (Navbar, Footer, Layout)
│   ├── src/lib/       # Mock data service
│   ├── src/types/     # TypeScript type definitions
│   └── public/        # Static assets (images, icons)
│
└── backend/           # Node.js + Express + PostgreSQL + Prisma
    ├── src/routes/    # 9 API route modules (50+ endpoints)
    ├── src/services/  # QR, Email, Pricing, Socket, Audit
    ├── src/middleware/# Auth, Validation, Rate Limiting
    ├── src/utils/     # Error handling, Response helpers
    └── prisma/        # Database schema (19 models)
```

## Frontend Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v3.4.19 + shadcn/ui
- Framer Motion (animations)
- Recharts (data visualization)
- qrcode.react (QR generation)

## Backend Stack

- Node.js 20 + Express
- PostgreSQL + Prisma ORM
- JWT Authentication (access + refresh tokens)
- Socket.IO (real-time notifications)
- bcryptjs (password hashing)
- Zod (input validation)
- Winston (logging)

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```

### Backend
```bash
cd backend
npm install
# Set DATABASE_URL in .env
npx prisma migrate dev
npm run dev
```

## Key Features

- **Universal QR Passport** - One QR per student works across all schools
- **AI School Matching** - Compatibility scores for school recommendations
- **Dynamic Pricing** - Demand-based surge pricing + bulk discounts
- **Vendor-Mediated Cash Payments** - No online payments, cash via vendors
- **Real-Time Notifications** - WebSocket live updates
- **Blockchain Document Verification** - Immutable credential anchoring
- **Emergency Protocols** - Pandemic, disaster, outage, security modes

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/v2/auth/register`, `/api/v2/auth/login`, `/api/v2/auth/vendor/login`, `/api/v2/auth/school/login` |
| Parent | `/api/v2/parent/profile`, `/api/v2/parent/documents`, `/api/v2/parent/applications`, `/api/v2/parent/tickets` |
| Schools | `/api/v2/schools`, `/api/v2/schools/:id/match-score` |
| Cart | `/api/v2/cart/add`, `/api/v2/cart/checkout` |
| Vendor | `/api/v2/vendor/dashboard`, `/api/v2/vendor/confirm-payment`, `/api/v2/vendor/tickets` |
| School | `/api/v2/school/applicants`, `/api/v2/school/schedule-interview` |
| Admin | `/api/v2/admin/analytics`, `/api/v2/admin/schools`, `/api/v2/admin/vendors` |
| Settings | `/api/v2/settings/academic-year`, `/api/v2/settings/grading-scale` |

## License

ISC
