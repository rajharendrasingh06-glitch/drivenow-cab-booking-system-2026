# DriveNow – Cab Booking System

DriveNow is a full-stack MERN cab booking system designed for booking rides across Indian cities. Users can select pickup and drop locations, find available cabs, view driver details, book rides, make payments, and manage their ride history.

## Features

* User registration and login
* JWT-based authentication
* Pickup and drop location selection
* Current location using GPS
* Nearby cab availability
* Cab/vehicle selection
* Driver details and safety information
* Ride booking and cancellation
* Current ride tracking
* Ride history
* Online payment integration
* Payment history
* Ratings and reviews
* Notifications
* User profile management
* Admin dashboard
* Driver dashboard
* Vehicle management
* Booking and payment management
* Responsive design for desktop and mobile
* Indian cities and INR-based pricing

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* REST API

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT
* bcrypt/bcryptjs
* Environment variables

### Other Services

* Google Maps / GPS
* Razorpay payment integration
* Cloudinary
* Email service

## Project Structure

```text
drivenow-cab-booking-system/
├── public/
├── src/
├── server.ts
├── package.json
├── .env.example
├── tsconfig.json
└── vite.config.ts
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/rajharendrasingh06-glitch/drivenow-cab-booking-system-2026.git
```

### 2. Open the project

```bash
cd drivenow-cab-booking-system-2026
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a local environment file using `.env.example` and add the required configuration values.

Do not commit your `.env` file or any private API keys to GitHub.

### 5. Start the application

```bash
npm run dev
```

The application will start in development mode.

## License

This project is developed as an academic/full-stack web development project.
