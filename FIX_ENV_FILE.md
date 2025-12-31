# Fix Environment File Location

## The Real Location

**Environment variables are in:** `/etc/globapp-api.env`

## Fix Commands

**On your Droplet:**

```bash
# 1. Check current API key setting
sudo cat /etc/globapp-api.env | grep GLOBAPP_PUBLIC_API_KEY

# 2. Comment out or remove the API key line
sudo sed -i 's/^GLOBAPP_PUBLIC_API_KEY=/#GLOBAPP_PUBLIC_API_KEY=/' /etc/globapp-api.env

# 3. Verify it's commented
sudo cat /etc/globapp-api.env | grep GLOBAPP_PUBLIC_API_KEY

# 4. Restart backend
sudo systemctl restart globapp-api

# 5. Wait a few seconds for startup
sleep 3

# 6. Check backend is running
sudo systemctl status globapp-api

# 7. Test API
curl https://rider.globapp.app/api/v1/health

# 8. Test POST (should work without API key now)
curl -X POST https://rider.globapp.app/api/v1/rides \
  -H "Content-Type: application/json" \
  -d '{"rider_name":"Test","rider_phone":"123","pickup":"123 Main St","dropoff":"456 Oak Ave","service_type":"economy"}'
```

## If Backend Still Shows 502

**Check backend logs:**

```bash
# Check recent logs
sudo journalctl -u globapp-api -n 30 --no-pager

# Check if backend is listening
sudo ss -tlnp | grep 8000
```



