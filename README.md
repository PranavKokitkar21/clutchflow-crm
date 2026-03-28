# ⚡ ClutchFlow CRM

ClutchFlow CRM is an intelligent, full-stack CRM designed specifically for modern e-commerce stores (like WooCommerce). Built from scratch in under 24 hours for a hackathon.

It replaces expensive enterprise setups by offering dynamic dashboard analytics, direct WooCommerce integration, and an offline, locally-running **Smart Insights Engine** that predicts customer behavior based on historical spending patterns.

![ClutchFlow CRM Dashboard](https://via.placeholder.com/1000x500.png?text=ClutchFlow+CRM+Dashboard)

## 🌟 Key Features

1. **Dashboard Analytics:** Live revenue calculations, conversion rates, and a custom CSS-animated Monthly Revenue breakdown chart (with 7-Day, 10-Day, and 30-Day grouping filters).
2. **Offline Smart Insights:** A proprietary algorithm analyzes 8 dimensions of customer behavior (spending recency, cancellation rates, communication gaps) and generates actionable, color-coded recommendations instantly.
3. **WooCommerce Sync:** Plug-and-play config file. Add your keys, and it seamlessly populates the PostgreSQL database with live orders while auto-calculating Priority Scores.
4. **Full CRUD + Timeline:** Manage Customers, Orders, and Communication Logs directly from the beautifully crafted, glassmorphic UI.
5. **One-Click Export:** Instantly export customers and complex order histories to formatted CSVs for external reporting.

## 🛠 Tech Stack

- **Frontend:** React + Vite (Custom Glassmorphic CSS Design System)
- **Backend:** Node.js + Express (15+ REST endpoints)
- **Database:** Supabase (relational PostgreSQL)

---

## 🚀 Quick Start Guide

### 1. Database Setup (Supabase)
Create a new project on [Supabase](https://supabase.com). Copy the SQL from `SUPABASE_SETUP.md` into the SQL Editor and run it to instantly create the schema (`customers`, `orders`, `logs`) and insert sample data.

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase connection strings:
   ```env
   PORT=3001
   SUPABASE_URL=your_project_url_here
   SUPABASE_ANON_KEY=your_anon_key_here
   ```
4. Start the server (runs on `http://localhost:3001`):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a *new* terminal window and navigate to the frontend folder:
   ```bash
   cd frontend/crmsystem
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

### 4. (Optional) Live WooCommerce Integration
To connect to a live store instead of using mock data, refer to `WOOCOMMERCE_SETUP.md` for instructions on generating API tokens and adding them to the `.env` file.
