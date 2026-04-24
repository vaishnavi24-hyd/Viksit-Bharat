# 🇮🇳 Viksit Bharat – Smart Civic Assistance Platform

Viksit Bharat is a **citizen-centric digital platform** designed to bridge the gap between the public and government services. It enables users to report civic issues, access government schemes, and trigger emergency alerts through a unified, intelligent, and user-friendly system.

The platform addresses real-world challenges faced in rural and semi-urban areas, such as lack of transparency in complaint systems, limited awareness of government schemes, and absence of quick digital emergency response mechanisms.

---

## 🚀 Key Features

### 📝 Civic Issue Reporting & Tracking

* Submit complaints related to sanitation, infrastructure, water issues, etc.
* Supports both manual input and assisted input (voice-based, location-enabled)
* Track complaints with real-time status updates:

  * Submitted
  * In Progress
  * Resolved
* Improves transparency and accountability

---

### 🚨 Emergency SOS System

* One-click SOS button for instant emergency alerts
* Sends high-priority requests to the backend
* Attempts to capture user location automatically
* Works even if location services fail (ensures reliability)
* Designed for fast, frictionless emergency response

---

### 🏛️ Government Scheme Eligibility Detection

* Intelligent system suggests schemes based on user data
* Helps citizens discover benefits they may not be aware of
* Improves accessibility and inclusivity

---

### 📄 Document Verification & Processing

* Upload and scan documents
* Extracts relevant information automatically
* Reduces manual effort and speeds up verification

---

### 👥 Role-Based Dashboards

* **Users:** Submit and track complaints
* **Officials:** Manage and update complaint statuses
* **Admins:** Monitor system activity and analytics

---

### 🌐 Community Engagement

* Community pages for interaction and participation
* Leaderboards to recognize active contributors
* Encourages civic responsibility and collaboration

---

### 📊 Data Insights & Heatmaps

* Visual representation of complaint density
* Identifies high-issue areas (hotspots)
* Helps authorities prioritize actions effectively

---

### 🌍 Offline Support (Offline-First Approach)

* Works even with limited or no internet connectivity
* Stores actions locally using IndexedDB
* Syncs data automatically when connection is restored

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Context API (state management)
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### APIs & Integrations

* Geolocation API (location detection)
* IndexedDB (offline storage)
* Google Maps API (optional for maps)
* Twilio (optional for notifications)

---

## 📁 Project Structure

```
Viksit-Bharat/
│
├── backend/        # Server-side APIs and logic
├── src/            # React frontend application
├── public/         # Static assets
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/vaishnavi24-hyd/Viksit-Bharat.git
cd Viksit-Bharat
```

---

### 2️⃣ Install dependencies

Frontend:

```
npm install
```

Backend:

```
cd backend
npm install
```

---

## ▶️ Run the Application

Frontend:

```
npm run dev
```

Backend:

```
cd backend
node server.js
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

```
PORT=5000
```

> ⚠️ Do not upload `.env` to GitHub



## 📄 License

This project is intended for educational and demonstration purposes.

---

## 👨‍💻 Author

**Vaishnavi**
GitHub: https://github.com/vaishnavi24-hyd

---
