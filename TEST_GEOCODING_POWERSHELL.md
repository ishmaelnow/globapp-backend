# Test Geocoding - PowerShell Commands

## PowerShell-Compatible Commands

### Test Geocoding Endpoint

```powershell
# Test geocoding with a single address
$body = @{
    address = "Times Square, New York, NY"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/test/geocode" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "X-API-Key"="yesican"} `
    -Body $body
```

### Test Fare Estimate Endpoint

```powershell
# Test fare estimate with real addresses
$body = @{
    pickup = "123 Main St, San Francisco, CA"
    dropoff = "456 Market St, San Francisco, CA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/fare/estimate" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "X-API-Key"="yesican"} `
    -Body $body
```

### Alternative: Using curl.exe (if available)

```powershell
# Use curl.exe explicitly (not the PowerShell alias)
curl.exe -X POST http://localhost:8000/api/v1/test/geocode `
    -H "Content-Type: application/json" `
    -H "X-API-Key: yesican" `
    -d '{\"address\": \"Times Square, New York, NY\"}'
```

---

## For Your Droplet (Ubuntu/Linux)

These commands work on your droplet:

```bash
# Test geocoding
curl -X POST http://localhost:8000/api/v1/test/geocode \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{"address": "Times Square, New York, NY"}'

# Test fare estimate
curl -X POST http://localhost:8000/api/v1/fare/estimate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{"pickup": "123 Main St, San Francisco, CA", "dropoff": "456 Market St, San Francisco, CA"}'
```





