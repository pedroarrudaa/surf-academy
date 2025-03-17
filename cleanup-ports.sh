#!/bin/bash

# Script to kill processes running on common Next.js development ports
# Permissions: chmod +x cleanup-ports.sh

echo "Cleaning up Next.js ports..."

# Array of ports to check
PORTS=(3000 3001 3002 3003)

for PORT in "${PORTS[@]}"; do
  # Check if any process is using the port
  PID=$(lsof -t -i:$PORT 2>/dev/null)
  
  if [ -n "$PID" ]; then
    echo "Found process $PID using port $PORT. Killing it..."
    kill -9 $PID
    echo "Process on port $PORT terminated."
  else
    echo "No process found using port $PORT."
  fi
done

echo "Port cleanup complete. You can now start your Next.js application." 