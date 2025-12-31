# Test Payment Records Functionality
# Run this script to test that payment records are being saved to the database

Write-Host "=== Testing Payment Records ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create a test ride
Write-Host "Step 1: Creating test ride..." -ForegroundColor Yellow
$rideBody = @{
    rider_name = "Test Rider"
    rider_phone = "4155551234"
    pickup = "123 Main St, San Francisco, CA"
    dropoff = "456 Market St, San Francisco, CA"
    service_type = "economy"
} | ConvertTo-Json

try {
    $rideResponse = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/rides" `
        -Method POST `
        -ContentType "application/json" `
        -Body $rideBody
    
    # Debug: Show full response
    Write-Host "   Full response: $($rideResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    
    # Extract ride ID (handle different response formats)
    $rideId = $rideResponse.id
    if (-not $rideId) {
        $rideId = $rideResponse.ride_id
    }
    
    if (-not $rideId) {
        Write-Host "❌ Could not extract ride ID from response" -ForegroundColor Red
        Write-Host "   Response: $($rideResponse | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Ride created! ID: $rideId" -ForegroundColor Green
    Write-Host "   Price: `$$($rideResponse.estimated_price_usd)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create ride: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error details: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Create cash payment intent
Write-Host "Step 2: Creating cash payment intent..." -ForegroundColor Yellow
$cashPaymentBody = @{
    ride_id = $rideId
    provider = "cash"
} | ConvertTo-Json

try {
    $cashPaymentResponse = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/payment/create-intent" `
        -Method POST `
        -ContentType "application/json" `
        -Body $cashPaymentBody
    
    Write-Host "✅ Cash payment intent created!" -ForegroundColor Green
    Write-Host "   Payment ID: $($cashPaymentResponse.payment_id)" -ForegroundColor Gray
    Write-Host "   Status: $($cashPaymentResponse.status)" -ForegroundColor Gray
    Write-Host "   Amount: `$$($cashPaymentResponse.amount_usd)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create cash payment: $_" -ForegroundColor Red
}

# Step 3: Create Stripe payment intent
Write-Host "Step 3: Creating Stripe payment intent..." -ForegroundColor Yellow
$stripePaymentBody = @{
    ride_id = $rideId
    provider = "stripe"
} | ConvertTo-Json

try {
    $stripePaymentResponse = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/payment/create-intent" `
        -Method POST `
        -ContentType "application/json" `
        -Body $stripePaymentBody
    
    Write-Host "✅ Stripe payment intent created!" -ForegroundColor Green
    Write-Host "   Payment ID: $($stripePaymentResponse.payment_id)" -ForegroundColor Gray
    Write-Host "   Status: $($stripePaymentResponse.status)" -ForegroundColor Gray
    Write-Host "   Amount: `$$($stripePaymentResponse.amount_usd)" -ForegroundColor Gray
    Write-Host "   Stripe Intent ID: $($stripePaymentResponse.stripe_payment_intent_id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create Stripe payment: $_" -ForegroundColor Red
}

# Step 4: Instructions for database check
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To verify records in the database, SSH into your Droplet and run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ssh ishmael@157.245.231.224" -ForegroundColor White
Write-Host ""
Write-Host "Then run these SQL queries:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# View all recent payments:" -ForegroundColor Gray
Write-Host '  psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "SELECT id, ride_id, provider, status, amount_cents/100.0 as amount_usd, created_at_utc FROM payments ORDER BY created_at_utc DESC LIMIT 5;"' -ForegroundColor White
Write-Host ""
Write-Host "# View payment for this specific ride:" -ForegroundColor Gray
Write-Host "  psql `"postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db`" -c `"SELECT * FROM payments WHERE ride_id = '$rideId';`"" -ForegroundColor White
Write-Host ""
Write-Host "# View payment with ride details:" -ForegroundColor Gray
Write-Host '  psql "postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db" -c "SELECT p.id, p.provider, p.status, p.amount_cents/100.0 as amount_usd, r.rider_name, r.pickup, r.dropoff FROM payments p JOIN rides r ON p.ride_id = r.id WHERE p.ride_id = ''$rideId'';"' -ForegroundColor White
Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
if ($rideId) {
    Write-Host "Ride ID: $rideId" -ForegroundColor Yellow
} else {
    Write-Host "Ride ID: (not available)" -ForegroundColor Yellow
}

if ($cashPaymentResponse -and $cashPaymentResponse.payment_id) {
    Write-Host "Cash Payment ID: $($cashPaymentResponse.payment_id)" -ForegroundColor Yellow
} else {
    Write-Host "Cash Payment ID: (not created)" -ForegroundColor Yellow
}

if ($stripePaymentResponse -and $stripePaymentResponse.payment_id) {
    Write-Host "Stripe Payment ID: $($stripePaymentResponse.payment_id)" -ForegroundColor Yellow
} else {
    Write-Host "Stripe Payment ID: (not created)" -ForegroundColor Yellow
}

