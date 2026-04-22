
# 📩 WhatsApp Messaging Portal (v2.1)

A full-stack real-time WhatsApp messaging system using **Node.js, Socket.IO, and WhatsApp Web automation (whatsapp-web.js)**.
It provides a dashboard to connect WhatsApp via QR code and send/receive messages in real time.

---

# 🚀 Features

* 🔐 Basic Authentication (Auth flow ready)
* 📱 WhatsApp Web connection via QR code
* ⚡ Real-time messaging using Socket.IO
* 💬 Send & receive messages instantly
* 👥 Multi-user session support
* 🗄️ MongoDB message & user storage
* 🌙 Dark mode UI support
* 📡 Live session status tracking (ready, disconnected, qr)

---

# 🧠 System Architecture

```
Frontend (React)
      │
      │  REST API + Socket.IO
      ▼
Backend (Node + Express)
      │
      │  whatsapp-web.js (Puppeteer)
      ▼
WhatsApp Web Session
      │
      ▼
MongoDB (Storage)
```

---

# 📁 Folder Structure

## 🔹 Backend

```
server/
│
├── src/
│   ├── controllers/        # Business logic (message, user)
│   ├── services/           # WhatsApp & DB services
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── sockets/            # Socket events
│   ├── config/             # DB connection
│   └── app.js
│
├── server.js
└── .env
```

---

## 🔹 Frontend

```
frontend/
│
├── src/
│   ├── components/         # UI components (Input, Button, QR)
│   ├── pages/              # HomePage, LoginPage
│   ├── services/           # API calls (axios)
│   ├── store/              # Redux (auth, users, messages)
│   ├── socket/             # socket client setup
│   ├── context/            # theme (dark mode)
│   ├── utils/              # constants, helpers
│   └── App.jsx
```

---

# 📸 Screenshots

> Add your real screenshots here

### 🖥️ Dashboard

## 📸 Dashboard

![Dashboard](./screenshots/version02/dashboard.png)

### 📱 QR Connection Screen

![QR](./screenshots/version02/qr%20code%20screen.png)

### 💬 Messaging UI

![MESSAGING](./screenshots/version02/fullscreenwithoptions.png)


---

# ⚙️ Environment Variables

## Backend `.env`

```
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/whatsappNodejsMessages
```

## Frontend `.env`

```
VITE_SERVER_URL=http://localhost:3000/
```

---

# 🧩 Core Modules

## 📡 WhatsApp Service

* Handles QR generation
* Manages Puppeteer session
* Sends messages via `whatsapp-web.js`

---

## 🔌 Socket System

Events:

* `qr` → send QR to frontend
* `ready` → session active
* `message` → receive messages
* `session-removed` → cleanup session

---

## 💬 Messaging System

Flow:

```
User → Frontend → API → WhatsApp Service → WhatsApp Web → Response → UI update
```

---

## 🗄️ Database

Stores:

* Users (phone/session)
* Messages
* Default templates

---

# 🔄 App Flow

1. Start backend server
2. Start frontend
3. Open dashboard
4. Enter phone number
5. QR generated
6. Scan using WhatsApp
7. Session becomes ACTIVE
8. Send messages instantly

---

# 🖥️ Project Setup

## 1. Clone Project

```bash
git clone <repo-url>
cd project
```

---

## 2. Backend

```bash
cd server
npm install
npm run dev
```

---

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📌 Important Notes

* ⚠️ WhatsApp session depends on QR scan timing
* ⚠️ Do not close Puppeteer browser manually
* ⚠️ MongoDB must be running
* ⚠️ Session disconnect requires re-scan

---

# 🔮 Future Improvements

* 🔐 JWT authentication
* 📱 Multi-device WhatsApp sessions
* 📎 Media (images, videos, docs)
* 📊 Message analytics dashboard
* ☁️ Production deployment (Docker + Cloud)
* 🔁 Message queue system (retry failed sends)

---

# 📌 UI PLACEHOLDER SECTION (IMPORTANT)

## 🖼️ Add UI Screens

You can add screenshots here:

```
📸 Home Dashboard
📸 QR Login Screen
📸 Active Chat Window
📸 User Session List
```

---

# 🧑‍💻 Author

WhatsApp Messaging Portal v2.1
Built with ❤️ using MERN + Socket.IO + WhatsApp Web Automation

---

# 🚀 If you want next level upgrade

I can also help you:

* 🔥 Convert this into a **production-ready architecture (Docker + PM2)**
* 🔥 Add **system design diagram (image-ready)**
* 🔥 Or write a **professional GitHub README badge section (stars, tech stack icons)**

Just tell 👍
