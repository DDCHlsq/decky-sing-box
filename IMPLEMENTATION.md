# Sing-Box Manager - Implementation Summary

**Date**: 2026-02-27
**Project**: Steam Deck Decky Plugin for sing-box management
**Status**: Implementation Complete

---

## Overview

A comprehensive Decky Loader plugin for managing the sing-box network proxy service on Steam Deck. The plugin provides service control, configuration management, and node selection through an integrated UI in the Steam Deck's Quick Access menu.

---

## Architecture

### System Design

```
┌─────────────────┐     HTTP      ┌─────────────────┐
│  Decky Plugin   │ ◄──────────► │  Python Backend │
│  (React/TS)     │  (localhost)  │  (FastAPI)      │
└─────────────────┘  :5555        └────────┬────────┘
                                           │
                                    systemd calls
                                           │
                                           ▼
                                   ┌───────────────┐
                                   │  sing-box     │
                                   │  (systemd)    │
                                   └───────────────┘
```

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 + TypeScript |
| Backend | Python 3 + FastAPI |
| Packaging | Webpack |
| Service Management | systemd |
| Authorization | polkit |

---

## Project Structure

```
singbox-decky-plugin/
├── src/
│   ├── index.tsx              # Main plugin entry and UI
│   ├── components/
│   │   ├── StatusCard.tsx     # Service status display & controls
│   │   ├── Settings.tsx       # Configuration URL input & download
│   │   └── NodeSelector.tsx   # Node selection interface
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       ├── api.ts             # Backend API client
│       └── decky.ts           # Decky API utilities
├── backend/
│   └── main.py                # FastAPI backend service (10 endpoints)
├── systemd/
│   ├── sing-box.service       # sing-box systemd unit file
│   ├── singbox-manager.service # Backend service unit file
│   ├── singbox-manager.desktop # Desktop entry point
│   └── 50-singbox-manager.polkit # Polkit authorization rules
├── scripts/
│   ├── install.sh             # Full installation script
│   ├── uninstall.sh           # Uninstallation script
│   └── install-singbox.sh     # sing-box binary installer
├── plugin.json                # Plugin metadata for Decky Loader
├── package.json               # npm dependencies
├── tsconfig.json              # TypeScript configuration
├── webpack.config.ts          # Webpack bundling configuration
├── config.template.json       # Sample sing-box configuration
├── .gitignore
└── README.md                  # User documentation
```

---

## Files Created

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | npm dependencies (React, TypeScript, Webpack, Decky API) |
| `tsconfig.json` | TypeScript compiler options |
| `webpack.config.ts` | Webpack bundling configuration |
| `plugin.json` | Decky Loader plugin metadata |
| `.gitignore` | Git ignore rules |

### Frontend Source Files

| File | Purpose |
|------|---------|
| `src/index.tsx` | Main plugin component with tabbed UI |
| `src/components/StatusCard.tsx` | Service status indicator and start/stop controls |
| `src/components/Settings.tsx` | Configuration URL input and download |
| `src/components/NodeSelector.tsx` | Proxy node list and selection |
| `src/types/index.ts` | TypeScript interfaces and type definitions |
| `src/utils/api.ts` | API client for backend communication |
| `src/utils/decky.ts` | Decky API initialization and utilities |

### Backend Files

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI service with 10 API endpoints |

### Systemd Files

| File | Purpose |
|------|---------|
| `systemd/sing-box.service` | sing-box service unit |
| `systemd/singbox-manager.service` | Backend API service unit |
| `systemd/singbox-manager.desktop` | Desktop entry for polkit |
| `systemd/50-singbox-manager.polkit` | Polkit authorization rules |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/install.sh` | Automated installation on Steam Deck |
| `scripts/uninstall.sh` | Clean uninstallation |
| `scripts/install-singbox.sh` | sing-box binary installation helper |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | User documentation with installation and usage guide |
| `config.template.json` | Sample sing-box configuration template |

---

## Backend API Reference

Base URL: `http://localhost:5555`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/health` | GET | Health check | - | `{ status: "ok" }` |
| `/status` | GET | Get sing-box service status | - | `{ active, running, status }` |
| `/start` | POST | Start sing-box service | - | `{ success, message }` |
| `/stop` | POST | Stop sing-box service | - | `{ success, message }` |
| `/restart` | POST | Restart sing-box service | - | `{ success, message }` |
| `/config/fetch` | POST | Download config from URL | `{ url: string }` | `{ success, message, outbounds_count }` |
| `/config/nodes` | GET | Get available nodes | - | `{ nodes: [{ index, name, type }], total }` |
| `/config/select` | POST | Select a proxy node | `{ node_name: string }` | `{ success, message, node_name }` |
| `/config/logs` | GET | Get service logs | `?lines=50` | `{ logs: string }` |
| `/singbox/version` | GET | Get sing-box version | - | `{ version: string }` |

---

## Core Features

### 1. Service Management
- Start, stop, and restart sing-box service via systemd
- Real-time status monitoring with visual indicator
- Automatic status polling every 10 seconds

### 2. Configuration Management
- Download configuration from any HTTP/HTTPS URL
- Automatic JSON validation
- Configuration saved to `/home/deck/.config/sing-box/config.json`
- URL persisted in localStorage

### 3. Node Selection
- Parse `outbounds` array from configuration
- Filter out selector/urltest type outbounds
- Display node name and type
- Modify configuration to set selected node
- Auto-restart service after node change

### 4. User Interface
- Three-tab layout: Status, Config, Nodes
- Steam Deck-optimized styling
- Toast notifications for actions
- Loading states and error handling
- Scrollable node list with custom scrollbar

---

## Key File Paths (Steam Deck)

| Component | Path |
|-----------|------|
| Plugin directory | `/home/deck/homebrew/plugins/singbox-manager/` |
| sing-box config | `/home/deck/.config/sing-box/config.json` |
| Backend service | `/home/deck/.config/singbox-manager/` |
| Backend logs | `journalctl -u singbox-manager -f` |
| sing-box logs | `journalctl -u sing-box -f` |
| Systemd services | `/etc/systemd/system/` |
| Polkit rules | `/usr/share/polkit-1/rules.d/` |

---

## Installation Commands

### Build Plugin
```bash
npm install
npm run build
```

### Install on Steam Deck
```bash
./scripts/install.sh
```

### Install sing-box
```bash
./scripts/install-singbox.sh
```

### Manual Service Control
```bash
# Backend service
sudo systemctl start singbox-manager
sudo systemctl stop singbox-manager
sudo systemctl status singbox-manager

# sing-box service
sudo systemctl start sing-box
sudo systemctl stop sing-box
sudo systemctl status sing-box
```

---

## Verification Checklist

| Item | Status |
|------|--------|
| Plugin loads in Decky Loader | ✅ |
| Backend service starts | ✅ |
| Service status displayed | ✅ |
| Start/Stop/Restart controls work | ✅ |
| Config download from URL | ✅ |
| Node list parsing | ✅ |
| Node selection | ✅ |
| systemd integration | ✅ |
| Polkit authorization | ✅ |
| UI renders on Steam Deck | ✅ |

---

## Dependencies

### Frontend (npm)
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `@decky/api` ^1.0.0
- `typescript` ^5.3.3
- `webpack` ^5.89.0
- `ts-loader` ^9.5.1

### Backend (Python)
- `fastapi` >= 0.104.0
- `uvicorn` >= 0.24.0
- `pydantic` >= 2.0.0

### System
- sing-box binary
- Python 3.8+
- Node.js 18+
- systemd
- polkit

---

## Security Considerations

1. **Backend listens on localhost only** - No external network exposure
2. **CORS enabled for plugin** - Required for local communication
3. **Polkit rules restrict access** - Only `deck` user can control services
4. **sing-box runs as unprivileged user** - `User=deck` in systemd service
5. **Security hardening in sing-box service**:
   - `NoNewPrivileges=true`
   - `ProtectSystem=strict`
   - `ProtectHome=read-only`
   - `PrivateTmp=true`

---

## Troubleshooting Commands

```bash
# Check backend status
systemctl status singbox-manager

# View backend logs
journalctl -u singbox-manager -f

# Check sing-box status
systemctl status sing-box

# View sing-box logs
journalctl -u sing-box -f

# Test backend API
curl http://localhost:5555/health
curl http://localhost:5555/status

# Validate sing-box config
sing-box check -c /home/deck/.config/sing-box/config.json

# Restart all services
sudo systemctl restart singbox-manager sing-box
```

---

## Future Enhancements (Not Implemented)

- [ ] Profile management (multiple configurations)
- [ ] Subscription URL auto-update
- [ ] Log viewer in UI
- [ ] Connection statistics display
- [ ] Custom routing rules editor
- [ ] Clash API integration for real-time stats
- [ ] Backup/restore configuration
- [ ] QR code import for mobile configs

---

## References

- [Decky Loader Documentation](https://github.com/SteamDeckHomebrew/decky-loader)
- [Decky Plugin Template](https://github.com/SteamDeckHomebrew/decky-plugin-template)
- [sing-box Documentation](https://sing-box.sagernet.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [systemd Resource](https://www.freedesktop.org/wiki/Software/systemd/)

---

## License

MIT License

---

*Document generated from implementation completed on 2026-02-27*
