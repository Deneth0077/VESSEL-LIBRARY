# VESSEL LIBRARY — Full-Stack Application

**VESSEL LIBRARY** is a production-ready, full-stack maritime web application built for managing vessel specifications, vessel photographs, structural information, damages, operational challenges, notes, and remarks.

---

## 🌟 Key Features

1. **Mobile-First Responsive Design**:
   - Designed for seamless operation on mobile phones (iOS / Android), tablets, laptops, and desktop workstations.
   - Includes touch-friendly targets (minimum 44px), camera capture support (`accept="image/*"`), mobile bottom sheets, and responsive photo galleries.

2. **Role-Based Access & Security**:
   - Two role levels: `USER` and `ADMIN`.
   - **4-Digit PIN Security**: Users register with a 4-digit PIN, securely hashed using `bcrypt`.
   - **Admin Approval System**: Newly registered accounts start in `PENDING` status and cannot access vessel records until approved by an Admin via the Admin Dashboard.
   - **Real-Time Access Control**: Server-side request checks query database status on every protected call. If an admin suspends or denies a user, their access is immediately revoked.
   - **Persistent Secure Session**: Secure HTTP-Only session cookies (`vessel_lib_token`) signed via JWT (`jose`).

3. **Vessel Management & 6 Structured Sections**:
   - Prominent server-side MongoDB search with indexes on Vessel Name, IMO Number, Vessel Type, and Flag.
   - **Basic Information**: Visible by default upon opening any vessel profile, displaying core specifications and main photographs.
   - **5 Collapsible Accordion Sections**:
     1. Vessel Structure
     2. Vessel Structural Damages
     3. Operational Challenges
     4. Special Notes
     5. Remarks
   - **Entry CRUD Engine**: Text descriptions displayed *before* related photographs, accompanied by author & timestamp metadata (`Added by John Perera • 29 Aug 2026, 09:30 PM`).

4. **Multi-Sheet Excel Export**:
   - Server-side `.xlsx` workbook generation via `exceljs` featuring 6 styled worksheets (Vessel List + 5 Technical Sections).

5. **Audit Trail & Login History**:
   - Automated audit logging for registration, approvals, login history (IP address & user-agent tracking), vessel modifications, entry CRUD, photo uploads, and Excel exports.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB server (local `mongodb://127.0.0.1:27017/vessels_db` or MongoDB Atlas URI)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/vessels_db
AUTH_SECRET=vessel_library_super_secret_jwt_key_32bytes_minimum_length_required!

ADMIN_FULL_NAME=Administrator
ADMIN_EMPLOYEE_ID=EMP000
ADMIN_EMAIL=admin@vessellibrary.com
ADMIN_PIN=1234
ADMIN_PASSWORD=admin1234password!
```

### 3. Seed Initial Database
Seed the system with default administrator credentials (`EMP000` / `1234`), sample users (`EMP001`), and demo vessel records (`MV OCEAN STAR`):
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Login Credentials

| User Type | Identifier / Employee ID | PIN / Password | Route | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@vessellibrary.com` or `EMP000` | `1234` | `/admin/login` | `APPROVED` |
| **Sample Employee** | `EMP001` | `1234` | `/login` | `APPROVED` |
| **Pending User** | `EMP002` | `1234` | `/login` | `PENDING` |

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database & ODM**: MongoDB & Mongoose
- **Styling**: Tailwind CSS & Lucide Icons
- **Auth & Hashing**: Jose (JWT), bcryptjs, HTTP-only cookies
- **Validation**: Zod
- **Excel Export**: ExcelJS
