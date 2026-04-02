<p align="center">
  <img src="https://img.shields.io/badge/CodeArena-Server-0f172a?style=for-the-badge&labelColor=6366f1&logo=thunderstore&logoColor=white" alt="CodeArena Server" />
</p>

<h1 align="center">CodeArena Server</h1>

<p align="center">
  <strong>The high-performance backend engine powering the CodeArena competitive programming platform.</strong>
</p>

<p align="center">
  <a href="https://code-arena-server.vercel.app/api/v1"><img src="https://img.shields.io/badge/API-Live-22c55e?style=flat-square&logo=vercel&logoColor=white" alt="API Status" /></a>
  <a href="https://code-arena-client.vercel.app"><img src="https://img.shields.io/badge/Client-Live-3b82f6?style=flat-square&logo=vercel&logoColor=white" alt="Client Status" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2d3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Bun-Runtime-f9f1e1?style=flat-square&logo=bun&logoColor=14151a" alt="Bun" />
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-eab308?style=flat-square" alt="License: MIT" /></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Live URLs](#-live-urls)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [License](#-license)

---

## Overview

CodeArena Server is the RESTful API backend for **CodeArena** — a full-featured algorithmic problem-solving and competitive coding platform. It handles user authentication, real-time code execution, subscription billing, community solutions, leaderboards, and an AI-powered discussion system. Built with TypeScript, Express 5, and Prisma on the Bun runtime, it is designed for performance, type safety, and a clean modular architecture.

---

## 🌐 Live URLs

| Environment | URL |
| :---------- | :-- |
| **API** | [code-arena-server.vercel.app/api/v1](https://code-arena-server.vercel.app/api/v1) |
| **Frontend Client** | [code-arena-client.vercel.app](https://code-arena-client.vercel.app) |

---

## ✨ Key Features

| Category | Details |
| :------- | :------ |
| **Multi-Provider Authentication** | Local JWT auth + GitHub OAuth + Google OAuth via Passport.js |
| **Code Execution Engine** | Multi-language code execution and test-case validation via Judge0 API |
| **Problem Management** | Full CRUD with difficulty tiers, tags, hints, editorials, and premium-gated content |
| **Community Solutions** | User-submitted solutions with voting (like/dislike) and comment threads |
| **Leaderboard System** | Global ranking based on score and problem-solving performance |
| **Subscription Billing** | Stripe integration with monthly/yearly plans, webhooks, and payment history |
| **AI Discussions** | Per-problem AI chat threads for guided problem-solving |
| **Playlists & Bookmarks** | Personalized problem collections and quick-access bookmarks |
| **Admin Dashboard** | Platform-wide management of users, problems, and contributions |
| **Contributor Portal** | Community contribution requests with acceptance workflow |
| **Structured Logging** | Winston-based request/error logging with request-ID tracing |
| **Type-Safe Validation** | End-to-end type safety with Zod schema validation on all inputs |

---

## 🛠 Tech Stack

| Layer | Technology |
| :---- | :--------- |
| **Runtime** | [Bun](https://bun.sh/) |
| **Framework** | [Express.js 5](https://expressjs.com/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) on [Neon](https://neon.tech/) (serverless) |
| **ORM** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| **Authentication** | [Passport.js](http://www.passportjs.org/) · JWT · Bcrypt |
| **Payments** | [Stripe](https://stripe.com/) (Checkout, Subscriptions, Webhooks) |
| **Code Execution** | [Judge0 API](https://judge0.com/) via RapidAPI |
| **Validation** | [Zod 4](https://zod.dev/) |
| **Logging** | [Winston](https://github.com/winstonjs/winston) |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless Functions) |

---

## 🏗 Architecture

The server follows a **modular, domain-driven** architecture. Each feature is encapsulated in its own module with a consistent internal structure:

```
module/
├── module.routes.ts        # Route definitions and middleware binding
├── module.controller.ts    # Request handling and response formatting
├── module.service.ts       # Core business logic and database operations
├── module.validation.ts    # Zod schemas for request validation
└── module.interface.ts     # TypeScript interfaces and types
```

### Request Lifecycle

```
Client Request
  → CORS Gate
  → Body Parsers (JSON / Raw for Stripe webhooks)
  → Cookie Parser
  → Request ID Middleware (unique trace ID per request)
  → Request Logger (Winston)
  → Route Handler
    → Validation Middleware (Zod)
    → Auth / Premium Middleware (JWT verification, role checks)
    → Controller → Service → Prisma → PostgreSQL
  → Global Error Handler
  → Response
```

---

## 📁 Project Structure

```text
code-arena-server/
├── api/
│   └── index.ts                    # Vercel serverless entry point
├── prisma/
│   ├── schema.prisma               # Database schema (15 models)
│   └── migrations/                 # Database migration history
├── src/
│   ├── server.ts                   # Application entry point
│   └── app/
│       ├── app.ts                  # Express app factory (CORS, middleware, routes)
│       ├── config/
│       │   └── env.ts              # Zod-validated environment configuration
│       ├── lib/
│       │   ├── prisma.ts           # Prisma client singleton
│       │   └── judge0.lib.ts       # Judge0 API integration
│       ├── modules/
│       │   ├── admin/              # Admin management (users, problems, stats)
│       │   ├── ai-discussion/      # AI-powered problem discussion threads
│       │   ├── auth/               # Authentication (local + OAuth)
│       │   ├── contribute/         # Community contribution requests
│       │   ├── executeCode/        # Code execution via Judge0
│       │   ├── health/             # Health check endpoint
│       │   ├── leaderboard/        # Global ranking system
│       │   ├── payment/            # Stripe billing & webhooks
│       │   ├── playlist/           # User-created problem playlists
│       │   ├── problems/           # Problem CRUD & management
│       │   ├── solution/           # Community solutions, votes, comments
│       │   ├── submission/         # Code submission & test results
│       │   └── user/               # User profiles & settings
│       ├── routes/
│       │   └── index.ts            # Central route aggregator
│       └── shared/
│           ├── constants/          # Application-wide constants
│           ├── errors/             # Custom error classes
│           ├── interfaces/         # Shared TypeScript interfaces
│           ├── logger/             # Winston logger configuration
│           ├── middlewares/        # Global middlewares
│           │   ├── auth.middleware.ts
│           │   ├── premium.middleware.ts
│           │   ├── validate.middleware.ts
│           │   ├── global-error.middleware.ts
│           │   ├── not-found.middlewares.ts
│           │   ├── request-id.middleware.ts
│           │   └── request-logger.middleware.ts
│           ├── types/              # Shared type definitions
│           └── utils/              # Helper utilities
├── .env                            # Environment variables (not committed)
├── .gitignore
├── package.json
├── prisma.config.ts                # Prisma CLI configuration
├── tsconfig.json                   # TypeScript compiler options
└── vercel.json                     # Vercel deployment configuration
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/` | Health check |

### Authentication

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/auth/register` | Register a new account |
| `POST` | `/auth/login` | Login with email & password |
| `GET` | `/auth/github` | Initiate GitHub OAuth flow |
| `GET` | `/auth/github/callback` | GitHub OAuth callback |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `GET` | `/auth/google/callback` | Google OAuth callback |

### Problems

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/problems` | List all problems (with filters) |
| `GET` | `/problems/:id` | Get problem details |
| `POST` | `/problems` | Create a problem (Admin) |
| `PUT` | `/problems/:id` | Update a problem (Admin) |
| `DELETE` | `/problems/:id` | Delete a problem (Admin) |

### Code Execution

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/execute-code` | Execute code against test cases |

### Submissions

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/submission` | Get user submissions |
| `POST` | `/submission` | Submit a solution |

### Solutions

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/solution` | List community solutions |
| `POST` | `/solution` | Post a solution |
| `POST` | `/solution/:id/vote` | Vote on a solution |
| `POST` | `/solution/:id/comment` | Comment on a solution |

### Playlists

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/playlist` | Get user playlists |
| `POST` | `/playlist` | Create a playlist |
| `PUT` | `/playlist/:id` | Update a playlist |
| `DELETE` | `/playlist/:id` | Delete a playlist |

### Leaderboard

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/leaderboard` | Get global rankings |

### Payments

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/payment/checkout` | Create Stripe checkout session |
| `POST` | `/payment/webhook` | Stripe webhook handler |

### AI Discussion

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/ai-discussion/:problemId` | Get discussion thread |
| `POST` | `/ai-discussion/:problemId` | Send a message |

### User

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/user/profile` | Get current user profile |
| `PUT` | `/user/profile` | Update profile |

### Admin

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `GET` | `/admin/stats` | Platform statistics |
| `GET` | `/admin/users` | Manage users |

### Contributions

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/contribute` | Submit a contribution request |

---

## 🗄 Database Schema

The PostgreSQL database contains **15 models** managed by Prisma:

```mermaid
erDiagram
    User ||--o| Profile : has
    User ||--o{ Problem : creates
    User ||--o{ Submission : makes
    User ||--o{ ProblemSolved : tracks
    User ||--o{ Playlist : owns
    User ||--o{ AiDiscussion : participates
    User ||--o{ Payment : makes
    User ||--o{ Bookmark : saves
    User ||--o{ Contribution : submits
    User ||--o{ Solution : writes
    User ||--o{ SolutionVote : casts
    User ||--o{ SolutionComment : posts

    Problem ||--o{ Submission : receives
    Problem ||--o{ ProblemSolved : solved_by
    Problem ||--o{ ProblemInPlaylist : listed_in
    Problem ||--o{ AiDiscussion : discussed
    Problem ||--o{ Bookmark : bookmarked
    Problem ||--o{ Solution : has

    Submission ||--o{ TestCaseResult : contains
    Playlist ||--o{ ProblemInPlaylist : contains
    Solution ||--o{ SolutionVote : receives
    Solution ||--o{ SolutionComment : receives
```

### Key Models

| Model | Purpose |
| :---- | :------ |
| `User` | Accounts with roles (USER / ADMIN) and Stripe subscription data |
| `Profile` | Extended profile with score, coins, social links |
| `Problem` | Coding problems with difficulty, tags, test cases, and code snippets |
| `Submission` | Code submissions with per-test-case results |
| `Solution` | Community-shared solutions with voting and comments |
| `Playlist` | User-curated problem collections |
| `Payment` | Stripe payment transaction records |
| `AiDiscussion` | AI chat threads scoped to a user + problem |
| `Contribution` | Community contribution applications with review workflow |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/docs/installation) (v1.0+)
- [PostgreSQL](https://www.postgresql.org/) database (or a free [Neon](https://neon.tech/) instance)
- API keys for: [Judge0 (RapidAPI)](https://rapidapi.com/judge0-official/api/judge0-ce), [Stripe](https://stripe.com/), [GitHub OAuth](https://docs.github.com/en/apps/oauth-apps), [Google OAuth](https://console.cloud.google.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/lubanrahat/code-arena-server.git
   cd code-arena-server
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Application
   PORT=8080
   NODE_ENV=development

   # Database
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

   # JWT
   JWT_SECRET="your-jwt-secret"
   JWT_EXPIRES_IN="7d"

   # Judge0 (RapidAPI)
   JUDGE0_API_KEY="your-judge0-api-key"

   # GitHub OAuth
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Session
   SESSION_SECRET="your-session-secret"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_MONTHLY="20$"
   STRIPE_PRICE_YEARLY="100$"

   # URLs
   CLIENT_URL="http://localhost:3000"
   BACKEND_URL="http://localhost:8080/api/v1"
   ```

4. **Set up the database**

   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Start the development server**

   ```bash
   bun dev
   ```

   The server will start at `http://localhost:8080` with hot-reloading enabled.

---

## 📜 Scripts

| Command | Description |
| :------ | :---------- |
| `bun dev` | Start dev server with `--watch` (hot-reload) |
| `bun run build` | Compile to production bundle in `./dist` |
| `bun start` | Run the production build via Node.js |
| `bunx prisma generate` | Generate Prisma client from schema |
| `bunx prisma db push` | Push schema changes to the database |
| `bunx prisma studio` | Open Prisma Studio (visual DB editor) |
| `bunx prisma migrate dev` | Create and apply a new migration |

---

## 🚢 Deployment

The server is configured for **Vercel** deployment as a serverless function.

- **Entry point**: `dist/server.js` (built via `bun run build`)
- **Config**: See [`vercel.json`](vercel.json) for build and routing configuration
- All routes are proxied to the single serverless function via a catch-all route

```bash
# Deploy to Vercel
vercel --prod
```

> **Note**: The Prisma client is generated during the Vercel install step with a special workaround for `prisma.config.ts` compatibility (see `vercel.json` → `installCommand`).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the competitive programming community
</p>
