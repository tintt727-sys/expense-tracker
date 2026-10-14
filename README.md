# Expense Tracker Pro (Mini Expense Tracker App)

A production-ready, full-stack personal finance and expense tracking web application crafted with a modern, glassmorphic design system featuring left sidebar navigation, top header, white card UI, rounded corners, soft shadows, and vibrant purple/pink accent gradients.

![Dashboard Preview](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200)

---

## 🌟 Key Highlights & Design System

- **Design Aesthetic**:
  - Left Sidebar navigation with active indicator glows
  - Sticky Top Header with universal search, real-time notifications dropdown, theme toggle, and user profile popup
  - White Card UI with smooth rounded corners (`rounded-2xl` / `rounded-3xl`)
  - Soft glowing ambient shadows (`shadow-soft` / `shadow-2xl`)
  - Purple & Pink accent gradients (`from-purple-600 via-purple-500 to-pink-500`)
  - Responsive multi-device support: Full sidebar on Desktop, collapsible on Tablet, sticky bottom navigation on Mobile.
  - Dark Mode & Light Mode support with persisted theme preference.
  - Multi-Currency Support with **MMK (Myanmar Kyat)** as primary default, plus USD ($), EUR (€), and THB (฿).
  - Toast Notifications for all actions (create, edit, delete, backup, export).

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4 with custom color variables & soft shadows
- **Routing**: React Router v7 (`BrowserRouter`, Protected Routes, Admin Routes)
- **Data Visualization**: Recharts (Monthly Income vs Expense Bar Chart, Expense Category Donut/Pie Chart, Cashflow Statistics Area Chart)
- **Icons**: Lucide React
- **HTTP Client**: Typed Fetch API wrapper with automatic JWT injection and 401 interceptors

### Backend
- **Runtime**: Node.js v24 (ES Modules)
- **Server**: Express.js REST API
- **ORM**: Prisma ORM
- **Database**:
  - **SQLite (Zero-Config Local Default)**: Works right out of the box without any external database server setup (`dev.db`).
  - **PostgreSQL (Production Ready)**: Complete PostgreSQL Prisma schema provided in `backend/prisma/schema.postgresql.prisma`.
- **Security & Auth**:
  - JWT (JSON Web Tokens) with 30-day "Remember Me" persistence
  - Password hashing with `bcryptjs` (salt rounds: 10)
  - Role-based authorization: User authentication & Separate Admin authentication

---

## 📁 Full Project Structure

```text
my-training-app/
├── package.json                   # Root coordination scripts
├── README.md                      # Comprehensive documentation
│
├── backend/                       # REST API Server
│   ├── .env                       # Local environment variables
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Express application entry & route mounts
│   │
│   ├── controllers/
│   │   ├── authController.js      # User registration, login, forgot/reset password
│   │   ├── transactionController.js # Transaction CRUD, stats, CSV export
│   │   ├── categoryController.js  # Category CRUD operations
│   │   ├── adminController.js     # Admin login, global stats, backup, wipe
│   │   └── settingsController.js  # App preferences (currency, theme)
│   │
│   ├── middleware/
│   │   ├── auth.js                # User JWT verification
│   │   └── adminAuth.js           # Admin JWT verification
│   │
│   ├── models/
│   │   └── prismaClient.js        # Singleton Prisma client instance
│   │
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── transactionRoutes.js   # /api/transactions
│   │   ├── categoryRoutes.js      # /api/categories
│   │   ├── adminRoutes.js         # /api/admin
│   │   └── settingsRoutes.js      # /api/settings
│   │
│   └── prisma/
│       ├── schema.prisma          # Prisma schema (SQLite dev out-of-the-box)
│       ├── schema.postgresql.prisma # PostgreSQL production schema
│       └── seed.js                # Default categories, admin, demo user & records
│
└── frontend/                      # React + TypeScript Client
    ├── index.html                 # HTML entry with typography
    ├── package.json               # Frontend dependencies
    ├── vite.config.js             # Vite + Tailwind plugin config
    │
    └── src/
        ├── main.tsx               # Client bootstrap
        ├── App.tsx                # Master routes & contexts
        ├── index.css              # Tailwind imports, theme variables, shadows
        │
        ├── types/
        │   └── index.ts           # TypeScript interfaces (User, Transaction, Category, etc.)
        │
        ├── services/
        │   ├── api.ts             # Base API fetch client + CSV download helper
        │   ├── authService.ts     # Auth endpoints
        │   ├── transactionService.ts # Transaction CRUD & summaries
        │   ├── categoryService.ts # Category endpoints
        │   ├── adminService.ts    # Admin management & backup endpoints
        │   └── settingsService.ts # Settings API
        │
        ├── hooks/
        │   ├── useAuth.tsx        # Auth state context
        │   ├── useTheme.tsx       # Dark / Light theme toggle
        │   └── useCurrency.tsx    # Currency switcher & MMK formatter
        │
        ├── utils/
        │   └── formatters.ts      # MMK currency, relative dates, month labels
        │
        ├── layouts/
        │   ├── AppLayout.tsx      # Main layout (Sidebar + Header + Content + BottomNav)
        │   └── AuthLayout.tsx     # Centered card layout for Auth screens
        │
        ├── components/
        │   ├── Header.tsx         # Top bar with search, notifications, profile
        │   ├── Sidebar.tsx        # Left sidebar with active indicator
        │   ├── BottomNav.tsx      # Mobile navigation bar with center + button
        │   ├── SummaryCard.tsx    # Financial KPI cards (Balance, Income, Expense)
        │   ├── FilterBar.tsx      # Filter by date, category, type, and sort
        │   ├── TransactionModal.tsx # Add / Edit transaction modal
        │   ├── CategoryModal.tsx  # Add / Edit category modal
        │   ├── ConfirmationModal.tsx # Modal for delete & reset confirmations
        │   ├── CategoryIcon.tsx   # Dynamic Lucide icon & emoji renderer
        │   ├── LoadingSpinner.tsx # Animated spinner
        │   ├── EmptyState.tsx     # Modern empty state graphic
        │   ├── ThemeToggle.tsx    # Sun/Moon switcher
        │   ├── Toast.tsx          # Animated notification toasts
        │   ├── ProtectedRoute.tsx # Route guards
        │   └── charts/
        │       ├── IncomeExpenseBarChart.tsx # Monthly Bar chart
        │       ├── CategoryDonutChart.tsx   # Expense Donut chart
        │       └── StatisticsChart.tsx      # Weekly/Monthly/Yearly Area chart
        │
        └── pages/
            ├── DashboardPage.tsx  # Main finance dashboard with summary cards & charts
            ├── TransactionsPage.tsx # Transaction management with CRUD & search/filter
            ├── CategoriesPage.tsx # Category management page
            ├── ReportsPage.tsx    # Analytics, cashflow velocity & CSV export
            ├── SettingsPage.tsx   # User profile, theme, and MMK currency settings
            ├── auth/
            │   ├── LoginPage.tsx          # Login with show/hide password & remember me
            │   ├── RegisterPage.tsx       # Registration form
            │   └── ForgotPasswordPage.tsx # Password recovery token flow
            └── admin/
                ├── AdminLoginPage.tsx     # Dedicated admin login
                └── AdminDashboardPage.tsx # Admin database control, transactions & settings
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **npm**: v9+

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```
The REST API starts at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The Web App opens at `http://localhost:5173`.

---

## 🔑 Pre-Seeded Default Accounts

| Role | Username / Email | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Demo User** | `demo@expensetracker.pro` | `user123` | `/login` (Has "Quick Autofill" button) |
| **Administrator** | `admin` | `admin123` | `/admin/login` |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="expense_tracker_pro_super_secret_jwt_key_2026"
ADMIN_SECRET="admin_secret_jwt_key_2026"
NODE_ENV="development"
```

### For PostgreSQL Database (Production):
1. Create a PostgreSQL database (e.g. `expensetracker`).
2. Update `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/expensetracker?schema=public"
   ```
3. Use the PostgreSQL schema:
   ```bash
   cd backend
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   node prisma/seed.js
   ```

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user & return JWT
- `POST /api/auth/forgot-password` - Request password recovery token
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get authenticated user profile *(Requires JWT)*
- `PUT /api/auth/profile` - Update profile name and change password *(Requires JWT)*

### Transactions (`/api/transactions`)
- `GET /api/transactions` - Filtered & sorted transaction list *(Requires JWT)*
- `GET /api/transactions/summary` - Aggregated balance, income, expense & charts *(Requires JWT)*
- `POST /api/transactions` - Create new income or expense transaction *(Requires JWT)*
- `PUT /api/transactions/:id` - Update existing transaction *(Requires JWT)*
- `DELETE /api/transactions/:id` - Delete transaction *(Requires JWT)*
- `GET /api/transactions/export/csv` - Download CSV export of user records *(Requires JWT)*

### Categories (`/api/categories`)
- `GET /api/categories` - List categories (filter by `type=income` or `type=expense`)
- `POST /api/categories` - Create new category *(Requires JWT)*
- `PUT /api/categories/:id` - Update category *(Requires JWT)*
- `DELETE /api/categories/:id` - Delete category *(Requires JWT)*

### Admin System (`/api/admin`)
- `POST /api/admin/login` - Administrator authentication
- `GET /api/admin/dashboard-stats` - Global database metrics & overview *(Admin only)*
- `GET /api/admin/transactions` - View all transactions across all users *(Admin only)*
- `PUT /api/admin/transactions/:id` - Admin edit any transaction *(Admin only)*
- `DELETE /api/admin/transactions/:id` - Admin delete any transaction *(Admin only)*
- `POST /api/admin/categories` - Add global category *(Admin only)*
- `PUT /api/admin/categories/:id` - Update global category *(Admin only)*
- `DELETE /api/admin/categories/:id` - Delete global category *(Admin only)*
- `GET /api/admin/database/backup` - Download complete database JSON snapshot *(Admin only)*
- `POST /api/admin/database/reset` - Wipe database with `"CONFIRM_RESET"` token *(Admin only)*
- `PUT /api/admin/password` - Change administrator password *(Admin only)*

### Settings (`/api/settings`)
- `GET /api/settings` - Retrieve global settings (currency, theme, appName)
- `PUT /api/settings/bulk` - Update system configuration values

---

## 📱 Responsive Screen Breakdown

1. **Dashboard Page**:
   - Total Balance, Total Income, Total Expense cards with glowing accents.
   - Balance Summary Banner displaying net remaining funds.
   - Monthly Income vs Expense Bar Chart.
   - Expense by Category Donut Chart with percentage breakdown.
   - Cashflow Trends & Statistics with Weekly, Monthly, and Yearly toggles.
   - Latest Recent Transactions with status badges.
2. **Transaction Page**:
   - Multi-field search (Description, Category, Amount).
   - Date presets (Today, This Week, This Month, Custom Date Range).
   - Sorting by Date (Newest/Oldest) and Amount (Highest/Lowest).
   - Desktop responsive table view & Mobile card list.
   - Modal for Adding & Editing transactions.
3. **Category Management Page**:
   - Category cards with icon preview, name, and type tag.
   - Add & Edit modal with 25+ finance icons and emojis.
   - Delete confirmation with safety modal.
4. **Reports Page**:
   - Savings Rate percentage KPI.
   - High-resolution comparative bar and area charts.
   - One-click CSV spreadsheet download.
5. **Settings Page**:
   - Interactive Light & Dark theme toggle.
   - Currency switcher (MMK, USD, EUR, THB).
   - Profile management (name update, current & new password).
6. **Admin Dashboard Page**:
   - System overview metrics (total users, total transactions, system income/expense).
   - Global transaction viewer & editor.
   - Category administration.
   - Database backup download (JSON).
   - Database reset with security confirmation.
   - Admin password change.
7. **Authentication Pages**:
   - **Login**: Email, Password with show/hide eye toggle, Remember me checkbox, 1-click Demo Autofill, Link to register and forgot password.
   - **Register**: Full name, Email, Password, Confirm password validation.
   - **Forgot Password**: Email submission & password recovery flow.
   - **Admin Login**: Dedicated security checkpoint for administrative access.

---

## 🚢 Production Deployment Instructions

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set build command: `npm run build`
2. Set publish directory: `dist`
3. Configure environment variable:
   ```env
   VITE_API_URL=https://your-api-domain.com/api
   ```

### Backend (Render / Railway / AWS / VPS)
1. Set build command:
   ```bash
   npm install && npx prisma generate && npx prisma db push --schema=prisma/schema.postgresql.prisma
   ```
2. Set start command:
   ```bash
   node server.js
   ```
3. Set environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
   JWT_SECRET=your_production_jwt_secret
   ADMIN_SECRET=your_production_admin_secret
   ```

---

## 🛡️ License
MIT License. Open-source and ready for commercial use.
