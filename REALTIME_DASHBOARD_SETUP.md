# Quick Setup - RODEO Real-Time Dashboard

## Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

## Access the Dashboard

Once the server is running, navigate to:
```
http://localhost:5173/realtime
```

## What You'll See

The dashboard includes 7 live sections:

1. **System Metrics** (top) - CPU, Memory, Network, Active Plugins
2. **Plugin Execution Monitor** (left) - Real-time plugin activity
3. **Live Event Feed** (right) - Streaming security events
4. **Vulnerability Feed** (bottom left) - Discovered vulnerabilities
5. **Network Activity** (bottom right) - Live network charts
6. **Recent Scans** (lower left) - Active and completed scans
7. **Plugin Usage** (lower right) - Distribution pie chart

## Demo Mode

Currently runs in **demo/simulation mode** with:
- Simulated plugin executions every 3 seconds
- Random vulnerability discoveries every 4 seconds
- Live system metrics every 2 seconds
- Network activity animations
- Recent scan updates every 5 seconds

All data updates automatically - no page refresh needed!

## Next Steps

To connect to real backend:

1. **Backend WebSocket endpoints** need to be implemented (see docs/REALTIME_DASHBOARD_GUIDE.md)
2. **Update WebSocket URLs** in `src/hooks/useWebSocket.js`
3. **Deploy backend** with FastAPI WebSocket support

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5173
npx kill-port 5173

# Or specify different port
npm run dev -- --port 5174
```

**Dependencies missing?**
```bash
npm install
```

**Build for production:**
```bash
npm run build
npm run preview
```

---

**Quick Start:** `npm run dev` → Open `http://localhost:5173/realtime` → Done! 🎉
