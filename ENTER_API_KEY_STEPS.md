# Exact Steps to Enter API Key in Frontend

## Step-by-Step Instructions

### Step 1: Go to Ride Booking Page

1. Open your browser
2. Go to: `https://globapp.app/rider`
3. You should see the "Book Your Ride" form

### Step 2: Find the API Key Button

1. Look at the **top right** of the form
2. You'll see a button that says **"API Key"** (next to the "Book Your Ride" heading)
3. Click this button

### Step 3: Enter the API Key

1. After clicking "API Key", a new section will appear below the heading
2. You'll see a text field labeled **"Public API Key (Optional)"**
3. Click in the text field
4. Type: `yuuuuun`
5. The field is a password field (shows dots), but that's fine

### Step 4: Save the API Key

**Option A: Auto-save (easiest)**
- Just click outside the text field (onBlur event)
- It will save automatically

**Option B: Manual save**
- Click the **"Save"** button next to the text field

### Step 5: Verify It's Saved

1. You should see a success message: "API key saved"
2. The API key is now stored in your browser's localStorage
3. It will be remembered for future visits

### Step 6: Test It

1. Fill in the ride booking form:
   - Phone Number
   - Pickup Location
   - Destination
   - Service Type
2. Click **"Get Price Estimate"** or **"Book Now"**
3. It should work now without the "Invalid API key" error!

---

## Visual Guide

```
┌─────────────────────────────────────────┐
│ Book Your Ride          [API Key] ← Click here
├─────────────────────────────────────────┤
│                                         │
│ [Public API Key (Optional)]             │
│ ┌─────────────────────────────────┐   │
│ │ yuuuuun                         │ ← Enter here
│ └─────────────────────────────────┘   │
│                    [Save] ← Click to save │
│                                         │
│ Phone Number:                          │
│ ...                                    │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

**If you don't see the "API Key" button:**
- Make sure you're on `/rider` page
- Try refreshing the page (F5)

**If the API key doesn't save:**
- Make sure you clicked "Save" or clicked outside the field
- Check browser console for errors (F12)

**If it still doesn't work:**
- Clear browser cache and try again
- Or check if the API key value is correct: `yuuuuun`

---

## Quick Summary

1. Go to `https://globapp.app/rider`
2. Click **"API Key"** button (top right)
3. Enter: `yuuuuun`
4. Click **"Save"** or click outside the field
5. Try booking a ride!




