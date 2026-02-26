# Sing-Box Manager - Steam Deck Decky Plugin

A comprehensive Decky Loader plugin for managing the sing-box network proxy service on Steam Deck.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> [English](README.md) | [中文](README_zh-CN.md)

## Features

- **Service Control**: Start, stop, and restart the sing-box service
- **Configuration Management**: Download configuration files from any URL
- **Node Selection**: Browse and select proxy nodes from your configuration
- **Real-time Status**: Monitor service status with live updates
- **Quick Access**: Integrated into Steam Deck's Quick Access menu

## Requirements

- Steam Deck with Decky Loader installed
- Python 3.8+ (pre-installed on Steam Deck)
- sing-box binary (installation script provided)
- Node.js 18+ (for building the plugin)

## Installation

### Quick Install

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/singbox-decky-plugin.git
   cd singbox-decky-plugin
   ```

2. Build the plugin:
   ```bash
   npm install
   npm run build
   ```

3. Run the installation script on your Steam Deck:
   ```bash
   ./scripts/install.sh
   ```

4. Install sing-box (if not already installed):
   ```bash
   ./scripts/install-singbox.sh
   ```

### Manual Installation

1. **Install sing-box**:

   From AUR:
   ```bash
   yay -S sing-box
   ```

   Or download the [official binary](https://github.com/SagerNet/sing-box/releases):
   ```bash
   wget https://github.com/SagerNet/sing-box/releases/download/v1.8.0/sing-box-1.8.0-linux-amd64.tar.gz
   tar -xzf sing-box-1.8.0-linux-amd64.tar.gz
   sudo mv sing-box-1.8.0-linux-amd64/sing-box /usr/local/bin/
   sudo chmod +x /usr/local/bin/sing-box
   ```

2. **Copy plugin files**:
   ```bash
   # After building with npm run build
   cp -r dist/* /home/deck/homebrew/plugins/singbox-manager/
   ```

3. **Install backend**:
   ```bash
   mkdir -p /home/deck/.config/singbox-manager
   cp backend/main.py /home/deck/.config/singbox-manager/
   pip install fastapi uvicorn pydantic --user
   ```

4. **Install systemd services**:
   ```bash
   sudo cp systemd/sing-box.service /etc/systemd/system/
   sudo cp systemd/singbox-manager.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable singbox-manager
   sudo systemctl start singbox-manager
   ```

5. **Install polkit rules**:
   ```bash
   sudo cp systemd/50-singbox-manager.polkit /usr/share/polkit-1/rules.d/
   ```

## Usage

1. **Open the plugin**: Press the Steam button → Quick Access → Sing-Box Manager

2. **Download configuration**:
   - Go to the "Config" tab
   - Enter the URL of your sing-box configuration
   - Click "Download Config"

3. **Select a node**:
   - Go to the "Nodes" tab
   - Select your preferred proxy node

4. **Start the service**:
   - Go to the "Status" tab
   - Click "Start Service"

## Project Structure

```
singbox-decky-plugin/
├── src/
│   ├── index.tsx              # Main plugin entry and UI
│   ├── components/
│   │   ├── StatusCard.tsx     # Service status display
│   │   ├── Settings.tsx       # Configuration settings
│   │   └── NodeSelector.tsx   # Node selection UI
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── utils/
│       ├── api.ts             # Backend API client
│       └── decky.ts           # Decky API utilities
├── backend/
│   └── main.py                # FastAPI backend service
├── systemd/
│   ├── sing-box.service       # sing-box systemd service
│   ├── singbox-manager.service # Backend service
│   ├── singbox-manager.desktop # Desktop entry
│   └── 50-singbox-manager.polkit # Polkit rules
├── scripts/
│   ├── install.sh             # Installation script
│   ├── uninstall.sh           # Uninstallation script
│   └── install-singbox.sh     # sing-box installer
├── plugin.json                # Plugin metadata
├── package.json
├── tsconfig.json
└── webpack.config.ts
```

## API Reference

The backend service exposes the following endpoints on `http://localhost:5555`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/status` | GET | Get service status |
| `/start` | POST | Start sing-box service |
| `/stop` | POST | Stop sing-box service |
| `/restart` | POST | Restart sing-box service |
| `/config/fetch` | POST | Download config from URL |
| `/config/nodes` | GET | Get available nodes |
| `/config/select` | POST | Select a proxy node |
| `/config/logs` | GET | Get service logs |
| `/singbox/version` | GET | Get sing-box version |

## Configuration Paths

| File | Path |
|------|------|
| Plugin directory | `/home/deck/homebrew/plugins/singbox-manager/` |
| sing-box config | `/home/deck/.config/sing-box/config.json` |
| Backend service | `/home/deck/.config/singbox-manager/` |
| Backend logs | `journalctl -u singbox-manager -f` |
| sing-box logs | `journalctl -u sing-box -f` |

## Troubleshooting

### Plugin not showing in Quick Access menu

1. Restart Steam UI:
   ```bash
   systemctl restart steam
   ```

2. Check Decky Loader logs:
   ```bash
   journalctl -u decky-loader -f
   ```

### Backend service not running

1. Check service status:
   ```bash
   systemctl status singbox-manager
   ```

2. View logs:
   ```bash
   journalctl -u singbox-manager -f
   ```

3. Restart service:
   ```bash
   sudo systemctl restart singbox-manager
   ```

### sing-box fails to start

1. Verify configuration:
   ```bash
   sing-box check -c /home/deck/.config/sing-box/config.json
   ```

2. View logs:
   ```bash
   journalctl -u sing-box -f
   ```

### Connection refused errors

Make sure the backend service is running:
```bash
sudo systemctl start singbox-manager
```

Test the API:
```bash
curl http://localhost:5555/health
```

## Uninstallation

Run the uninstallation script:
```bash
./scripts/uninstall.sh
```

Or manually:
```bash
# Stop services
sudo systemctl stop singbox-manager sing-box
sudo systemctl disable singbox-manager sing-box

# Remove files
sudo rm -f /etc/systemd/system/singbox-manager.service
sudo rm -f /etc/systemd/system/sing-box.service
sudo rm -rf /home/deck/homebrew/plugins/singbox-manager
sudo rm -rf /home/deck/.config/singbox-manager

# Clean up (optional)
rm -rf /home/deck/.config/sing-box
```

## Development

### Building

```bash
npm install
npm run build
```

### Watch mode

```bash
npm run build:watch
```

### Deploy to remote Steam Deck

Configure SSH access to your Steam Deck, then:
```bash
npm run deploy
```

Or manually:
```bash
scp -r dist/* deck@192.168.1.100:/home/deck/homebrew/plugins/singbox-manager/
```

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader)
- [sing-box](https://github.com/SagerNet/sing-box)
- [FastAPI](https://fastapi.tiangolo.com/)

## Disclaimer

This plugin is for educational purposes only. Use responsibly and comply with all applicable laws and regulations.
