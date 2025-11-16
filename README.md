# 🔥 Learnsphere Backend

This is the **backend API** for the **Learnsphere** web application. Built with **Node.js** and **Express.js**, it provides secure APIs for course management, user enrollments, and profile management. All endpoints are protected using **Firebase Authentication tokens**.

---

## 🌐 Live API

- API Base URL: `https://learnsphere-online-learning-platfor.vercel.app/`  
  _(replace with your deployed backend URL)_

---

## 🎯 Project Purpose

**Learnsphere** is an online learning platform that connects students with courses and instructors. The backend:

- Provides secure REST APIs for the frontend application
- Handles course listings, user enrollments, and profile management
- Stores data in **MongoDB**
- Verifies Firebase ID tokens for authentication

---

## 🛠️ Tech Stack

| Category           | Tools / Libraries                 |
| ------------------ | --------------------------------- |
| **Server**         | Node.js, Express.js               |
| **Database**       | MongoDB                           |
| **Authentication** | Firebase Admin SDK                |
| **Security**       | CORS, Firebase Token Verification |
| **Environment**    | dotenv                            |

---

## 📦 Dependencies

```bash
npm install express cors dotenv firebase-admin mongodb
```
