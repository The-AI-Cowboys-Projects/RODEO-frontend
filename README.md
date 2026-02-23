# RODEO Frontend

React-based frontend dashboard for RODEO cybersecurity platform.

## Features

- 🔐 JWT Authentication
- 📊 Real-time Dashboard with Statistics
- 🦠 Malware Sample Management
- 🔓 Vulnerability Tracking
- 🩹 Patch Management
- 📈 Data Visualization with Recharts
- 🎨 Tailwind CSS Styling

## Setup

### Prerequisites

- Node.js 18+ and npm
- RODEO API running on http://localhost:8000

### Installation

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js          # API client with axios
│   ├── components/
│   │   └── Layout.jsx          # Main layout component
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Samples.jsx         # Malware samples list
│   │   ├── Vulnerabilities.jsx # Vulnerabilities list
│   │   └── Patches.jsx         # Patches list
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Login

Default credentials:
- Username: `admin`
- Password: `rodeo123`

### API Integration

The frontend communicates with the RODEO API via axios. All API calls are in `src/api/client.js`:

```javascript
import { samples, vulnerabilities, patches, stats } from './api/client'

// Get high-risk samples
const data = await samples.getHighRisk(0.7)

// Get critical vulnerabilities
const vulns = await vulnerabilities.getCritical()

// Get statistics
const overview = await stats.overview()
```

### Authentication

JWT tokens are stored in localStorage and automatically included in all API requests via axios interceptors.

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:8000
```

## Development

```bash
# Run development server with hot reload
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Axios** - HTTP client
- **Recharts** - Charts and graphs
- **Tailwind CSS** - Styling

## Components

### Layout

Main layout with navigation sidebar.

### Dashboard

Shows overview statistics, charts, and recent high-risk samples.

### Samples

List and filter malware samples with risk scores.

### Vulnerabilities

Browse and search CVEs and vulnerabilities.

### Patches

View available patches and their status.

## Customization

### Styling

Edit `src/index.css` and use Tailwind utility classes.

### API Endpoints

Modify `src/api/client.js` to add new endpoints.

### Pages

Create new pages in `src/pages/` and add routes in `App.jsx`.
