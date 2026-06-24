# 📩 WhatsApp Messaging Portal — Version 07

> **Branch:** `origin/version-07`
> **Internal Tag:** v7.0
> **Database:** PostgreSQL
> **Type:** Auto Reply Bot System + Full Chat Platform

---

## What Is This Version?

Version 07 is the most feature-complete released version. It takes everything from Version 06 and adds the **Keyword-based Auto Reply System** — the platform now listens to incoming WhatsApp messages and automatically sends back pre-configured responses when a matching keyword is detected.

It also includes a starred/favourite keyword messages system, and a complete CRUD panel for managing default keywords and their responses.

---

## What's New in This Version

- 🤖 **Auto Reply System (NEW)** — Define keywords and their matching auto-responses. When an incoming message contains a keyword, the bot instantly replies
- ⭐ **Starred Keyword Messages** — Mark certain keyword responses as starred/favourite for quick access
- 📋 **Default Keywords Management** — Full CRUD panel to add, edit, delete, and manage all keywords and their messages
- ✅ All features from Version 06 retained

---

## How Auto Reply Works

```
Incoming Message: "pricing"
     ↓
System checks against keyword list
     ↓
Match Found: "pricing" → "Hello 👋 Here is our pricing..."
     ↓
Auto Reply sent instantly
```

---

## Core Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Secure JWT login & signup |
| 📱 QR Session | WhatsApp connection via QR |
| 📥 Contact Sync | Auto-import WhatsApp contacts |
| 💬 Personal Chat | Real-time 1-on-1 messaging |
| 🤖 Auto Reply | Keyword-based auto responses |
| ⭐ Starred Keywords | Mark favourite keyword responses |
| 📤 Bulk Messaging | Broadcast to multiple contacts |
| 👥 Group Messaging | Send to WhatsApp groups |
| 🧾 Templates | Reusable message templates |
| 🗄️ PostgreSQL | Relational database |
| ⚡ Socket.IO | Real-time communication |
| 🔄 Session Persistence | Stable long-running sessions |

---

## Screenshots

### Sign Up
![Signup](./01_signup.png)

### Login
![Login](./02_login.png)

### Home Dashboard
![Home](./03_homeScreen.png)

### Add WhatsApp Session
![Session](./04_addedWhatsappSection.png)

### QR Authentication
![QR](./05_orScreen.png)

### Single Contact / Chat View
![Chat](./06_singleMessageScreen.png)

### Bulk Messaging
![Bulk Messaging](./07_multipleMessageSheringScreen.png)

### Group Bulk Messaging
![Group Messaging](./08_groupBlunkMessage.png)

### Chat Mode Interface
![Chat Mode](./09_chateModeScreen.png)

### Single Contact Added
![Single Contact](./10_singleContectAdded.png)

### Bulk Contact Import
![Bulk Contacts](./11_blunkContectAdded.png)

### Template System
![Templates](./12_templeteAdded.png)

### Default Keywords Page (Auto Reply Config)
![Keywords](./13_deafultkwyqordPage.png)

---

## Key Workflows

```
Auto Reply:
Configure Keyword + Message → Incoming Message Received → Keyword Matched → Auto Reply Sent

Personal Chat:
Select Contact → Open Chat → Send / Receive Messages

Bulk Messaging:
Select Contacts → Write Message → Send → Track Delivery

Group Messaging:
Fetch Groups → Select Group(s) → Write Message → Send
```

---

## What's Missing (Compared to Working Branch)

- ❌ No Chat Assignments (assign chats to team members)
- ❌ No Agent Notes on conversations

---

## Tech Stack

| Technology | Usage |
|---|---|
| React.js | Frontend |
| Node.js + Express | Backend |
| PostgreSQL | Database |
| Socket.IO | Real-time |
| whatsapp-web.js | WhatsApp |
| JWT + bcrypt | Authentication |
