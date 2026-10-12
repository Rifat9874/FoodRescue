# 🍃 FoodRescue
## Surplus Food Rescue & Redistribution Platform

![FoodRescue Banner](https://via.placeholder.com/1200x400)

FoodRescue is a full-stack web application designed to reduce food waste by connecting surplus food donors with NGOs and volunteers.

The platform enables restaurants, hotels, bakeries, organizations, and individuals to donate safe surplus food while allowing verified NGOs and volunteers to manage requests, pickups, and delivery workflows efficiently.

Built with modern web technologies, FoodRescue demonstrates practical software engineering skills including authentication, database architecture, role-based access control, workflow management, and cloud deployment.

---

# 🌍 Problem Statement

Millions of tons of edible food are wasted every year while many communities struggle with food insecurity.

FoodRescue addresses this challenge by creating a structured digital ecosystem where:

- Food donors can publish available surplus food
- NGOs can request available donations
- Volunteers can coordinate pickups
- Every donation lifecycle can be tracked

The goal is to transform surplus food into meaningful social impact through technology.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- Secure user authentication system
- Role-based access control
- Multiple user roles:
  - Admin
  - Donor
  - NGO
  - Volunteer
- Protected routes and server-side validation

---

# 🍱 Food Donation Management

Donors can:

- Create food listings
- Add food details
- Specify quantity, category, condition, and expiry information
- Track donation availability

Supported categories:

- Cooked Meals
- Bakery Items
- Fruits & Vegetables
- Packaged Food
- Beverages
- Dairy Products

---

# 🤝 Request & Pickup Workflow

Complete donation lifecycle:

```
Food Listed
      ↓
NGO Request
      ↓
Donor Approval
      ↓
Volunteer Assignment
      ↓
Pickup Tracking
      ↓
Completed Delivery
```

The system maintains complete request history and status tracking throughout the process.

---

# 🔔 Notification System

Users receive notifications for:

- New requests
- Approval updates
- Volunteer assignments
- Pickup completion
- Status changes

---

# 📊 Role-Based Dashboard

## 👨‍💼 Admin

- Manage platform activities
- Monitor users
- Track system data


## 🍱 Donor

- Create food listings
- Approve requests
- Manage donations


## 🏥 NGO

- Browse available food
- Submit requests
- Track deliveries


## 🚚 Volunteer

- Manage assigned pickups
- Update delivery status

---

# 🛠️ Technology Stack

## Frontend

- Next.js 15
- React
- JavaScript
- Responsive UI Design


## Backend

- Next.js Server Actions / API Routes
- Node.js
- Mongoose


## Database

- MongoDB Atlas
- MongoDB Data Modeling


## Authentication

- JWT Authentication
- Password Hashing
- Secure Token Management


## Deployment

- Vercel
- MongoDB Atlas

---

# 🏗️ System Architecture

```
                 Users
                   |
                   |
          Next.js Application
                   |
        ------------------------
        |                      |
 Authentication          Business Logic
        |                      |
        ------------------------
                   |
             Mongoose ODM
                   |
             MongoDB Atlas
```

---

# 📂 Project Structure

```
FoodRescue
│
├── app
│   ├── login
│   ├── register
│   ├── donate
│   ├── food
│   └── requests
│
├── components
│
├── models
│   └── Database Schemas
│
├── services
│   ├── listings.js
│   ├── requests.js
│   └── notifications.js
│
├── scripts
│   └── seed.mjs
│
├── lib
│
├── public
│
└── styles
```

---

# 🗄️ Database Design

Main Collections:

```
Users
 |
 |-- Food Listings
 |
 |-- Pickup Requests
 |
 |-- Pickup History
 |
 |-- Notifications
```

Database design focuses on:

- Efficient document modeling
- Relationship management
- Workflow state tracking
- Scalable data organization

---

# 🚀 Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Rifat9874/FoodRescue.git

cd FoodRescue
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Configuration

Create:

```
.env.local
```

Add:

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_SECRET=your_secret_key
```

---

## Run Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🌱 Database Seeding

FoodRescue includes a realistic demo dataset.

Run:

```bash
npm run seed
```

Generated demo data:

- Users
- Food listings
- Requests
- Pickup history
- Notifications


## Demo Account

```
Email:
admin@demo.foodrescue.test

Password:
Demo@1234
```

---

# 📸 Screenshots

Add screenshots of:

- Landing Page
- Authentication System
- Dashboard
- Food Listing Management
- Request Workflow
- User Management

---

# 🌐 Live Demo

https://food-rescue-7wrutov5-sabuj3.vercel.app


# 💻 GitHub Repository

https://github.com/Rifat9874/FoodRescue

---

# 💡 Engineering Highlights

This project demonstrates:

✅ Full-stack application development  
✅ Database architecture design  
✅ Authentication & authorization  
✅ Role-based workflow implementation  
✅ Real-world business logic modeling  
✅ Cloud deployment  
✅ Production environment configuration  

---

# 📈 Future Improvements

- AI-based food demand prediction
- Route optimization for volunteers
- Real-time communication system
- Map-based pickup tracking
- Mobile application
- Analytics dashboard

---

# 👨‍💻 Author

**Rifat9874**

Computer Science & Engineering Student

Interested in:

- Full-Stack Development
- Software Engineering
- Cloud Technologies
- AI-powered Applications


⭐ If you find this project useful, consider giving it a star.
