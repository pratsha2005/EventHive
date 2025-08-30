# 📅 EventHive – Plan, Book & Celebrate with Ease 🚀


*EventHive* is a modern, full-stack event management and ticketing platform that simplifies event creation, ticket sales, and attendee engagement. Built with a modular architecture consisting of a *React-based frontend, a powerful **organizer dashboard, and a secure **Node.js/Express + PostgreSQL backend*, EventHive provides a seamless experience for organizers, attendees.


---

## 🌐 Live Demo 
> 🔗 [DocNow]()

---

## 📚 Table of Contents
- [✨ Features](#-features)
- [📦 Project Structure](#-project-structure)
- [🛠 Technologies Used](#-technologies-used)
- [🚀 Installation](#-installation)
- [🕹 Usage Guide](#-usage-guide)
- [📢 API Endpoints (Backend)](#-api-endpoints-backend)
- [🤝 Contributing](#-contributing)
- [📄 Motivation](#-motivation)

---

## ✨ Features  

### 🔐 Authentication & Access  
- Secure JWT-based login/registration for Organizers and Attendees
- Role-based access control ( Event Manager and Volunteer)  

### 🎉 Event Creation & Management  
- Create and publish events with details: title, description, date, time, venue, and category  
- Add multiple ticket types (General, VIP, Student, Early Bird)  
- Define ticket attributes: price, sale period, and quantity limits  
- Save as draft or publish for public visibility  

### 🔍 Event Discovery & Booking  
- Search and filter events by category, date, location, and price  
- Featured/Trending event highlights  
- Book multiple tickets with per-user limits  
- Secure attendee registration and payment (UPI, cards, wallets, net banking)  

### 🎫 Ticketing & Delivery  
- Auto-generated tickets with unique QR/Barcode  
- Ticket delivery via Email  
- Option to download from attendee dashboard  
- Booking confirmation via Email

### 📊 Organizer Dashboard  
- Manage events, ticket inventory, and attendee lists  
- Real-time sales analytics & revenue tracking  
- Export attendee data in CSV/Excel  

### 🧑‍🤝‍🧑 Attendee Dashboard  
- View “My Tickets” and booking history  
- Cancel bookings with refund policy  
- Earn loyalty points & rewards for repeat participation  

### ✅ Event Check-In System  
- QR/Barcode scanning for quick entry  
- Real-time validation to prevent duplicate entries  
- Check-in stats available to organizers  

### 📈 Analytics & Reports  
- Insights on ticket sales, revenue, and active attendees  
- Demographic insights (location, ticket category)  
- Downloadable reports for organizers  

---

## 📦 Project Structure

📁 EventHive/
├── 📁 backend/
│   ├── 📁 config/
│   │   ├── cloudinary.js
│   │   ├── emailTemplates.js
│   │   └── nodemailer.js
│   ├── 📁 controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── userController.js
│   ├── 📁 db/
│   │   ├── .js
│   ├── 📁 middlewares/
│   │   ├── userAuth.js
│   │   └── multer.js
│   ├── 📁 models/
│   │   ├── attendee.models.js
│   │   ├── events.models.js
│   │   ├── ticket.models.js
│   │   └── userModel.js
│   ├── 📁 routes/
│   │   ├── ticketService.js
│   ├── 📁 services/
│   │   ├── authRoutes.js
│   │   ├── event.routes.js
│   │   └── userRoutes.js
│   ├── .env
│   └── app.js
│
├── 📁 frontend/
│   ├── 📁 public/
│   │    └── favicon.svg
│   ├── 📁 src/
│   │   ├── 📁 assets/
│   │   ├── 📁 components/
│   │   ├── 📁 context/
│   │   ├── 📁 pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   └── index.html
└── README.md


---

## 🛠 Technologies Used

### 🔧 Backend
- Node.js, Express.js
- PostgreSQL + Prisma 
- Cloudinary
- JWT Authentication
- Multer
- Stripe (Payments)
- Google map Api (Locations)

### 🎨 Frontend & Admin Panel
- React.js
- Tailwind CSS 
- React Router DOM
- Axios
- React-icons
- react-toastify
- Stripe Checkout (Payments)
- Google map (Locations)
---

## 🚀 Installation

### 🔧 1. Clone the Repository
bash
git clone https://github.com/pratsha2005/EventHive.git
cd EventHive

### ⚙ 2. Backend Setup (inside /server)
bash
cd backend
npm install

Create a .env file and add:
bash
DATABASE_URI = ''
CLOUDINARY_NAME = ''
CLOUDINARY_API_KEY = ''
CLOUDINARY_SECRET_KEY = '' 
ADMIN_EMAIL = ''
ADMIN_PASSWORD = ''
JWT_SECRET = ''
STRIPE_KEY_ID = ''   
STRIPE_KEY_SECRET = '' 

Start the backend server:
bash
npm run dev

### 💻 3. Frontend Setup (inside /client)
bash
cd ../frontend
npm install

Set up environment:
bash
VITE_BACKEND_URL = ''

Start the frontend:
bash
npm run dev


## 🕹 Usage Guide

### 👤 Attendees
- Register/Login  
- Browse upcoming events  
- Search & filter events by category, date, location, and price  
- Book tickets securely via integrated payment gateways  
- Download or view tickets from “My Tickets” dashboard  

### 🎉 Organizers
- Login with organizer credentials  
- Create, update, or cancel events  
- Manage ticket types, pricing, and quantity  
- Track ticket sales & attendee registrations  
- Export attendee lists in CSV/Excel  
- Send notifications/reminders to attendees   
---

## 🛠 API Endpoints

| Method | Endpoint | Description | Auth Required | Notes |
|--------|----------|-------------|---------------|-------|
| POST | /auth/register | Register a new user | ❌ | Accepts avatar as file upload |
| POST | /auth/login | Login user | ❌ | - |
| POST | /auth/logout | Logout user | ✅ | User must be logged in |
| POST | /auth/send-verify-otp | Send OTP to verify account | ✅ | - |
| POST | /auth/verify-account | Verify email/account | ✅ | - |
| GET  | /auth/is-auth | Check if user is authenticated | ✅ | Returns user info |
| POST | /auth/send-reset-otp | Send OTP for password reset | ❌ | - |
| POST | /auth/reset-password | Reset password using OTP | ❌ | - |

| Method | Endpoint | Description | Auth Required | Notes |
|--------|----------|-------------|---------------|-------|
| POST | /events/add-event | Add a new event | ✅ | Accepts banner (1 file) & gallery (up to 10 files) |
| POST | /events/edit-event/:eventId | Edit existing event | ✅ | Accepts banner & gallery as files |
| GET  | /events/getAllEventByManagerId | Get all events created by manager | ✅ | - |
| GET  | /events/getEventById/:eventId | Get details of a single event | ❌ | - |
| GET  | /events/exportCSV/:eventId | Export attendee list as CSV | ❌ | - |

| Method | Endpoint | Description | Auth Required | Notes |
|--------|----------|-------------|---------------|-------|
| GET  | /user/data | Get logged-in user data | ✅ | - |
| GET  | /user/getAllEvents | Get all available events | ✅ | - |
| POST | /user/register/:eventId | Register for an event | ✅ | - |
 

📌 More endpoints available in API documentation.

---

## 🤝 Contributing

We welcome contributions to improve *EventHive*!

### 🧩 How to Contribute

#### 1. Fork the Repository  
   Click the *Fork* button on the top right of this page.

#### 2. Clone Your Fork 
   Open terminal and run:
   bash
   git clone https://github.com/pratsha2005/EventHive.git
   cd EventHive
   

#### 3. Create a feature branch:
   Use a clear naming convention:
   bash
   git checkout -b feature/new-feature
   
   
#### 4. Make & Commit Your Changes
   Write clean, documented code and commit:
   bash
   git add .
   git commit -m "✨ Added: your change description"
   
   
#### 5. Push to GitHub & Submit PR
   bash
   git push origin feature/your-feature-name
   
#### 6. Then go to your forked repo on GitHub and open a Pull Request.

---

## ⭐ Motivation

> 💡*PS:* If you found this project helpful or inspiring, please *[⭐ star the repository](https://github.com/pratsha2005/EventHive)* — it keeps me motivated to build and share more awesome projects like this one!
---
