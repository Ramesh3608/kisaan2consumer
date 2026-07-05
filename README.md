# 🌱 Kisaan2Consumer (K2C) — Direct Farm-to-Consumer Marketplace

A full-stack MERN application connecting farmers directly with consumers, with dedicated
dashboards for **Consumers**, **Farmers (Sellers)**, **Delivery Agents**, and **Admins** —
plus Razorpay payments (test mode).

Built from the SRM major project report "Kisaan2Consumer: Direct Farm-to-Consumer Marketplace".

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay (test mode)

---

## Project Structure

```
kisaan2consumer/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # business logic
│   ├── middleware/auth.js  # JWT auth + role guard
│   ├── models/              # User, Product, Order, Review, Bookmark
│   ├── routes/
│   ├── server.js
│   ├── seed.js              # demo data
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── components/       # Navbar, ProductCard, ProtectedRoute...
    │   ├── context/          # AuthContext, CartContext
    │   ├── pages/
    │   │   ├── farmer/FarmerDashboard.jsx
    │   │   ├── admin/AdminDashboard.jsx
    │   │   └── agent/AgentDashboard.jsx
    │   └── App.jsx
    └── .env.example
```

---

## 1. Prerequisites

- Node.js 18+ installed
- MongoDB running locally, **or** a free MongoDB Atlas cluster (recommended if you don't want to install MongoDB)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/kisaan2consumer
PORT=5000
JWT_SECRET=some_long_random_string
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
```

> **Don't have Razorpay keys yet?** Leave the placeholder values — the app automatically
> falls back to a **mock payment mode** so you can test the entire checkout flow without
> real keys. See the "Payments" section below for how to get free test keys.

Seed demo accounts + products (recommended for first run):

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

API will run at `http://localhost:5000`.

---

## 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App will run at `http://localhost:5173`.

---

## 4. Demo Login Accounts (after running `npm run seed`)

| Role      | Email                          | Password    |
|-----------|---------------------------------|-------------|
| Admin     | *(your own — set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`)* | *(set by you, not stored here)* |
| Farmer    | farmer@k2c.com                 | farmer123   |
| Farmer 2  | farmer2@k2c.com      | farmer123   |
| Consumer  | consumer@k2c.com     | consumer123 |
| Agent     | agent@k2c.com        | agent123    |

You can also register new accounts directly from the app (`/register`) and pick your role
(Consumer, Farmer, or Delivery Agent — Admins are created via seed/DB only, for security).

---

## 5. How the Roles Work

- **Consumer:** Browse `/shop`, add items to cart, checkout with a saved address, pay via
  Razorpay, track orders under "My Orders", rate farmers after delivery.
- **Farmer:** `/farmer` dashboard — add produce listings (with multiple weight/price tiers),
  manage/delete listings, view and accept/pack incoming orders.
- **Delivery Agent:** `/agent` dashboard — view orders assigned by an admin, update status
  through Picked Up → Out for Delivery → Delivered.
- **Admin:** `/admin` dashboard — platform stats, ban/unban users, hide/show listings, and
  assign delivery agents to accepted/packed orders.

---

## 6. Payments (Razorpay Test Mode)

1. Create a free account at https://dashboard.razorpay.com/
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy the **Key Id** and **Key Secret** into `backend/.env`
4. Restart the backend

At checkout, use Razorpay's official test card to simulate a successful payment:

```
Card Number: 4111 1111 1111 1111
Expiry:      any future date (e.g. 12/30)
CVV:         any 3 digits (e.g. 123)
OTP:         any digits (e.g. 1234) — or click "Success" in the test popup
```

No test balance is charged — this is Razorpay's sandbox environment.

If you skip setting up Razorpay keys, checkout still works end-to-end using an automatic
mock-payment fallback (clearly marked in the code as dev-only) so you can demo the app
immediately.

---

## 7. Nearest-Agent Delivery Assignment (Google Maps)

Admin can now assign the **actual nearest** delivery agent to an order, based on real GPS
distance — not just a manual pick.

**How it works:**
- When a delivery agent opens their dashboard (`/agent`), the browser asks for location
  permission and shares their live GPS coordinates with the backend every few minutes.
- When a consumer places an order, the backend geocodes the delivery address (turns it into
  GPS coordinates) using the Google Maps Geocoding API.
- In the Admin → Orders & Logistics tab, every unassigned order shows four ways to assign
  a delivery agent:
  - **🚀 Auto-Assign Agent (recommended)** — one click. Tries an exact
    city/state/pincode match first; if none exists, automatically falls back to the
    GPS-nearest agent; if neither works, tells you to assign manually instead of guessing.
  - **🎯 Assign Matching Agent** — assigns an agent whose registered service area
    (city + state + pincode) exactly matches the order's delivery address. No GPS or API
    key needed — pure text matching.
  - **⚡ Assign Nearest Agent** — GPS-distance based, ignores area matching entirely.
  - **Manual dropdown** — pick any agent yourself regardless of area or distance.

**Setup (one-time):**

1. Go to https://console.cloud.google.com/google/maps-apis/credentials
2. Create a project (or use an existing one) and enable the **Geocoding API**
3. Create an API key under **Credentials**
4. Add it to `backend/.env`:
   ```
   GOOGLE_MAPS_API_KEY=your_real_key_here
   ```
5. Restart the backend

> **Note:** Google requires a billing account to be linked even for free-tier usage, but
> gives a recurring free monthly credit ($200/month as of writing) that comfortably covers
> geocoding for a student/demo project — you won't be charged under normal use.
>
> **Without a key configured:** the app still works completely — orders are created
> normally, and admin can still assign agents manually from the dropdown. The
> distance-based "nearest agent" features will just show a note that location data isn't
> available.

**Testing tip:** since delivery agents need to actually grant location permission in their
browser, test this with the agent logged in on a real device/browser (not an incognito tab
with location blocked). You can simulate different agent locations using your browser's dev
tools → Sensors → Location override (Chrome DevTools supports this).

---

## 8. Email Verification

New registrations (Consumer, Farmer, Delivery Agent) must verify their email with a 6-digit
code before they can log in. Demo/seeded accounts are pre-verified so they're unaffected.

**Without any setup:** verification still works — if no email is configured, the backend just
prints the code to its own terminal (clearly labeled `📧 [DEV MODE]`), so you can copy it from
there and paste it into the "Verify Your Email" screen. Good enough for local testing.

**To send real emails (recommended for your demo/viva), using Gmail:**

1. Turn on 2-Step Verification on the Gmail account you want to send from:
   https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords
3. Create an **App Password** (choose "Mail" as the app) — Google gives you a 16-character
   password. This is *not* your normal Gmail password — don't use your real password here.
4. Add to `backend/.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youraddress@gmail.com
   EMAIL_PASS=the16charapppassword
   EMAIL_FROM=FarmFresh <youraddress@gmail.com>
   ```
5. Restart the backend

**Note:** if you don't see "App Passwords" as an option, it usually means 2-Step Verification
isn't turned on yet for that Google account — turn it on first, then the option appears.

---

## 9. Running Both at Once (optional)

From the project root, you can run backend and frontend in two terminals as shown above, or
install `concurrently` in a root `package.json` if you prefer a single command — not included
by default to keep the two apps fully independent (useful for separate deployment).

---

## 10. Deployment Notes

- **Backend:** Deploy to Render / Railway / Fly.io. Set the same env vars from `.env.example`.
- **Frontend:** Deploy to Vercel / Netlify. Set `VITE_API_URL` to your deployed backend URL.
- **Database:** Use MongoDB Atlas free tier for production.
- Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL (for CORS).

---

## 11. Features Implemented (mapped to the original project report)

- ✅ Farmer registration, profile, produce listing with multiple weight/price tiers
- ✅ Consumer browsing with category filters, sort, and search
- ✅ Cart, address book, checkout, Razorpay payment
- ✅ Order lifecycle: Pending → Accepted → Packed → Assigned → Picked Up → Out for Delivery → Delivered
- ✅ Delivery agent dashboard and admin-driven agent assignment
- ✅ Admin dashboard: platform stats, user ban/unban, listing moderation, logistics assignment
- ✅ Ratings & reviews for farmers after delivery
- ✅ Role-based JWT authentication and route protection
- ✅ Email verification at signup (6-digit code, with dev-mode console fallback)

---

Built as a working implementation of the Kisaan2Consumer SRM major project.




