# Next.js SaaS Boilerplate

A production-ready Next.js boilerplate with authentication, Stripe billing, and analytics — everything you need to ship your SaaS faster.

## Features

- **Authentication** — NextAuth.js with Google, GitHub, and email providers
- **Stripe Billing** — Subscriptions, webhooks, and customer portal
- **Database** — Prisma ORM with PostgreSQL (works with Neon, Supabase, etc.)
- **Analytics** — PostHog and Vercel Analytics integration
- **UI Components** — TailwindCSS + DaisyUI component library
- **Type Safety** — Full TypeScript support
- **SEO Ready** — Next.js metadata API and sitemap generation

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth.js v4 |
| Database | Prisma + PostgreSQL |
| Payments | Stripe |
| Styling | TailwindCSS + DaisyUI |
| State | Zustand + React Query |
| Analytics | PostHog, Vercel Analytics |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon/Supabase account)
- Stripe account
- (Optional) Google/GitHub OAuth credentials

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/10x-oss/nextjs-saas-boilerplate.git
cd nextjs-saas-boilerplate
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

4. **Set up the database**

```bash
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (app)/         # Authenticated routes
│   │   ├── (marketing)/   # Public pages
│   │   └── api/           # API routes
│   ├── core/              # Core UI components
│   ├── features/          # Feature modules
│   │   ├── billing/       # Stripe components
│   │   └── layout/        # Layout components
│   ├── lib/               # Infrastructure
│   │   ├── posthog/       # Analytics
│   │   └── services/      # Backend services
│   └── shared/            # Shared utilities
│       ├── auth/          # Auth configuration
│       ├── toast/         # Toast notifications
│       └── utils/         # Helper functions
├── public/                # Static assets
└── package.json
```

## Configuration

### Authentication

Configure OAuth providers in `src/shared/auth/authOptions.ts`:

```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  }),
]
```

### Stripe

1. Create products and prices in your Stripe dashboard
2. Add price IDs to `.env`:
   ```env
   STRIPE_PRICE_ID_PRO_MONTHLY="price_..."
   STRIPE_PRICE_ID_PRO_YEARLY="price_..."
   ```
3. Set up webhook endpoint: `https://yourdomain.com/api/webhook`

### Database

The schema includes:
- User management with NextAuth.js
- Subscription tracking for Stripe
- User settings and preferences

Run migrations:
```bash
npx prisma migrate dev
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build for production:
```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript checks |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:migrate` | Run database migrations |

## License

MIT License — see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with the [10x-oss](https://github.com/10x-oss) boilerplate.
