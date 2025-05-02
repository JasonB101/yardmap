# Junkyard Map Application

A full-stack application for finding and managing self-service junkyards. Built with React, TypeScript, Express, and MongoDB.

## Features

- Interactive map interface using Google Maps
- Add and view self-service junkyards
- Detailed information about each junkyard including:
  - Business hours
  - Available services
  - Payment methods
  - Contact information
- Responsive design with Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- Google Maps API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd junkyard-map
```

2. Install dependencies for both server and client:
```bash
npm run install-all
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/junkyard-map
PORT=5000
```

4. Create a `.env` file in the client directory with your Google Maps API key:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create optimized builds for both the client and server.

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Google Maps API
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - Mongoose

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 