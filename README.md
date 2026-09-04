# Revenue Recovery Desk

A full-stack customer churn-risk and revenue-recovery platform designed to help customer-success and finance teams identify customers at risk of churn, understand the factors behind that risk, and simulate retention strategies.

## 🚀 Live Demo

**Frontend:**  
https://revenue-recovery-rho.vercel.app

**Backend API:**  
https://revenue-recovery-1-kg4m.onrender.com

**ML Service:**  
https://revenue-recovery-ml.onrender.com

> Replace `YOUR_VERCEL_URL` with your actual Vercel deployment URL.

---

## 📌 Overview

Revenue Recovery Desk combines customer analytics, machine-learning-based churn prediction, and retention simulations into a single dashboard.

The platform allows users to:

- Authenticate securely
- View and search customers
- Analyze customer churn risk
- Identify high-risk customers
- View customer-level risk factors
- Generate retention recommendations
- Simulate retention offers
- Create and manage customer interventions
- Track intervention outcomes
- Analyze revenue and churn trends

The application uses a React frontend, Node.js/Express backend, MongoDB Atlas for persistent data, and a separate Python FastAPI machine-learning service.

---

## ✨ Features

### 🔐 Authentication

- JWT-based authentication
- Protected application routes
- Secure API authorization
- Login and logout functionality

### 👥 Customer Management

- View customer records
- Search customers
- View customer details
- Add new customers
- Track customer revenue and subscription information
- Monitor customer engagement and support activity

### 🤖 Churn Risk Prediction

The machine-learning service evaluates customer information and produces a churn probability.

Risk levels are categorized as:

- **LOW**
- **MEDIUM**
- **HIGH**
- **CRITICAL**

The prediction considers customer attributes such as:

- Tenure
- Monthly revenue
- Support tickets
- Payment failures
- Usage changes
- NPS
- Plan type
- Login activity
- Discounts
- Price increases
- Engagement trends
- Complaint recency
- Feature adoption
- Competitor pressure
- Opt-out status

### 📊 Analytics

The dashboard provides insights into:

- Customer risk distribution
- Revenue at risk
- Churn trends
- Customer segments
- Retention opportunities
- Intervention outcomes

### 💡 Retention Recommendations

The system can recommend retention strategies based on customer risk and expected value.

Recommendations can include:

- Discounts
- Plan adjustments
- Customer-success outreach
- Feature education
- Other retention interventions

Each strategy can be evaluated using expected retention and revenue impact.

### 🧪 Retention Simulator

Users can simulate different retention offers and compare their expected financial impact before applying an intervention.

### 🎯 Intervention Management

Users can create and track interventions for customers, including:

- Retention strategy
- Cost
- Expected retention
- Expected revenue
- Net value
- Intervention status
- Outcome

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      React Client    │
                         │   Vite + Tailwind    │
                         └──────────┬───────────┘
                                    │
                              REST API / JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │      Backend API      │
                         └───────┬────────┬─────┘
                                 │        │
                      MongoDB    │        │ ML Requests
                                 │        │
                                 ▼        ▼
                    ┌──────────────┐   ┌─────────────────┐
                    │ MongoDB      │   │ Python FastAPI  │
                    │ Atlas        │   │ ML Service      │
                    └──────────────┘   └─────────────────┘
                                           │
                                           ▼
                                    Scikit-learn Model
