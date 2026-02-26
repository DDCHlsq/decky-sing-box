#!/bin/bash
# Sing-Box Installation Helper Script

set -e

echo "========================================"
echo "  Sing-Box Installation Helper"
echo "========================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if sing-box is already installed
if command -v sing-box &> /dev/null; then
    echo -e "${GREEN}✓ sing-box is already installed${NC}"
    sing-box version
    exit 0
fi

echo "Installing sing-box..."
echo ""
echo "Choose installation method:"
echo "1. Install from AUR (requires yay)"
echo "2. Download official binary"
echo "3. Cancel"
echo ""
read -p "Select option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Installing from AUR..."
        if command -v yay &> /dev/null; then
            yay -S sing-box
            echo -e "${GREEN}✓ sing-box installed from AUR${NC}"
        else
            echo -e "${RED}Error: yay not found${NC}"
            echo "Install yay first: git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "Downloading official binary..."

        # Get latest release info
        ARCH=$(uname -m)
        case $ARCH in
            x86_64)
                FILENAME="sing-box-1.8.0-linux-amd64"
                ;;
            aarch64)
                FILENAME="sing-box-1.8.0-linux-arm64"
                ;;
            *)
                echo -e "${RED}Unsupported architecture: $ARCH${NC}"
                exit 1
                ;;
        esac

        URL="https://github.com/SagerNet/sing-box/releases/download/v1.8.0/${FILENAME}.tar.gz"

        # Download and extract
        cd /tmp
        curl -L -o sing-box.tar.gz "$URL"
        tar -xzf sing-box.tar.gz

        # Install binary
        sudo mv "${FILENAME}/sing-box" /usr/local/bin/
        sudo chmod +x /usr/local/bin/sing-box

        # Cleanup
        rm -rf "${FILENAME}" sing-box.tar.gz

        echo -e "${GREEN}✓ sing-box binary installed to /usr/local/bin${NC}"
        ;;
    3)
        echo "Cancelled"
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

# Verify installation
echo ""
if command -v sing-box &> /dev/null; then
    echo -e "${GREEN}✓ Installation successful${NC}"
    echo ""
    echo "Version:"
    sing-box version
else
    echo -e "${RED}✗ Installation failed${NC}"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Create configuration file or use the plugin to download one"
echo "2. Start the service: sudo systemctl start sing-box"
echo ""
