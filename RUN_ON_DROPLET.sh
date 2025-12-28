#!/bin/bash
# Commands to run on your Droplet
# Copy and paste these commands one by one, or run the entire script

# Step 1: Backup current config
echo "Creating backup..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Step 2: Replace with new config
echo "Replacing config..."
sudo cp /tmp/nginx_new.conf /etc/nginx/sites-available/default

# Step 3: Test configuration
echo "Testing configuration..."
sudo nginx -t

# Step 4: If test passed, reload nginx
if [ $? -eq 0 ]; then
    echo "Configuration test passed! Reloading nginx..."
    sudo systemctl reload nginx
    echo "Done! Nginx reloaded."
else
    echo "ERROR: Configuration test failed! Not reloading."
    echo "Restore backup with: sudo cp /etc/nginx/sites-available/default.backup /etc/nginx/sites-available/default"
fi




