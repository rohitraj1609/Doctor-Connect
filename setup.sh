#!/bin/bash
# DocConnect - Setup & Dependency Checker
# Run: bash setup.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
MISSING=0

echo "=================================="
echo "  DocConnect - Setup Checker"
echo "=================================="
echo ""

# Check Node.js
if command -v node &>/dev/null; then
  echo -e "${GREEN}✓${NC} Node.js $(node -v)"
else
  echo -e "${RED}✗ Node.js not found${NC}"
  echo "  Install: https://nodejs.org/ or run: brew install node"
  MISSING=1
fi

# Check npm
if command -v npm &>/dev/null; then
  echo -e "${GREEN}✓${NC} npm $(npm -v)"
else
  echo -e "${RED}✗ npm not found${NC}"
  echo "  Comes with Node.js installation"
  MISSING=1
fi

# Check MongoDB
if command -v mongosh &>/dev/null; then
  echo -e "${GREEN}✓${NC} mongosh $(mongosh --version 2>/dev/null)"
  # Check if MongoDB is running
  if mongosh --quiet --eval "db.runCommand({ping:1})" mongodb://localhost:27017 &>/dev/null; then
    echo -e "${GREEN}✓${NC} MongoDB running on localhost:27017"
  else
    echo -e "${RED}✗ MongoDB not running${NC}"
    echo "  Start: brew services start mongodb-community"
    echo "  Or: mongod --dbpath /data/db"
    MISSING=1
  fi
else
  echo -e "${RED}✗ MongoDB not found${NC}"
  echo "  Install: brew tap mongodb/brew && brew install mongodb-community"
  MISSING=1
fi

# Check Python3
if command -v python3 &>/dev/null; then
  echo -e "${GREEN}✓${NC} Python $(python3 --version 2>&1 | cut -d' ' -f2)"
else
  echo -e "${RED}✗ Python3 not found${NC}"
  echo "  Install: brew install python3"
  MISSING=1
fi

# Check Python packages
echo ""
echo "Python packages:"
for pkg in whisper flask flask_cors; do
  if python3 -c "import $pkg" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $pkg"
  else
    echo -e "  ${RED}✗ $pkg not found${NC}"
    if [ "$pkg" = "whisper" ]; then
      echo "    Install: pip3 install openai-whisper"
    elif [ "$pkg" = "flask_cors" ]; then
      echo "    Install: pip3 install flask-cors"
    else
      echo "    Install: pip3 install $pkg"
    fi
    MISSING=1
  fi
done

# Check ngrok (optional)
echo ""
echo "Optional:"
if command -v ngrok &>/dev/null; then
  echo -e "${GREEN}✓${NC} ngrok $(ngrok version 2>&1 | cut -d' ' -f3)"
else
  echo -e "${YELLOW}○${NC} ngrok not found (needed for sharing)"
  echo "  Install: brew install ngrok/ngrok/ngrok"
fi

# Check ffmpeg (needed by whisper)
if command -v ffmpeg &>/dev/null; then
  echo -e "${GREEN}✓${NC} ffmpeg installed"
else
  echo -e "${RED}✗ ffmpeg not found (needed for voice)${NC}"
  echo "  Install: brew install ffmpeg"
  MISSING=1
fi

echo ""
echo "=================================="

if [ $MISSING -eq 1 ]; then
  echo -e "${RED}Some dependencies are missing!${NC}"
  echo ""
  echo "Quick install all missing (macOS):"
  echo "  brew install node mongodb-community python3 ffmpeg"
  echo "  pip3 install openai-whisper flask flask-cors"
  echo ""
  echo "After installing, run this again: bash setup.sh"
  exit 1
fi

# Install npm packages
echo -e "${GREEN}All system dependencies found!${NC}"
echo ""
echo "Installing npm packages..."
npm install && cd server && npm install && cd ../client && npm install && cd ..
echo ""
echo -e "${GREEN}=================================="
echo "  Setup complete!"
echo "=================================="
echo ""
echo "  Local dev:  npm run dev"
echo "  Share:      npm run share"
echo -e "==================================${NC}"
