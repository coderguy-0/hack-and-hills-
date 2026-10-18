#!/bin/bash
set -e
echo "🏔️  INVICTUS — AI Safety Evaluator"
echo "Starting backend on :8000 and frontend on :5173..."

# ensure DB exists (seed will run)
export PYTHONPATH=/home/user/.local/lib/python3.11/site-packages:$PYTHONPATH
cd /home/user/hack-and-hills-/backend
nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info > /tmp/invictus-backend.log 2>&1 &

cd /home/user/hack-and-hills-/frontend
nohup npm run dev > /tmp/invictus-frontend.log 2>&1 &

sleep 4
echo "✅ Backend: http://localhost:8000/api/health"
curl -s http://localhost:8000/api/health || echo "backend not yet ready"
echo "✅ Frontend: http://localhost:5173"
echo "Docs: http://localhost:8000/api/docs"
