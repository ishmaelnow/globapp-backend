# Revert to Stable Version

Run these commands on your Droplet to restore the working version:

```bash
cd ~/globapp-backend

# Checkout the stable tag
git fetch origin --tags
git checkout v1.0-stable

# Restart backend to ensure it's using the stable code
sudo systemctl restart globapp-api

# Check backend is running
sudo systemctl status globapp-api

# Test fare calculation
curl -X POST https://rider.globapp.app/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{
    "pickup": "201 main street dallas texas 75231",
    "dropoff": "2801 denton tap road lewisville texas 75067",
    "service_type": "economy"
  }'
```

This should restore the working fare calculation. After reverting, we can debug why the geocoding stopped working.



