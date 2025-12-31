#!/bin/bash
# Quick Stripe Fix - Run on Droplet

cd ~/globapp-backend/rider-app

echo "=== Checking Stripe Configuration ==="

# 1. Check .env.production
echo ""
echo "1. .env.production file:"
if [ -f .env.production ]; then
    cat .env.production | grep STRIPE || echo "  ❌ STRIPE key NOT found"
else
    echo "  ❌ .env.production file NOT found"
fi

# 2. Check if key is in built JS
echo ""
echo "2. Checking if Stripe key is in built JavaScript:"
if grep -q "pk_test\|pk_live" dist/assets/*.js 2>/dev/null; then
    echo "  ✅ Stripe key found in build"
else
    echo "  ❌ Stripe key NOT in build - need to rebuild"
fi

# 3. Test backend payment intent
echo ""
echo "3. Testing backend payment intent creation:"
echo "   (This will fail if no ride exists, but shows if Stripe backend works)"
curl -s -X POST https://rider.globapp.app/api/v1/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "X-API-Key: yesican" \
  -d '{"ride_id":"test-123","provider":"stripe"}' | head -5

echo ""
echo "=== Next Steps ==="
echo "If Stripe key is missing from build:"
echo "  1. Make sure .env.production has VITE_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "  2. Run: npm run build"
echo "  3. Run: sudo cp -r dist/* /var/www/globapp/rider/"
echo ""
echo "Then test in browser and check console (F12) for debug messages"



