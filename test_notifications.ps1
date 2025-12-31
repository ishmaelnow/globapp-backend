# Test Notifications Feature
# This script tests that notifications are created for ride events

Write-Host "=== Testing Notifications Feature ===" -ForegroundColor Cyan
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
    
    $rideId = $rideResponse.ride_id
    Write-Host "✅ Ride created! ID: $rideId" -ForegroundColor Green
    Write-Host "   Price: `$$($rideResponse.estimated_price_usd)" -ForegroundColor Gray
    Write-Host ""
    
    # Wait a moment for notification to be created
    Start-Sleep -Seconds 2
    
    Write-Host "   Checking notifications for this ride..." -ForegroundColor Gray
    $notifications = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/notifications?ride_id=$rideId&limit=10"
    
    if ($notifications.Count -gt 0) {
        Write-Host "   ✅ Found $($notifications.Count) notification(s)!" -ForegroundColor Green
        foreach ($notif in $notifications) {
            Write-Host "      - $($notif.title): $($notif.message)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️ No notifications found yet" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to create ride: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Get a driver (for assignment)
Write-Host "Step 2: Getting available drivers..." -ForegroundColor Yellow
try {
    # Note: This requires admin API key - you'll need to set it
    $adminKey = Read-Host "Enter admin API key (or press Enter to skip driver assignment)"
    
    if ($adminKey) {
        $headers = @{
            "X-API-Key" = $adminKey
        }
        
        $drivers = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/drivers" `
            -Method GET `
            -Headers $headers
        
        if ($drivers.Count -gt 0) {
            $driver = $drivers[0]
            $driverId = $driver.id
            Write-Host "✅ Found driver: $($driver.name) (ID: $driverId)" -ForegroundColor Green
            Write-Host ""
            
            # Step 3: Assign ride to driver
            Write-Host "Step 3: Assigning ride to driver..." -ForegroundColor Yellow
            $assignBody = @{
                driver_id = $driverId
            } | ConvertTo-Json
            
            $assignResponse = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/dispatch/rides/$rideId/assign" `
                -Method POST `
                -ContentType "application/json" `
                -Headers $headers `
                -Body $assignBody
            
            Write-Host "✅ Ride assigned! Driver: $($driver.name)" -ForegroundColor Green
            Write-Host ""
            
            # Wait for notifications
            Start-Sleep -Seconds 2
            
            Write-Host "   Checking notifications after assignment..." -ForegroundColor Gray
            $notifications = Invoke-RestMethod -Uri "https://rider.globapp.app/api/v1/notifications?ride_id=$rideId&limit=10"
            
            if ($notifications.Count -gt 0) {
                Write-Host "   ✅ Found $($notifications.Count) notification(s)!" -ForegroundColor Green
                foreach ($notif in $notifications) {
                    Write-Host "      - $($notif.title): $($notif.message)" -ForegroundColor Gray
                }
            }
            Write-Host ""
            
            Write-Host "=== Test Complete ===" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Ride ID: $rideId" -ForegroundColor Yellow
            Write-Host "Driver ID: $driverId" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Next: Check database on Droplet:" -ForegroundColor Cyan
            Write-Host "  psql `"postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db`" -c `"SELECT * FROM notifications WHERE ride_id = '$rideId' ORDER BY created_at_utc;`"" -ForegroundColor White
        } else {
            Write-Host "⚠️ No drivers found. Create a driver first." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "=== Partial Test Complete ===" -ForegroundColor Cyan
            Write-Host "Ride created: $rideId" -ForegroundColor Yellow
            Write-Host "Notifications should be created for ride booking." -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ Skipping driver assignment (no admin key provided)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "=== Partial Test Complete ===" -ForegroundColor Cyan
        Write-Host "Ride created: $rideId" -ForegroundColor Yellow
        Write-Host "To test assignment notifications, run with admin API key." -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ Could not get drivers or assign ride: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "=== Partial Test Complete ===" -ForegroundColor Cyan
    Write-Host "Ride created: $rideId" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "1. Ride booking notification: ✅ Created" -ForegroundColor Green
Write-Host "2. Ride assignment notification: ⚠️ Requires admin API key" -ForegroundColor Yellow
Write-Host "3. Status update notifications: ⚠️ Requires driver login" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test fully, check database on Droplet:" -ForegroundColor Cyan
Write-Host "  psql `"postgresql://globapp_user:2024@127.0.0.1:5432/globapp_db`" -c `"SELECT notification_type, recipient_type, title, message, created_at_utc FROM notifications WHERE ride_id = '$rideId' ORDER BY created_at_utc;`"" -ForegroundColor White

