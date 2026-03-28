# 🛒 WooCommerce Setup Guide

To connect your ClutchFlow CRM to a **live** WooCommerce store, you need to generate API keys from your WordPress dashboard. This allows the CRM to securely read your stores orders.

Here is the step-by-step process to get your credentials.

---

## Step 1: Log in to WordPress
1. Go to your store's admin login page (usually `https://your-store.com/wp-admin`).
2. Log in using your administrator username and password.

## Step 2: Navigate to WooCommerce Settings
1. Look at the left-hand black sidebar menu.
2. Scroll down until you see the **WooCommerce** icon.
3. Click on **Settings** in the WooCommerce sub-menu.

## Step 3: Open the REST API Page
1. At the top of the Settings page, you will see several horizontal tabs (General, Products, Tax, Shipping, Payments, etc.).
2. Click on the very last tab labeled **Advanced**.
3. Underneath the main tabs, a new set of smaller text links will appear (Page setup, REST API, Webhooks, etc.).
4. Click on **REST API**.

## Step 4: Create the API Key
1. Click the purple button that says **Add key** (or **Create an API key** if this is your first one).
2. Fill out the form exactly as follows:
   - **Description:** Type `ClutchFlow CRM Integration` (or anything that helps you remember what this key is for).
   - **User:** Select your own admin account from the dropdown.
   - **Permissions:** Click the dropdown and change it from "Read" to **Read/Write**. *(This allows the CRM to fetch orders, and gives you the flexibility to update order statuses from the CRM in the future).*
3. Click the **Generate API key** button at the bottom.

## Step 5: Copy Your Credentials
**⚠️ CRITICAL:** Do not close the WordPress page yet! WooCommerce will only show you the "Consumer Secret" once. If you close the page before copying it, you will have to delete the key and start over.

You will see a screen with a large QR code and two long strings of text.
1. Copy the **Consumer key** (it will start with `ck_...`).
2. Copy the **Consumer secret** (it will start with `cs_...`).

## Step 6: Add Keys to Your CRM
1. Open your code editor and find the `.env` file located at `/Users/pranav/Killowatt/backend/.env`.
2. Add your WordPress website URL and the two keys you just copied to the bottom of the file like this:

```env
# WooCommerce API Keys
WOO_STORE_URL=https://your-store-domain.com
WOO_CONSUMER_KEY=ck_your_copied_key_here
WOO_CONSUMER_SECRET=cs_your_copied_secret_here
```

*(Make sure your `WOO_STORE_URL` includes the full `https://` prefix!)*

## Step 7: Restart the Backend
For your Express server to recognize the new environment variables, you must restart it.
1. Go to the terminal running the backend (`npm run dev`).
2. Press `Ctrl + C` to stop the server.
3. Type `npm run dev` and press enter to start it again.

---

## How to Verify
1. Open your ClutchFlow CRM Dashboard at `http://localhost:5173/`.
2. Click the **"Sync WooCommerce"** button in the top right corner.
3. The CRM will securely connect to your live store, pull the latest orders, store them in your Supabase database, and automatically recalculate your customers' Priority Scores!
