# ClutchFlow CRM — Technical Documentation

This document serves as the comprehensive technical reference for the ClutchFlow CRM. It outlines the system architecture, database schema, API endpoints, and the proprietary Smart Insights algorithm.

---

## 🏗 System Architecture

ClutchFlow is built on a modern, decoupled 3-tier architecture:

1. **Frontend Presentation Layer (React + Vite)**
   - Acts as an SPA (Single Page Application).
   - Responsible for state management, client-side routing, and all data visualization (CSS-driven dynamic charts, glassmorphic UI).
   - Communicates strictly with the Express REST API via JSON.

2. **Backend Logic & Aggregate Layer (Node.js + Express)**
   - The central nervous system. 
   - Handles all business logic, third-party integrations (WooCommerce), data aggregation (time-based revenue groupings), and the AI-like Insights Engine.
   - Prevents the frontend from directly exposing database keys.

3. **Data Persistence Layer (Supabase / PostgreSQL)**
   - A fully relational Postgres database hosted serverlessly via Supabase.
   - Stores all application state, prioritizing fast reads/writes and referential integrity (foreign keys between Customers, Orders, and Logs).

---

## 🗄 Database Schema

The database relies on 3 primary tables.

### 1. `customers`
Stores master records of all interacting entities.
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `phone` (Text, Nullable)
- `company` (Text, Nullable)
- `priority_score` (Integer) — *Automatically recalculated based on order volume and total spend.*
- `created_at` (Timestamp)

### 2. `orders`
Stores all transactional data. Linked to `customers`.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → `customers.id`)
- `product` (Text)
- `amount` (Decimal/Float)
- `status` (Text) — *e.g., 'completed', 'pending', 'processing', 'cancelled'*
- `woo_order_id` (Text, Nullable) — *Tracks the upstream WooCommerce ID if imported via the store integration.*
- `created_at` (Timestamp)

### 3. `logs`
Stores the communication history and interaction timeline.
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → `customers.id`)
- `type` (Text) — *e.g., 'email', 'call', 'note', 'meeting'*
- `message` (Text)
- `created_at` (Timestamp)

---

## 🧠 Smart Insights Engine (The Algorithm)

Unlike traditional dashboards that simply regurgitate data, ClutchFlow actively analyzes it. The Insights Engine is a proprietary Node.js algorithm (`backend/services/insightsEngine.js`) that runs completely offline (0ms latency, zero API costs).

It evaluates a specific customer across 8 dimensions:

1. **High-Value Thresholds:** Checks if `total_spend > $500` or `$200` to categorize as VIP, Growing, or Early-Stage.
2. **Order Recency (Churn Risk):** Calculates `days_since_last_order`. If > 30 days, triggers an "At Risk" alert recommending a win-back email.
3. **Communication Gap Analysis:** Cross-references the `logs` table. If the last interaction was > 14 days ago, warns the user that the relationship is cooling down.
4. **Channel Preference Engine:** Identifies the statistical mode of the `logs.type` column to suggest the highest-converting outreach method for that specific user.
5. **Pending Order Alerts:** Summarizes total financial volume of incomplete orders to prioritize fulfillment.
6. **Cancellation Velocity:** Determines the ratio of cancelled vs completed orders to flag problematic relationships.

This logic outputs dynamic, color-coded, natural-language action cards to the frontend UI.

---

## 📡 RESTful API Reference

The backend provides 15+ dedicated endpoints. All endpoints assume the `/api` prefix.

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Returns top-level aggregated stats (total volume, conversion rate) and live WooCommerce connection status. |
| `GET` | `/analytics?days=7/10/30/all` | Generates grouped date-revenue pairs and calculates top customer leaderboards. Pre-fills date buckets for continuous charting. |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | Retrieves all customers, ordered by `priority_score`. |
| `GET` | `/customers/:id` | Retrieves a single customer with their nested `orders` and `logs`. |
| `POST` | `/customers` | Creates a new customer. |
| `PUT` | `/customers/:id` | Inline updates a customer profile. |
| `GET` | `/customers/:id/insights` | **Fires the Smart Insights Engine** for a specific UUID. |

### Orders & Integration
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | Retrieves all orders with `customers(name)` join. |
| `POST` | `/orders` | Inserts an order and automatically recalculates the parent's `priority_score`. |
| `PATCH`| `/orders/:id/status` | Updates order state (e.g. pending -> completed) and recalculates parent score. |
| `GET` | `/orders/woocommerce/sync` | Authenticates with live WooCommerce REST API, fetches external orders, and upserts them into Supabase. |

### Logs & Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/logs/recent` | Global audit trail for the dashboard activity feed. |
| `POST` | `/logs` | Inserts a new communication event and timestamp. |
| `GET` | `/export/:type` | Streams a dynamically generated CSV file containing either raw customer or order data. |
