# Radha Sarees - E-commerce Platform

A comprehensive e-commerce website for premium Indian sarees, featuring a complete shopping experience with product catalog, cart functionality, wishlist, category filtering, search, and a fully functional admin panel.

## Features

### Customer Features
- 🛍️ Product browsing with categories (Wedding, Ethnic, Casuals, Festival, New Arrivals, Celebrity)
- 🔍 Search and filter functionality
- ❤️ Wishlist management
- 🛒 Shopping cart with real-time updates
- 💳 Complete checkout process
- 👤 User authentication and dashboard
- 📦 Order tracking
- 💰 Multiple payment methods

### Admin Features
- 📊 Comprehensive dashboard with analytics
- 📦 Product management (Add, Edit, Delete, Bulk Import)
- 📋 Order management with status updates
- 👥 Customer management
- 💳 Payment gateway settings
- 📈 Report generation
- ⚙️ Site settings customization

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS 4.0 with custom design tokens
- **State Management**: Zustand with localStorage persistence
- **Backend**: Supabase Edge Functions (Hono + Deno)
- **Database**: Supabase PostgreSQL with KV store
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner

## Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Vercel account (for deployment)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5173

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard (see below)
4. Deploy!

### Environment Variables

The following environment variables are already configured in your Supabase project:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (backend only)
- `SUPABASE_DB_URL` - Your Supabase database URL

**Note:** These are automatically configured when running on Figma Make. For Vercel deployment, you'll need to add them to Vercel's environment variables.

## Architecture

```
Vercel (Frontend) → Supabase Edge Functions (Backend) → Supabase Database
```

- **Frontend**: Hosted on Vercel (React SPA)
- **Backend**: Supabase Edge Functions handle all API requests
- **Database**: Supabase PostgreSQL with KV store

## Project Structure

```
/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Homepage hero section
│   ├── ProductCard.tsx # Product display
│   ├── Cart.tsx        # Shopping cart
│   └── ...
├── lib/                # Utilities and state management
│   ├── store.ts        # Zustand store
│   ├── api.ts          # API client
│   └── useData.ts      # Data synchronization hooks
├── styles/             # Global styles
│   └── globals.css     # Tailwind + design tokens
├── supabase/           # Backend code
│   └── functions/
│       └── server/     # Edge Function server
├── App.tsx             # Main application component
├── Admin.tsx           # Admin panel
└── index.html          # HTML entry point
```

## Design System

All styling uses CSS variables defined in `/styles/globals.css`:

- **Colors**: Primary, secondary, accent, background, foreground, etc.
- **Typography**: Custom font families and sizes
- **Spacing**: Consistent spacing scale
- **Border Radius**: Unified border radius values

To customize the design, edit the CSS variables in `globals.css`.

## Admin Access

Default admin credentials:
- Username: `admin`
- Password: `admin123`

**⚠️ Important**: Change these credentials in production!

## API Endpoints

All API endpoints are prefixed with `/make-server-226dc7f7/`:

### Authentication
- `POST /auth/signup` - Create new customer account
- `POST /auth/login` - Customer login
- `GET /auth/session` - Get current session
- `POST /auth/admin-login` - Admin login

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /products` - Add new product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `POST /products/bulk` - Bulk add products (admin)

### Orders
- `GET /orders` - Get all orders (admin)
- `GET /orders/customer/:email` - Get customer orders
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order status (admin)

### Customer Profile
- `GET /customer/profile` - Get customer profile
- `PUT /customer/profile` - Update customer profile
- `GET /customer/payment-methods` - Get payment methods
- `POST /customer/payment-methods` - Add payment method
- `PUT /customer/payment-methods/:id` - Update payment method
- `DELETE /customer/payment-methods/:id` - Delete payment method
- `GET /customer/billing-addresses` - Get billing addresses
- `POST /customer/billing-addresses` - Add billing address
- `PUT /customer/billing-addresses/:id` - Update billing address
- `DELETE /customer/billing-addresses/:id` - Delete billing address

### Settings & Reports
- `GET /settings/payment-gateways` - Get payment gateways
- `PUT /settings/payment-gateways/:id` - Update payment gateway
- `GET /settings/site` - Get site settings
- `PUT /settings/site` - Update site settings
- `POST /reports` - Generate report
- `GET /reports` - Get all reports
- `DELETE /reports/:id` - Delete report

## Categories

The platform supports the following saree categories:
- Wedding - Traditional wedding sarees
- Ethnic - Ethnic and cultural sarees
- Casuals - Everyday casual sarees
- Festival - Festival and celebration sarees
- New Arrivals - Latest collection
- Celebrity - Celebrity-inspired designs

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.
