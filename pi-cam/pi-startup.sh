#!/bin/bash

# Startup script, setup in /etc/rc.local
# Script is located in /home/pi/app/pi-startup.sh

while true
do
    # Setup env
    source /home/pi/app/env.sh

	# Start supervisor
    node /home/pi/app/supervisor.js

    echo "--- SUPPERVISOR STOPPED, RESTARTING ---"
	sleep 1
done