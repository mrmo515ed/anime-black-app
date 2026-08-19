#!/bin/bash
while true; do
  if ! ps aux | grep -v grep | grep -q "npm run lint"; then
    break
  fi
  sleep 2
done
