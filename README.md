# 🌿 ZeroWaste — Zero-Food-Waste Management Platform

ZeroWaste connects food donors (restaurants, hostel/PG managers) directly with recipient organizations (care homes, shelters) and NGO oversight managers in real-time.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- NPM

### Running the Application

1. **Start Backend Server** (runs on `http://localhost:5000`):
   ```bash
   cd server
   npm install
   npm start
   ```
   *Note: If local MongoDB daemon is not running, the backend automatically launches an in-memory database fallback (`mongodb-memory-server`) and populates seed data out of the box!*

2. **Start Frontend Client** (runs on `http://localhost:5173`):
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 👥 Role-Based Access & Demo Accounts

The system supports **3 distinct roles**:

| Role | Access Scope | Demo Login Button / Credentials |
| :--- | :--- | :--- |
| **Donor** | Home, Dashboard, Leaderboard | `donor@zerowaste.org` / `password123` |
| **Recipient** | Home, Dashboard | `recipient@zerowaste.org` / `password123` |
| **NGO / Volunteer** | Home, Dashboard, Leaderboard, Impact, Monitoring | `ngo@zerowaste.org` / `password123` |

### Role Permissions Matrix
- **Donor**: Stats (total donations, kg donated, active posts), **Post surplus food form** (donor ONLY), my donations list with status timeline.
- **Recipient**: Notification bell, available food feed with **Claim**, my claims with **Mark collected** & rating form.
- **NGO / Volunteer**: Overview cards (total donations, active posts, claimed, collected, donor/recipient counts), recent activity stream, **Monitoring page** with full donation audit table & recipient satisfaction reports, and **Impact analytics page**.

---

## 📋 Acceptance Verification Checklist

- ✅ **No CO₂ / Landfill / Formulas**: All CO₂, landfill waste, and meal conversion formulas have been completely removed. Portion counts and food weight are read directly from database entries.
- ✅ **Strict Role Guards**: Donors cannot access Impact or Monitoring; Recipients cannot access Post surplus food, Leaderboard, Impact, or Monitoring; NGOs cannot post food.
- ✅ **Toast Deduplication & Scope**: Notifications are sent strictly to recipient users. Stray toasts on login/user switch are eliminated via baseline tracking; new donations emit exactly one toast per recipient.
- ✅ **Theme Tokens & Visibility**: Full light and dark theme styling across backgrounds, cards, badges, scrollbars, and icons (`currentColor`). Choice persists across reloads.
