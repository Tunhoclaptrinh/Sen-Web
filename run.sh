#!/bin/bash
# ============================================
# SEN Frontend - Docker Run Script
# ============================================

DOCKER_DEV="Docker/Dev/docker-compose.yml"
DOCKER_PROD="Docker/Production/docker-compose.yml"
DOCKER_TUNNEL_DEV="Docker/Tunnel/docker-compose.dev.yml"
DOCKER_TUNNEL_PROD="Docker/Tunnel/docker-compose.prod.yml"

# Cleanup background jobs on exit
trap "kill 0 2>/dev/null" EXIT

# Function to open browser (works in WSL)
open_browser() {
    local url=$1
    cmd.exe /c start "" "$url" 2>/dev/null
}

show_menu() {
    echo ""
    echo "=========================================="
    echo "     SEN Frontend - Docker Runner"
    echo "=========================================="
    echo ""
    echo "  Select mode:"
    echo ""
    echo "  [1] Build Images   (First time / Rebuild only)"
    echo "  [2] Start Dev      (Hot-reload :3001)"
    echo "  [3] Start Prod     (docker compose up -d)"
    echo "  [4] View Logs"
    echo "  [5] Stop All       (docker compose down)"
    echo "  [6] Start Tunnel   (Public Access - Auto)"
    echo "  [7] Exit"
    echo ""
}

start_docker() {
    local mode=$1
    
    echo ""
    echo "[Docker] Starting SEN Frontend: $mode"
    echo ""
    
    case $mode in
        build)
            echo "[Docker] Building development image..."
            docker compose -f $DOCKER_DEV build
            echo ""
            echo "[Docker] Building production image..."
            docker compose -f $DOCKER_PROD build
            echo ""
            echo "[OK] All images built successfully"
            ;;
        dev)
            echo "[Docker] Starting Development Server..."
            echo "[Info] Browser will open in 5 seconds..."
            (sleep 5 && cmd.exe /c start "" "http://localhost:3001") &
            BROWSER_PID=$!
            docker compose -f $DOCKER_DEV up
            kill $BROWSER_PID 2>/dev/null
            ;;
        prod)
            docker compose -f $DOCKER_PROD up -d
            echo ""
            echo "[OK] Production server running at http://localhost"
            open_browser "http://localhost"
            ;;
        tunnel)
            # Smart Auto-Detect
            if docker ps --format '{{.Names}}' | grep -q "^sen-frontend-dev$"; then
                echo "[Info] Detected DEV environment."
                echo "[Info] Starting Tunnel for Port 3001..."
                echo "------------------------------------------------"
                docker compose -f $DOCKER_TUNNEL_DEV up
            elif docker ps --format '{{.Names}}' | grep -q "^sen-frontend$"; then
                echo "[Info] Detected PROD environment."
                echo "[Info] Starting Tunnel for Port 80..."
                echo "------------------------------------------------"
                docker compose -f $DOCKER_TUNNEL_PROD up
            else
                echo "[Error] No running frontend found!"
                echo "Please select [2] Start Dev or [3] Start Prod first."
            fi
            ;;
        logs)
            # Check for any sen-frontend containers
            CONTAINERS=$(docker ps --filter "name=sen-frontend" --format "{{.Names}}" 2>/dev/null)
            
            if [ -n "$CONTAINERS" ]; then
                echo "[Info] Found running containers: $CONTAINERS"
                echo ""
                docker logs -f $(echo $CONTAINERS | head -1)
            else
                echo "[Info] No running containers found."
            fi
            ;;
        down)
            echo "[Docker] Stopping all containers..."
            docker compose -f $DOCKER_DEV down 2>/dev/null
            docker compose -f $DOCKER_PROD down 2>/dev/null
            docker compose -f $DOCKER_TUNNEL_DEV down 2>/dev/null
            docker compose -f $DOCKER_TUNNEL_PROD down 2>/dev/null
            echo "[OK] Cleaned up."
            ;;
        *)
            echo "[Error] Unknown command."
            ;;
    esac
}

# CLI Handler
if [ $# -gt 0 ]; then
    start_docker $1
    exit 0
fi

# Interactive Menu
while true; do
    show_menu
    read -p "Select [1-7]: " choice
    
    case $choice in
        1) start_docker "build" ;;
        2) start_docker "dev"; break ;;
        3) start_docker "prod"; break ;;
        4) start_docker "logs" ;;
        5) start_docker "down" ;;
        6) start_docker "tunnel"; break ;;
        7) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid choice." ;;
    esac
    
    if [ "$choice" != "7" ]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
done
