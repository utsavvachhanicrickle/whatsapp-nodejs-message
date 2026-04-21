Here’s a clean, structured **README.md (v1.0)** for your project. I’ve corrected the wording, organized the flow, and made sure it clearly explains setup, working, and architecture.

---

# 📩 WhatsApp Messaging Portal (v1.0)

A full-stack application that allows users to send and receive WhatsApp messages through a centralized web portal. The system uses WebSockets for real-time communication and integrates with WhatsApp Web via automation.

---

## 🚀 Features

* 🔐 User Registration & Authentication (basic flow)
* 📱 WhatsApp Web integration using QR code
* ⚡ Real-time messaging using WebSockets
* 💬 Send & receive messages from a single dashboard
* 🗄️ MongoDB for message storage
* 🔄 Live connection between frontend and backend

---

## 🏗️ Tech Stack

### Backend

* Node.js + Express
* MongoDB + Mongoose
* Socket.IO (real-time communication)
* Puppeteer (browser automation)
* whatsapp-web.js (WhatsApp integration)
* QRCode (QR generation)

### Frontend

* React (Vite)
* Tailwind CSS
* Axios (API calls)
* Socket.IO Client

---

## ⚙️ Environment Variables

### Backend (`.env`)

```
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/whatsappNodejsMessages
```

### Frontend (`.env`)

```
VITE_SERVER_URL=http://localhost:3000/
```

---

## 📦 Dependencies

### Backend

```json
"dependencies": {
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "mongoose": "^9.5.0",
  "nodemon": "^3.1.14",
  "puppeteer": "^24.42.0",
  "qrcode": "^1.5.4",
  "socket.io": "^4.8.3",
  "whatsapp-web.js": "^1.34.6"
}
```

### Frontend

```json
"dependencies": {
  "@tailwindcss/vite": "^4.2.3",
  "axios": "^1.15.1",
  "react": "^19.2.5",
  "react-dom": "^19.2.5",
  "react-router-dom": "^7.14.1",
  "socket.io-client": "^4.8.3",
  "tailwindcss": "^4.2.3"
}
```

---

## 🧠 How It Works

### 1. User Flow

1. User registers/logs in
2. After login, user connects WhatsApp
3. System generates a QR code
4. User scans QR using WhatsApp mobile app
5. Once verified, session is established
6. User can now send & receive messages

---

### 2. WhatsApp Connection Flow

* Backend uses **whatsapp-web.js**
* Puppeteer launches a browser session
* QR code is generated and sent to frontend
* Frontend displays QR in real-time via Socket.IO
* After scanning:

  * WhatsApp session is authenticated
  * Ready to send/receive messages

---

### 3. Real-Time Communication

* Socket.IO connects frontend and backend
* Events handled:

  * `qr` → send QR code to frontend
  * `ready` → WhatsApp connected
  * `message` → incoming messages
  * `send_message` → outgoing messages

---

### 4. Message Handling

* Messages are:

  * Sent via WhatsApp API wrapper
  * Stored in MongoDB
  * Synced live to frontend

---

## 🖥️ Project Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd project-folder
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file and add:

```
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/whatsappNodejsMessages
```

Run backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```
VITE_SERVER_URL=http://localhost:3000/
```

Run frontend:

```bash
npm run dev
```

---

## 🔗 Client-Server Connection

* Frontend connects to backend via:

  * REST APIs (Axios)
  * WebSockets (Socket.IO)

* Backend allows CORS from:

```
FRONTEND_URL=http://localhost:5173
```

---

## 🔄 Basic Workflow Summary

1. Start backend
2. Start frontend
3. Open frontend in browser
4. Register/Login user
5. Click "Connect WhatsApp"
6. Scan QR code
7. Wait for "Ready" status
8. Start sending messages 🎉

---

## 📌 Important Notes

* Keep your WhatsApp session active
* Do not close Puppeteer browser manually
* MongoDB must be running locally
* QR expires if not scanned quickly → refresh

---

## 🔮 Future Improvements

* JWT Authentication
* Multi-user WhatsApp sessions
* Media (images/videos) support
* Chat history UI improvements
* Deployment support (Docker / Cloud)

---

## 🧑‍💻 Author

Version 1.0 — Initial release
Basic WhatsApp portal with real-time messaging

---

If you want, I can also:

* Add **folder structure**
* Write **sample backend code (Socket + WhatsApp setup)**
* Or create a **UI design layout (React + Tailwind)**
