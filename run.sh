#!/bin/bash
set -e
echo "🏔️  INVICTUS — Starting..."
export PYTHONPATH=/home/user/.local/lib/python3.11/site-packages:/usr/local/lib/python3.11/dist-packages:$PYTHONPATH
# kill old
pkill -f "uvicorn app.main:app" || true
pkill -f "vite.*5173" || true
sleep 2
cd /home/user/hack-and-hills-/backend
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/invictus-backend.log 2>&1 &
echo "Backend starting on :8000..."
sleep 4
curl -s http://localhost:8000/api/health && echo " ✅ Backend OK" || echo " ⚠️  Backend not ready"

cd /home/user/hack-and-hills-/frontend
nohup npm run dev > /tmp/invictus-frontend.log 2>&1 &
echo "Frontend starting on :5173..."
sleep 3
echo "✅ Done — Frontend http://localhost:5173 | Backend http://localhost:8000/api/health | Docs http://localhost:8000/api/docs"
