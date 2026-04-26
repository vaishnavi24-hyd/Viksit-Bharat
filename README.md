# 🇮🇳 Viksit Bharat – Smart Civic Assistance Platform

## 🌟 Introduction

**Viksit Bharat** is a full-stack PWA citizen-centric digital platform designed to modernize how people interact with civic services. It bridges the gap between citizens and government authorities by providing a unified system for **complaint reporting, emergency response, scheme awareness, and data-driven governance**.

In many regions—especially rural and semi-urban areas—citizens struggle with:

* Inefficient and fragmented complaint systems
* Lack of transparency in issue resolution
* Limited awareness of government schemes
* No quick digital emergency response mechanism

Viksit Bharat solves these challenges through a **smart, scalable, and user-friendly platform** that improves accessibility, responsiveness, and civic engagement.

---

## 🚀 Core Features

### 📝 1. Smart Complaint Management System

* Submit complaints related to civic issues (sanitation, roads, water, etc.)
* Structured complaint lifecycle:

  * Submitted → In Progress → Resolved
* Real-time tracking of complaint status
* Centralized storage and management
* Improved transparency and accountability

---

### 🚨 2. Emergency SOS System

* One-click emergency alert system
* Sends high-priority request to backend instantly
* Attempts to capture user location
* Works even if location access fails (ensures reliability)
* Designed for fast and frictionless emergency response

---

### 📊 3. Data Visualization & Analytics

* Interactive charts for complaint insights:

  * Area-based trends
  * Category distribution (pie charts)
* Helps authorities analyze patterns and trends
* Enables data-driven decision-making

---

### 🧭 4. Location & Geo-Based Features

* Automatic location detection using browser APIs
* Enables location-based complaint reporting
* Can be extended to maps and geo-analytics

---

### 🌐 5. Offline-First Functionality

* Supports usage in low or no internet conditions
* Uses IndexedDB for local storage
* Syncs data automatically when connection is restored
* Ensures reliability in rural/low-connectivity areas

---

### 🔄 6. Background Sync & Service Workers

* Service worker for caching and offline access
* Background sync for pending actions
* Improves performance and resilience

---

### 🏛️ 7. Role-Based Dashboards

#### 👤 User Dashboard

* Submit and track complaints
* Access schemes and features

#### 🧑‍💼 Official Dashboard

* View and manage complaints
* Update statuses and resolve issues

#### 🛠️ Admin Dashboard

* Monitor system-wide activity
* Analyze complaint data and trends

---

### 🧾 8. Government Scheme Awareness

* Displays relevant schemes for users
* Improves accessibility and awareness
* Can be enhanced with intelligent recommendation logic

---

### 📸 9. Camera & Document Integration

* Camera capture functionality
* Enables uploading images for complaints
* Supports future document verification features

---

### 🌍 10. Community & Engagement Features

* Encourages user participation
* Scalable for leaderboards and community interaction

---

### 🎨 11. Modern UI/UX

* Responsive and clean interface
* Smooth navigation across pages
* Built with usability and accessibility in mind

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite (fast build tool)
* CSS
* Context API (state management)

---

### Backend

* Node.js
* Express.js

---

### Database

* MongoDB

---

### APIs & Browser Features

* Geolocation API
* IndexedDB (offline storage)
* Service Workers
* Background Sync

---

### Optional Integrations

* Google Maps API (for maps and geolocation)
* Twilio (for SMS/alert notifications)

---

## 📁 Project Structure

```bash id="4wql8o"
Viksit-Bharat/
│
├── backend/                # Server-side logic and APIs
│   ├── models/
│   ├── routes/
│   └── server.js
│
├── src/                    # React frontend
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── data/
│
├── public/                 # Static files & service worker
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash id="shy5a8"
git clone https://github.com/vaishnavi24-hyd/Viksit-Bharat.git
cd Viksit-Bharat
```

---

### 2️⃣ Install dependencies

Frontend:

```bash id="5t0hkt"
npm install
```

Backend:

```bash id="6y6f1w"
cd backend
npm install
```

---

## ▶️ Running the Application

Frontend:

```bash id="g7x2c0"
npm run dev
```

Backend:

```bash id="n9fz9i"
cd backend
node server.js
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` folder:

```env id="0d5zkm"
PORT=5000
```

> ⚠️ Never commit `.env` files to GitHub

---

## 📌 Key Highlights

* ✔ Full-stack civic platform
* ✔ Offline-first architecture
* ✔ Real-time complaint tracking
* ✔ Emergency-ready SOS system
* ✔ Data-driven dashboards
* ✔ Scalable and modular design


---

## 📄 License

This project is intended for educational and demonstration purposes.

---

## 👨‍💻 Author

**Vaishnavi**
GitHub: https://github.com/vaishnavi24-hyd

---
