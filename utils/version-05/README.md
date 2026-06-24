# 📩 WhatsApp Messaging Portal — Version 05

> **Branch:** `origin/version-05`
> **Internal Tag:** v5.0
> **Database:** PostgreSQL
> **Type:** Contact Sync + UI Improvements (Intermediate Build)

---

## What Is This Version?

Version 05 sits between Version 03 and Version 06 in terms of features. It introduces **direct WhatsApp Contact Synchronization** and a significantly **improved modern UI**, but the personal live chat mode is not yet fully implemented in this branch.

Think of this as the upgrade path: it has the contact sync and UI polish from v6, but without the chat mode. It's a lightweight option if someone needs bulk + group messaging + contact sync but not a full live chat interface.

---

## What's New in This Version

- 📥 **Direct WhatsApp Contact Fetching (NEW)** — Sync all contacts from WhatsApp directly into PostgreSQL database
- 🎨 **Improved Modern UI/UX** — Cleaner layout, better navigation, improved dashboard design
- 👥 **Improved Group Messaging** — Faster group fetch and better delivery experience
- 📤 **Enhanced Bulk Messaging** — Optimized queue handling with better success/failure tracking
- ✅ All features from Version 03 retained

---

## Core Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT login & register |
| 📱 QR Session | WhatsApp connection |
| 📥 Contact Sync | Fetch WhatsApp contacts |
| 💬 Single Messaging | Send to one contact |
| 📤 Bulk Messaging | Broadcast to many contacts |
| 👥 Group Messaging | Send to WhatsApp groups |
| 🧾 Templates | Save reusable messages |
| 🗄️ PostgreSQL | Relational database |
| ⚡ Socket.IO | Real-time updates |

---

## Screenshots

### Home Screen
![Home](./homeScreen.png)

### Connecting Session
![Connecting](./connectingScreen.png)

### QR Code
![QR](./qrCode.png)

### Add Single Contact
![Single Contact](./addedsignlecontect.png)

### Multiple Contacts View
![Multiple Contacts](./addednesession.png)

### Group Messaging
![Group](./groupmessage.png)

### Single Person Messaging
![Single Message](./Singlemessage.png)

### Multi-Contact Messaging
![Multiple Message](./multipleContectAdded.png)

---

## Key Workflows

```
Contact Sync:
Connect WhatsApp → Fetch Contacts → Save to PostgreSQL → Real-time Sync

Group Messaging:
Fetch Groups → Select Group(s) → Write Message → Send

Bulk Messaging:
Select Contacts → Write Message → Send → Track Delivery
```

---

## What's Missing (Compared to Later Versions)

- ❌ No Personal / Live Chat mode (not yet implemented in this branch)
- ❌ No Auto Reply system
- ❌ No Chat Assignments

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
