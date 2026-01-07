# Haibin21 - Supply Chain Finance Platform

A modern supply chain finance management system built with React, TypeScript, and LocalStorage.

## Features

- Order Management
- User Profile Management
- Risk Assessment
- Credit Capacity Tracking
- LocalStorage for data persistence

## Prerequisites

- Node.js 14+

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm run dev
```

The application will use LocalStorage to save data in your browser. Data persists between sessions.

## Data Storage

**Frontend (Current)**: Uses browser LocalStorage for data persistence
- Quick setup, no database required
- Data stored locally in browser
- Perfect for demo and testing

**Backend (Optional)**: MySQL database available for production use
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for backend API setup
- Includes database schema and seed data
- Requires Node.js backend server (Express, Fastify, etc.)

## Database Structure (for Backend)

If you want to build a backend API server:

- **users**: User and company information
- **orders**: Order management and tracking
- **risk_metrics**: Risk assessment metrics

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed backend setup instructions.
