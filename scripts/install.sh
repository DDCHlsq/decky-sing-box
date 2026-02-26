#!/bin/bash
# Sing-Box Manager - Installation Script for Steam Deck
# Run this script on your Steam Deck to install the plugin and backend

set -e

echo "========================================"
echo "  Sing-Box Manager Installation Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Constants
PLUGIN_NAME="singbox-manager"
PLUGIN_DIR="/home/deck/homebrew/plugins/${PLUGIN_NAME}"
BACKEND_DIR="/home/deck/.config/singbox-manager"
CONFIG_DIR="/home/deck/.config/sing-box"
SYSTEMD_DIR="/etc/systemd/system"

# Check if running as deck user
if [ "$USER" != "deck" ]; then
    echo -e "${RED}Error: This script must be run as the 'deck' user${NC}"
    exit 1
fi

# Check if running in Game Mode or Desktop Mode
echo "Checking system..."
if [ -z "$DISPLAY" ]; then
    echo -e "${YELLOW}Warning: Running in terminal. Make sure you're in Desktop Mode.${NC}"
fi

# ============================================
# Prerequisite Checks
# ============================================
echo ""
echo "========================================"
echo "  Prerequisite Checks"
echo "========================================"

# Check for pip
if ! command -v pip &> /dev/null; then
    echo -e "${RED}Error: pip not found${NC}"
    echo "Please install pip first: python3 -m ensurepip --upgrade"
    exit 1
fi
echo -e "${GREEN}✓ pip found${NC}"

# Check Python version (require 3.8+)
PYTHON_VERSION=$(python3 --version 2>&1 | grep -oP 'Python \K[0-9]+\.[0-9]+')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 8 ]); then
    echo -e "${RED}Error: Python 3.8+ required (found: $PYTHON_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python version: $PYTHON_VERSION${NC}"

# Check for curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl not found${NC}"
    echo "Please install curl: sudo pacman -S curl"
    exit 1
fi
echo -e "${GREEN}✓ curl found${NC}"

# Check for systemctl
if ! command -v systemctl &> /dev/null; then
    echo -e "${RED}Error: systemctl not found${NC}"
    echo "This script must be run on a system with systemd"
    exit 1
fi
echo -e "${GREEN}✓ systemctl found${NC}"

# Check sing-box installation status
echo ""
echo "Checking sing-box installation..."
if command -v sing-box &> /dev/null; then
    SINGBOX_VERSION=$(sing-box version 2>&1 | head -n1)
    echo -e "${GREEN}✓ sing-box installed: $SINGBOX_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ sing-box not installed${NC}"
    echo "You will need to install sing-box separately after this installation"
    echo "Run: ./scripts/install-singbox.sh"
fi

# ============================================
# Step 1: Create directories
# ============================================
echo ""
echo "Step 1: Creating directories..."
mkdir -p "$PLUGIN_DIR"
mkdir -p "$BACKEND_DIR"
mkdir -p "$BACKEND_DIR/scripts"
mkdir -p "$CONFIG_DIR"
echo -e "${GREEN}✓ Directories created${NC}"

# ============================================
# Step 2: Install plugin files
# ============================================
echo ""
echo "Step 2: Installing plugin files..."
if [ -d "dist" ]; then
    cp -r dist/* "$PLUGIN_DIR/"
    echo -e "${GREEN}✓ Plugin files copied${NC}"
else
    echo -e "${YELLOW}⚠ dist/ directory not found. Build the plugin first.${NC}"
    echo "Run: npm install && npm run build"
fi

# ============================================
# Step 3: Install backend
# ============================================
echo ""
echo "Step 3: Installing backend service..."

# Copy backend files
cp backend/main.py "$BACKEND_DIR/"

# Create requirements.txt
cat > "$BACKEND_DIR/requirements.txt" << 'EOF'
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.0.0
EOF

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r "$BACKEND_DIR/requirements.txt" --user --quiet
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# ============================================
# Step 4: Create control script
# ============================================
echo ""
echo "Step 4: Creating control script..."
cat > "$BACKEND_DIR/scripts/singbox-control.sh" << 'EOF'
#!/bin/bash
# Sing-Box Control Script

ACTION=$1

case $ACTION in
    start)
        sudo systemctl start sing-box
        echo "Sing-Box service started"
        ;;
    stop)
        sudo systemctl stop sing-box
        echo "Sing-Box service stopped"
        ;;
    restart)
        sudo systemctl restart sing-box
        echo "Sing-Box service restarted"
        ;;
    status)
        sudo systemctl status sing-box --no-pager
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
EOF
chmod +x "$BACKEND_DIR/scripts/singbox-control.sh"
echo -e "${GREEN}✓ Control script created${NC}"

# ============================================
# Step 5: Install systemd services
# ============================================
echo ""
echo "Step 5: Installing systemd services..."

# Create sing-box service file (if not exists)
if [ ! -f "${SYSTEMD_DIR}/sing-box.service" ]; then
    sudo cp systemd/sing-box.service "${SYSTEMD_DIR}/"
    echo -e "${GREEN}✓ sing-box.service installed${NC}"
else
    echo -e "${YELLOW}! sing-box.service already exists, skipping${NC}"
fi

# Create backend service file
sudo cp systemd/singbox-manager.service "${SYSTEMD_DIR}/"
sudo systemctl daemon-reload
echo -e "${GREEN}✓ Systemd services installed${NC}"

# ============================================
# Step 6: Install polkit rules
# ============================================
echo ""
echo "Step 6: Installing polkit rules..."
sudo cp systemd/50-singbox-manager.polkit /usr/share/polkit-1/rules.d/
echo -e "${GREEN}✓ Polkit rules installed${NC}"

# ============================================
# Step 7: Enable and start services
# ============================================
echo ""
echo "Step 7: Enabling and starting services..."

# Enable sing-box service (but don't start yet - no config yet)
sudo systemctl enable sing-box.service

# Enable and start backend service
sudo systemctl enable singbox-manager.service
sudo systemctl start singbox-manager.service
echo -e "${GREEN}✓ Services enabled and started${NC}"

# ============================================
# Step 8: Verify installation
# ============================================
echo ""
echo "Step 8: Verifying installation..."

# Check backend service
if systemctl is-active --quiet singbox-manager; then
    echo -e "${GREEN}✓ Backend service is running${NC}"
else
    echo -e "${RED}✗ Backend service is not running${NC}"
    echo "Try: sudo systemctl start singbox-manager"
fi

# Check plugin directory
if [ -f "${PLUGIN_DIR}/index.js" ]; then
    echo -e "${GREEN}✓ Plugin installed${NC}"
else
    echo -e "${RED}✗ Plugin not found - build first with 'npm run build'${NC}"
fi

# Test backend API
echo ""
echo "Testing backend API..."
sleep 2  # Wait for backend to be ready
if curl -s http://localhost:5555/health | grep -q '"status"'; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend API not responding yet${NC}"
    echo "Check logs: journalctl -u singbox-manager -f"
fi

# ============================================
# Final Summary
# ============================================
echo ""
echo "========================================"
echo -e "${GREEN}  Installation Complete!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Restart Steam UI or reload Decky Loader"
echo "2. Find 'Sing-Box Manager' in the Quick Access menu"
echo "3. Download a sing-box configuration using the plugin"
echo "4. Select a node and start the service"
echo ""

# Show sing-box installation status
if ! command -v sing-box &> /dev/null; then
    echo -e "${YELLOW}⚠ IMPORTANT: sing-box is not installed!${NC}"
    echo ""
    echo "Install sing-box now:"
    echo "  yay -S sing-box           # Using AUR"
    echo "  OR"
    echo "  ./scripts/install-singbox.sh  # Use the helper script"
    echo "  OR"
    echo "  Download from: https://github.com/SagerNet/sing-box/releases"
    echo ""
fi

echo "Useful commands:"
echo "  Backend API: http://localhost:5555"
echo "  Backend logs: journalctl -u singbox-manager -f"
echo "  sing-box logs: journalctl -u sing-box -f"
echo ""
