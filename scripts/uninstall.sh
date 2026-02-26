#!/bin/bash
# Sing-Box Manager - Uninstallation Script

set -e

echo "========================================"
echo "  Sing-Box Manager Uninstallation"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Confirm uninstall
read -p "Are you sure you want to uninstall Sing-Box Manager? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Uninstallation cancelled"
    exit 0
fi

PLUGIN_NAME="singbox-manager"
PLUGIN_DIR="/home/deck/homebrew/plugins/${PLUGIN_NAME}"
BACKEND_DIR="/home/deck/.config/singbox-manager"
CONFIG_DIR="/home/deck/.config/sing-box"

# Stop services
echo "Stopping services..."
sudo systemctl stop singbox-manager.service 2>/dev/null || true
sudo systemctl disable singbox-manager.service 2>/dev/null || true
echo -e "${GREEN}✓ Backend service stopped${NC}"

# Remove systemd files
echo "Removing systemd files..."
sudo rm -f /etc/systemd/system/singbox-manager.service
sudo rm -f /etc/systemd/system/sing-box.service
sudo systemctl daemon-reload
echo -e "${GREEN}✓ Systemd files removed${NC}"

# Remove polkit rules
echo "Removing polkit rules..."
sudo rm -f /usr/share/polkit-1/rules.d/50-singbox-manager.polkit
echo -e "${GREEN}✓ Polkit rules removed${NC}"

# Remove plugin
echo "Removing plugin..."
rm -rf "$PLUGIN_DIR"
echo -e "${GREEN}✓ Plugin removed${NC}"

# Remove backend (keep config)
echo "Removing backend..."
rm -rf "$BACKEND_DIR"
echo -e "${GREEN}✓ Backend removed${NC}"

# Ask about config
echo ""
read -p "Keep configuration files in $CONFIG_DIR? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}✓ Configuration preserved${NC}"
else
    rm -rf "$CONFIG_DIR"
    echo -e "${GREEN}✓ Configuration removed${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}  Uninstallation Complete${NC}"
echo "========================================"
