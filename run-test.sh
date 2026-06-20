#!/bin/bash

# Kill any existing server
killall node 2>/dev/null || true
sleep 1

# Start server and capture output
cd /c/workspaceMZ/trinquat-hub
echo "Starting server..."
node server.cjs < /dev/null > server-test.log 2>&1 &
SERVER_PID=$!
sleep 2

echo "Running test..."
node test-complete-flow.cjs

echo ""
echo "Server logs:"
tail -50 server-test.log

# Cleanup
kill $SERVER_PID 2>/dev/null || true
