#!/bin/sh
sudo v6.2.0/bin/forever -o httpServer.log -e err.log start httpServer.js
