# 🚀 Microtask Platform API

A robust Node.js backend API for a microtask marketplace where users can create tasks, complete tasks for rewards, and manage earnings through an integrated wallet system with admin moderation.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-purple.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing with HTTPie](#testing-with-httpie)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with email verification (OTP)
- Secure login with JWT tokens
- Password reset via email
- Role-based access control (User/Admin)
- KYC level management

### 💼 Task Management
- Create tasks with escrow payment
- Admin approval workflow for tasks
- Task rejection with automatic refund
- Browse available approved tasks
- Submit proof of task completion
- Track task slots and deadlines

### 👨‍💼 Admin Features
- Review and approve/reject task submissions
- Approve or reject task creation
- Manage all users, tasks, and submissions
- Handle withdrawal requests
- Resolve user appeals
- Complete admin dashboard data

### 💰 Wallet & Transactions
- Integrated wallet system
- Escrow management for task payments
- Automatic crediting on task approval
- Withdrawal request system
- Transaction history tracking
- Refund on task rejection

### 📱 User Features
- Submit task proofs (image/text)
- Appeal rejected submissions
- Manage bank account details
- View transaction history
- Track earnings and balance

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer
- **Validation**: Express Validator (optional)
- **Environment**: dotenv

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/microtask-platform-backend.git
cd microtask-platform-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/microtask_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for password reset links)
FRONTEND_URL="http://localhost:5173"

# Email Configuration (using Gmail as example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-specific-password"
EMAIL_FROM="noreply@microtask.com"
```

### 📧 Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `EMAIL_PASSWORD`

## 🗄️ Database Setup

1. **Create PostgreSQL database**

```bash
createdb microtask_db
```

2. **Run Prisma migrations**

```bash
npx prisma migrate dev --name initial_setup
```

3. **Generate Prisma Client**

```bash
npx prisma generate
```

4. **Seed database (optional)**

```bash
npm run seed
```

5. **View database with Prisma Studio**

```bash
npx prisma studio
```

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "userId": 1,
  "otp": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password/:token
Content-Type: application/json

{
  "password": "newPassword123"
}
```

### Task Endpoints

#### Create Task (requires authentication)
```http
POST /tasks/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Follow us on Instagram",
  "description": "Follow our Instagram account and take a screenshot",
  "reward": 50,
  "totalSlots": 100,
  "proofType": "image",
  "escrowAmount": 5000,
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

#### Get Available Tasks
```http
GET /tasks/available
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get My Tasks
```http
GET /tasks/my-tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get Task by ID
```http
GET /tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Submit Task Proof
```http
POST /tasks/:id/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "proofImage": "https://example.com/screenshot.jpg",
  "proofText": "Completed the task as requested"
}
```

### Admin Endpoints

#### Get All Tasks (Admin)
```http
GET /admin/tasks
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Approve Task (Admin)
```http
PUT /admin/tasks/:id/approve
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Reject Task (Admin)
```http
PUT /admin/tasks/:id/reject
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "reason": "Task description is not clear"
}
```

#### Get All Submissions (Admin)
```http
GET /admin/submissions
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Approve Submission (Admin)
```http
PUT /admin/submissions/:id/approve
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Reject Submission (Admin)
```http
PUT /admin/submissions/:id/reject
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Get All Appeals (Admin)
```http
GET /admin/appeals
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Resolve Appeal (Admin)
```http
PUT /admin/appeals/:id/resolve
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "action": "approve",
  "adminMessage": "Appeal approved after review"
}
```

### User Endpoints

#### Get Profile
```http
GET /user/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Add Bank Details
```http
POST /user/bank-details
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "bankName": "First Bank",
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "isPrimary": true
}
```

#### Request Withdrawal
```http
POST /user/withdraw
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "amount": 1000,
  "bankDetailsId": 1
}
```

## 📁 Project Structure

```
microtask-platform-backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   ├── taskController.js       # Task management
│   │   ├── adminController.js      # Admin operations
│   │   └── userController.js       # User operations
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   └── upload.js               # File upload (optional)
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── taskRoutes.js           # Task endpoints
│   │   ├── adminRoutes.js          # Admin endpoints
│   │   └── userRoutes.js           # User endpoints
│   ├── utils/
│   │   ├── sendEmail.js            # Email service
│   │   └── jwt.js                  # JWT utilities
│   └── server.js                   # Express app setup
├── .env                            # Environment variables
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies
└── README.md                       # Documentation
```

## 🧪 Testing with HTTPie

### Install HTTPie
```bash
# macOS
brew install httpie

# Linux/WSL
sudo apt install httpie

# Python pip
pip install httpie
```

### Example Test Flow

```bash
# 1. Register a user
http POST http://localhost:3000/api/auth/register \
  name="Test User" \
  email="test@example.com" \
  password="password123" \
  phone="1234567890"

# 2. Verify email (check your email for OTP)
http POST http://localhost:3000/api/auth/verify-email \
  userId:=1 \
  otp="123456"

# 3. Login and save token
http POST http://localhost:3000/api/auth/login \
  email="test@example.com" \
  password="password123"

# Save the token
export TOKEN="your_jwt_token_here"

# 4. Create a task
http POST http://localhost:3000/api/tasks/create \
  Authorization:"Bearer $TOKEN" \
  title="Instagram Follow Task" \
  description="Follow our account" \
  reward:=50 \
  totalSlots:=10 \
  proofType="image" \
  escrowAmount:=500

# 5. Check available tasks (before admin approval - should be empty)
http GET http://localhost:3000/api/tasks/available \
  Authorization:"Bearer $TOKEN"

# 6. Login as admin and approve task
# First, update user role in database:
# UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';

export ADMIN_TOKEN="admin_jwt_token_here"

http PUT http://localhost:3000/api/admin/tasks/1/approve \
  Authorization:"Bearer $ADMIN_TOKEN"

# 7. Now check available tasks again (should show the approved task)
http GET http://localhost:3000/api/tasks/available \
  Authorization:"Bearer $TOKEN"
```

## 🔒 Security Best Practices

- ✅ Passwords are hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens for stateless authentication
- ✅ Email verification before account activation
- ✅ OTP expiry (10 minutes)
- ✅ Password reset token expiry (15 minutes)
- ✅ Role-based access control
- ✅ SQL injection prevention via Prisma ORM
- ✅ Environment variables for sensitive data

## 🚦 Task Workflow

```
User Creates Task → Task Status: "pending"
         ↓
Admin Reviews Task
         ↓
    [Approve]                    [Reject]
         ↓                            ↓
Status: "approved"          Status: "rejected"
         ↓                   Escrow refunded to user
Task visible to workers
         ↓
Workers submit proofs
         ↓
Admin reviews submissions
         ↓
    [Approve]                    [Reject]
         ↓                            ↓
User gets paid              User can appeal
Wallet credited
```

## 📊 Database Schema

### Key Models

- **User**: Authentication, profile, wallet balance
- **Task**: Task details, escrow, slots, status
- **Submission**: Proof submissions, review status
- **Transaction**: Wallet transaction history
- **Withdrawal**: Withdrawal requests
- **Appeal**: Submission appeal system
- **BankDetail**: User bank account information

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Express.js community
- Prisma ORM team
- Node.js community
- All contributors

## 📞 Support

For support, email support@microtask.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Add file upload for proof images
- [ ] Implement real-time notifications
- [ ] Add payment gateway integration
- [ ] Create admin dashboard UI
- [ ] Add task categories and tags
- [ ] Implement user rating system
- [ ] Add multi-language support
- [ ] Create mobile app API extensions

---

**Made with ❤️ by ELsuraj**
