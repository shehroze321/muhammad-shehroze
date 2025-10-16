# EchoWrite - AI Social Media Post Creator

EchoWrite is a full-stack web application that helps users create engaging social media posts using AI. The application features a ChatGPT-like interface with conversation history, subscription management, and payment integration.

## Features

- **AI-Powered Content Creation**: Generate social media posts using OpenAI GPT-4
- **3-Iteration Refinement**: Each post goes through generate → critique → improve cycle
- **ChatGPT-Like Interface**: Familiar conversation interface with full history and search
- **Multi-Language Support**: Create posts in English and Urdu with voice or text input
- **Subscription Management**: Free trial with 3 messages, then paid plans (Basic, Pro, Enterprise)
- **Stripe Payment Integration**: Secure payment processing with webhook support
- **Email Verification**: OTP-based email verification system
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **Lucide React** - Icon library
- **Shadcn/ui** - UI component library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **SQLite** - Database (development)
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Nodemailer** - Email service

## Project Structure

```
ai-social-post-creator/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── chat/           # Chat interface
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── profile/        # User profile
│   │   ├── subscriptions/  # Subscription plans
│   │   └── verify-email/   # Email verification
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── chat/          # Chat-related components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utilities and configurations
│   │   ├── api/           # API layer (RTK Query)
│   │   └── store/         # Redux store
│   └── types/             # TypeScript type definitions
├── backend/                # Express.js backend application
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── users/     # User management
│   │   │   ├── chat/      # Chat functionality
│   │   │   ├── conversations/ # Conversation management
│   │   │   ├── sessions/  # Session management
│   │   │   └── subscriptions/ # Subscription management
│   │   ├── shared/        # Shared utilities
│   │   └── config/        # Configuration files
│   ├── prisma/            # Database schema and migrations
│   └── scripts/           # Utility scripts
└── README.md              # This file
```

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Git
- PostgreSQL 15+ (production) or SQLite (development)
- OpenAI API key
- Stripe API keys (for payments)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ai-social-post-creator
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create environment file:
```bash
cp env.example .env
```

Configure the `.env` file with your settings:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="EchoWrite <noreply@echowrite.ai>"

# App Configuration
APP_NAME=EchoWrite
APP_URL=http://localhost:3000
ANONYMOUS_SESSION_EXPIRY_DAYS=30
FREE_CONVERSATIONS_LIMIT=3
FREE_MESSAGES_LIMIT=3
```

Initialize the database and seed subscription plans:

**For Development (SQLite):**
```bash
npm run env:dev
npm run setup:dev
```

**For Production (PostgreSQL):**
```bash
# First, create PostgreSQL database and update DATABASE_URL in .env
npm run env:prod
npm run setup:prod
```

Start the backend server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create environment file:
```bash
cp .env.example .env.local
```

Configure the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## Usage

1. **Registration**: Visit `http://localhost:3000/register` to create an account
2. **Email Verification**: Check your email (or backend console in dev) for the OTP code
3. **Free Trial**: Get 3 free AI-generated posts to start
4. **Subscription**: Choose from Starter ($20/mo), Professional ($40/mo), or Business ($60/mo) plans
5. **Chat Interface**: Create and refine social media posts through ChatGPT-like conversation

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name }`
  - Returns: User object with verification message
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: JWT token and user object
  
- `POST /api/auth/verify-email` - Verify email with OTP
  - Body: `{ userId, otp }`
  - Returns: Success message
  
- `POST /api/auth/resend-verification` - Resend verification OTP
  - Body: `{ userId }`
  - Returns: Success message
  
- `POST /api/auth/forgot-password` - Request password reset
  - Body: `{ email }`
  - Returns: Success message
  
- `POST /api/auth/reset-password` - Reset password with OTP
  - Body: `{ userId, otp, newPassword }`
  - Returns: Success message
  
- `GET /api/auth/profile` - Get current user profile
  - Auth: Required (JWT)
  - Returns: User profile with quota info
  
- `PATCH /api/auth/profile` - Update user profile
  - Auth: Required (JWT)
  - Body: `{ name?, email? }`
  - Returns: Updated user object
  
- `POST /api/auth/logout` - Logout user
  - Auth: Required (JWT)
  - Returns: Success message

### Sessions (`/api/sessions`) - Anonymous Users
- `POST /api/sessions` - Create anonymous session
  - Returns: Session ID and metadata
  
- `GET /api/sessions/:id` - Get session info
  - Returns: Session details with quota
  
- `POST /api/sessions/:id/claim` - Claim anonymous chats on signup
  - Auth: Required (JWT)
  - Returns: Number of conversations claimed

### Conversations (`/api/conversations`)
- `POST /api/conversations` - Create new conversation
  - Auth: Required (JWT or Session)
  - Body: `{ title? }`
  - Returns: Conversation object
  
- `GET /api/conversations` - Get all conversations (paginated)
  - Auth: Required (JWT or Session)
  - Query: `{ search?, page?, limit? }`
  - Returns: `{ conversations, total, page, totalPages, hasMore }`
  
- `GET /api/conversations/:id` - Get conversation details
  - Auth: Required (JWT or Session)
  - Returns: Conversation object
  
- `PATCH /api/conversations/:id` - Update conversation title
  - Auth: Required (JWT or Session)
  - Body: `{ title }`
  - Returns: Updated conversation
  
- `DELETE /api/conversations/:id` - Delete conversation
  - Auth: Required (JWT or Session)
  - Returns: Success message

### Chat (`/api/chat`)
- `POST /api/chat/conversations/:id/messages` - Send message & get AI response
  - Auth: Required (JWT or Session)
  - Body: `{ content, language? }`
  - Returns: `{ userMessage, aiMessage, conversation }`
  
- `GET /api/chat/conversations/:id/messages` - Get all messages in conversation
  - Auth: Required (JWT or Session)
  - Returns: Array of messages
  
- `GET /api/chat/usage` - Get usage statistics
  - Auth: Required (JWT or Session)
  - Returns: Quota and usage info

### Subscriptions (`/api/subscriptions`)
- `GET /api/subscriptions/plans` - Get all subscription plans
  - Returns: Array of available plans
  
- `GET /api/subscriptions/plans/:tier` - Get plan by tier
  - Params: `tier` (Starter, Professional, Business)
  - Returns: Plan details
  
- `GET /api/subscriptions/user` - Get user subscriptions
  - Auth: Required (JWT)
  - Returns: Active and past subscriptions
  
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout session
  - Auth: Required (JWT)
  - Body: `{ planId, billingCycle }` (monthly or yearly)
  - Returns: `{ sessionId, url }` - Redirect to Stripe
  
- `POST /api/subscriptions/verify-checkout` - Verify payment after checkout
  - Auth: Required (JWT)
  - Body: `{ sessionId }`
  - Returns: Subscription details
  
- `POST /api/subscriptions/webhook` - Stripe webhook handler
  - Auth: Stripe signature
  - Body: Stripe event payload
  - Handles: payment_intent.succeeded, checkout.session.completed, etc.
  
- `POST /api/subscriptions/cancel` - Cancel subscription
  - Auth: Required (JWT)
  - Body: `{ subscriptionId }`
  - Returns: Cancellation confirmation

### Health Check
- `GET /health` - Server health status
  - Returns: `{ status, timestamp, database }`
  
- `GET /api/health` - API health status
  - Returns: `{ status, timestamp, database }`

---

## Authentication

The API supports two authentication methods:

### 1. JWT Token (Authenticated Users)
```
Authorization: Bearer <jwt-token>
```

### 2. Session ID (Anonymous Users)
```
X-Session-Id: <session-uuid>
```

---

## Database Schema

The application uses **Prisma ORM** with **SQLite** (development) or **PostgreSQL** (production).

### Key Models:
- **User** - User accounts with quota tracking and email verification
- **AnonymousSession** - Temporary sessions for non-authenticated users (3 free conversations)
- **Conversation** - Chat threads (belongs to user or session)
- **ChatMessage** - Individual messages in conversations
- **SubscriptionPlan** - Available subscription tiers (Starter, Professional, Business)
- **Subscription** - User subscription instances with billing details
- **UserDevice** - Device verification for security
- **OTPCode** - One-time passwords for email verification and password reset

### Subscription Plans:
- **Free Trial**: 3 messages, no subscription required
- **Starter**: $20/month or $192/year - 50 messages/month
- **Professional**: $40/month or $384/year - 200 messages/month
- **Business**: $60/month or $576/year - Unlimited messages

---

## Payment Integration

The application integrates with **Stripe** for subscription management:

1. **Checkout Session**: Creates Stripe checkout sessions for subscription plans
2. **Webhook Handling**: Processes successful payments and creates subscriptions
3. **Payment Verification**: Backup verification system for failed/delayed webhooks
4. **Subscription Management**: Cancel, upgrade, and downgrade subscriptions

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## Development

### Backend Development
```bash
cd backend

# Development
npm run dev                  # Start development server with hot reload
npm run env:dev             # Switch to development environment (SQLite)
npm run env:prod            # Switch to production environment (PostgreSQL)
npm run env:status          # Check current environment

# Database
npm run setup:dev           # Setup development database with seed data
npm run setup:prod          # Setup production database with seed data
npm run prisma:studio       # Open Prisma Studio (DB GUI)
npm run prisma:generate     # Generate Prisma client
npm run seed                # Seed subscription plans

# Build
npm run build               # Build for production
npm start                   # Start production server

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint errors
```

### Frontend Development
```bash
cd frontend

npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
cd backend
npx prisma studio    # Open Prisma Studio GUI
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes
```

---

## Testing

See **`TESTING_GUIDANCE.md`** for comprehensive API testing instructions including:
- Complete testing workflows
- All API endpoints with examples
- Subscription and payment testing
- Stripe webhook testing
- Test data setup

**Quick Health Check:**
```bash
curl http://localhost:5000/health
```

---

## Deployment

### Backend Deployment

**1. Environment Setup**
- Set `NODE_ENV=production`
- Use PostgreSQL for production database
- Configure production email service
- Set up Stripe webhook endpoints

**2. Database Setup**
```bash
# Switch to production mode
npm run env:prod

# Setup database and seed plans
npm run setup:prod
```

**3. Deploy**
- Recommended platforms: Railway, Render, Fly.io, AWS
- Database hosting: Supabase, Railway PostgreSQL, Neon
- Ensure all environment variables are set

**4. Stripe Webhooks**
```bash
# Set up webhook endpoint in Stripe Dashboard
https://your-api-domain.com/api/subscriptions/webhook

# Add webhook events:
- checkout.session.completed
- payment_intent.succeeded
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
```

### Frontend Deployment

**1. Build**
```bash
cd frontend
npm run build
```

**2. Deploy**
- Recommended platforms: Vercel, Netlify
- Set environment variables:
  - `NEXT_PUBLIC_API_URL` - Your backend API URL
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

**3. Configure**
- Update CORS settings in backend for your frontend domain
- Update Stripe redirect URLs

---

## Environment Variables

### Backend (.env)

**Server Configuration:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL(s) for CORS (comma-separated for multiple origins)
  - Single: `http://localhost:3000`
  - Multiple: `http://localhost:3000,https://yourdomain.com,https://staging.yourdomain.com`

**Database:**
- `DATABASE_URL` - Database connection string
  - SQLite (dev): `file:./dev.db`
  - PostgreSQL (prod): `postgresql://user:password@host:5432/database`

**JWT:**
- `JWT_SECRET` - JWT signing secret (use strong random string)
- `JWT_EXPIRES_IN` - Token expiry (default: 7d)

**OpenAI:**
- `OPENAI_API_KEY` - OpenAI API key for content generation

**Stripe:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Email (Nodemailer):**
- `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (587 for TLS)
- `EMAIL_SECURE` - Use SSL (false for TLS)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password or app password
- `EMAIL_FROM` - From address (e.g., "EchoWrite <noreply@echowrite.ai>")

**App Configuration:**
- `APP_NAME` - Application name
- `APP_URL` - Frontend URL
- `ANONYMOUS_SESSION_EXPIRY_DAYS` - Session expiry (default: 30)
- `FREE_CONVERSATIONS_LIMIT` - Free conversation limit (default: 3)
- `FREE_MESSAGES_LIMIT` - Free message limit (default: 3)

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:5000 for dev)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

---

## Project Architecture

This project follows **Clean Architecture** principles with **Domain-Driven Design (DDD)**:

```
backend/src/modules/
├── users/
│   ├── domain/          # Entities & Interfaces
│   ├── application/     # Business Logic (AuthService)
│   ├── infrastructure/  # Data Access (UserRepository)
│   └── presentation/    # Controllers & Routes
├── chat/
├── conversations/
├── subscriptions/
└── sessions/
```

**Benefits:**
- ✅ Separation of concerns
- ✅ Testable business logic
- ✅ Easy to maintain and extend
- ✅ Database-agnostic domain layer

---

## Background Jobs

The application includes automated background jobs using **node-cron**:

### Monthly Quota Reset
- **Schedule**: 1st of each month at midnight
- **Action**: Resets free quota for all users

### Session Cleanup
- **Schedule**: Daily at 2 AM
- **Action**: Removes expired anonymous sessions (30+ days old)

---

## Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

**Guidelines:**
- Follow existing code style
- Write clean, documented code
- Test your changes thoroughly
- Update documentation if needed

---

## License

This project is licensed under the **MIT License**.

---

## Additional Resources

- **[TESTING_GUIDANCE.md](./TESTING_GUIDANCE.md)** - Complete API testing guide with examples
- **[backend/env.example](./backend/env.example)** - Environment variable template
- **[frontend/README.md](./frontend/README.md)** - Frontend-specific documentation

---

## Support

For support, questions, or issues:

1. Check the **[TESTING_GUIDANCE.md](./TESTING_GUIDANCE.md)** for API documentation
2. Review the **[env.example](./backend/env.example)** for configuration help
3. Check the health endpoint: `http://localhost:5000/health`
4. Review backend console logs for errors
5. Use Prisma Studio to inspect database: `npm run prisma:studio`

**Common Issues:**
- **Database Connection**: Verify `DATABASE_URL` is correct
- **Email Sending**: Check SMTP credentials and ports
- **Stripe Webhooks**: Use Stripe CLI for local testing
- **CORS Errors**: Verify `CLIENT_URL` matches frontend URL

---

## Quick Start Commands

```bash
# Backend (in /backend directory)
npm install              # Install dependencies
cp env.example .env      # Create environment file
npm run setup:dev        # Setup database and seed plans
npm run dev              # Start development server

# Frontend (in /frontend directory)
npm install              # Install dependencies
npm run dev              # Start development server

# Health Check
curl http://localhost:5000/health

# View Database
cd backend && npm run prisma:studio
```

---

**Built with ❤️ using Next.js, Express, Prisma, and OpenAI**