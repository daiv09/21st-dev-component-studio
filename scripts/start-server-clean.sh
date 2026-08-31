#!/bin/bash
# Clean server restart script
# Kills old Next.js dev processes, removes lock file, starts fresh

echo "Cleaning up old server processes..."
for pid in $(ps -o pid= -C node 2>/dev/null | tr -d ' ' | head -5); do
  kill -9 $pid 2>/dev/null || true
done

echo "Removing .next/dev/lock..."
rm -f .next/dev/lock

echo "Starting fresh Next.js server..."
npm run dev > /tmp/next-server.log 2>&1 &
echo "Server started with PID: $!"
sleep 5
echo "Server log (last 5 lines):"
tail -5 /tmp/next-server.log
