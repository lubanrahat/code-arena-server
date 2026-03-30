# CodeArena Server

[![Tech Stack](https://img.shields.io/badge/Stack-TypeScript%20%7C%20Express%20%7C%20Prisma%20%7C%20Bun-blue)](https://github.com/lubanrahat/code-arena-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeArena Server is the robust backend engine powering the **CodeArena** platform—a Algorithmic problem solving and coding practice ecosystem. Built with performance and scalability in mind, it handles everything from real-time code execution to secure subscription management.

---

## 🌐 Live URLs

- **API Documentation/Endpoint**: [code-arena-server.vercel.app/api/v1](https://code-arena-server.vercel.app/api/v1)
- **Frontend Client**: [code-arena-client.vercel.app](https://code-arena-client.vercel.app)

---

## ✨ Key Features

- 🔐 **Multi-Provider Auth**: Secure authentication via JWT, plus seamless GitHub and Google OAuth integration.
- 💻 **Real-time Code Execution**: Integrated with the **Judge0 API** to execute and validate user submissions across multiple languages.
- 📊 **Dynamic Leaderboard**: Global ranking system that tracks user performance and problem-solving milestones.
- 💳 **Subscription Management**: Full Stripe integration for monthly and yearly premium plans.
- 🤖 **AI-Powered Discussions**: Intelligent discussion modules to help users brainstorm solutions.
- 🛠️ **Admin Suite**: Comprehensive controls for managing problems, users, and platform health.
- 🏗️ **Type-Safe Development**: Fully implemented in TypeScript with Zod for robust data validation.

---

## 🚀 Technologies Used

- **Runtime**: [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Hosted on [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Passport.js, JSON Web Tokens (JWT), Bcrypt
- **Payments**: [Stripe](https://stripe.com/)
- **API Integration**: Judge0 RapidAPI
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: Winston

---

## 📁 Project Structure

```text
code-arena-server/
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma data model
├── src/                  # Main source code
│   ├── server.ts         # Entry point (Server initialization)
│   └── app/              # Core application logic
│       ├── app.ts        # Express application setup
│       ├── config/       # Global configuration and constants
│       ├── lib/          # Custom libraries and integrations (Stripe, Passport)
│       ├── modules/      # Feature-based modular architecture
│       │   ├── auth/     # Authentication module
│       │   ├── problems/ # Coding problems module
│       │   ├── user/     # User profile and settings module
│       │   └── ...       # Other domain-driven modules
│       ├── routes/       # API route aggregations
│       └── shared/       # Shared utilities, interfaces, and types
├── .env                  # Environment variables (do not commit)
├── package.json          # Project dependencies and scripts
└── vercel.json           # Vercel deployment configuration
```

---

## 🛠️ Setup & Installation

### Prerequisites

- [Bun](https://bun.sh/docs/installation) installed on your machine.
- A PostgreSQL database (e.g., Neon.tech).

### Step-by-Step Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lubanrahat/code-arena-server.git
   cd code-arena-server
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=8080
   DATABASE_URL="your_postgresql_url"
   JWT_SECRET="your_jwt_secret"
   JUDGE0_API_KEY="your_judge0_key"
   GITHUB_CLIENT_ID="your_github_id"
   GITHUB_CLIENT_SECRET="your_github_secret"
   GOOGLE_CLIENT_ID="your_google_id"
   GOOGLE_CLIENT_SECRET="your_google_secret"
   STRIPE_SECRET_KEY="your_stripe_secret"
   ```

4. **Initialize the Database**
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   bun dev
   ```

---

## 📈 Scripts

- `bun dev`: Runs the server with hot-reloading.
- `bun build`: Compiles the project for production.
- `bun start`: Runs the compiled production build.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
