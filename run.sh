#!/bin/bash
# ============================================
# SEN Frontend - Docker Run Script
# ============================================

DOCKER_DEV="Docker/Dev/docker-compose.yml"
DOCKER_PROD="Docker/Production/docker-compose.yml"

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
    echo "  [2] Start Dev      (docker-compose up)"
    echo "  [3] Start Prod     (docker-compose up -d)"
    echo "  [4] View Logs"
    echo "  [5] Stop All       (docker-compose down)"
    echo "  [6] Exit"
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
            docker-compose -f $DOCKER_DEV build
            echo ""
            echo "[Docker] Building production image..."
            docker-compose -f $DOCKER_PROD build
            echo ""
            echo "[OK] All images built successfully"
            ;;
        dev)
            echo "[Info] Browser will open in 5 seconds..."
            # Start browser opener in background, then run docker
            (sleep 5 && cmd.exe /c start "" "http://localhost:3001") &
            BROWSER_PID=$!
            docker-compose -f $DOCKER_DEV up
            kill $BROWSER_PID 2>/dev/null
            ;;
        prod)
            docker-compose -f $DOCKER_PROD up -d
            echo ""
            echo "[OK] Production server running at http://localhost"
            open_browser "http://localhost"
            ;;
        logs)
            # Check for any sen-frontend containers
            CONTAINERS=$(docker ps --filter "name=sen-frontend" --format "{{.Names}}" 2>/dev/null)
            
            if [ -n "$CONTAINERS" ]; then
                echo "[Info] Found running containers: $CONTAINERS"
                echo ""
                docker logs -f $(echo $CONTAINERS | head -1)
            else
                echo "[Info] No running containers found. Start a server first."
            fi
            ;;
        down)
            docker-compose -f $DOCKER_DEV down 2>/dev/null
            docker-compose -f $DOCKER_PROD down 2>/dev/null
            echo "[OK] All containers stopped"
            ;;
    esac
}

# If argument provided
if [ $# -gt 0 ]; then
    case $1 in
        build|dev|prod|logs|down)
            start_docker $1
            exit 0
            ;;
        help)
            echo ""
            echo "Usage: bash run.sh [mode]"
            echo ""
            echo "Available modes:"
            echo "  build  - Build Docker images (first time / rebuild)"
            echo "  dev    - Start development server (Vite hot-reload)"
            echo "  prod   - Start production server (Nginx)"
            echo "  logs   - View container logs"
            echo "  down   - Stop all containers"
            echo ""
            echo "First time setup:"
            echo "  bash run.sh build"
            echo "  bash run.sh dev"
            echo ""
            exit 0
            ;;
        *)
            echo "[Error] Invalid mode: $1"
            echo "Run 'bash run.sh help' for usage"
            exit 1
            ;;
    esac
fi

# Interactive menu
while true; do
    show_menu
    read -p "Select [1-6]: " choice
    
    case $choice in
        1) start_docker "build" ;;
        2) start_docker "dev"; break ;;
        3) start_docker "prod"; break ;;
        4) start_docker "logs" ;;
        5) start_docker "down" ;;
        6) 
            echo ""
            echo "Goodbye!"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            echo "[Error] Invalid choice!"
            sleep 1
            ;;
    esac
done
