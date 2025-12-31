# SMS and Email Notification Setup Guide

This guide explains how to add SMS and Email notifications to your GlobApp system.

## Current Status

**✅ Implemented:**
- In-app notifications (database storage + API retrieval)

**🚧 Ready to Add:**
- SMS notifications (Twilio recommended)
- Email notifications (SendGrid, AWS SES, or SMTP)

## Option 1: SMS with Twilio (Recommended)

### Step 1: Sign Up for Twilio

1. Go to https://www.twilio.com/
2. Sign up for a free account (includes $15 credit)
3. Get your credentials:
   - Account SID
   - Auth Token
   - Phone Number (for sending SMS)

### Step 2: Install Twilio SDK

```bash
# On Droplet
cd ~/globapp-backend
source .venv/bin/activate
pip install twilio
```

### Step 3: Add Environment Variables

```bash
# Add to /etc/globapp-api.env
sudo nano /etc/globapp-api.env

# Add these lines:
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

### Step 4: Update notifications.py

Add SMS sending function:

```python
# Add at top of notifications.py
try:
    from twilio.rest import Client
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    Client = None

def send_sms(phone_number: str, message: str) -> bool:
    """Send SMS via Twilio"""
    if not TWILIO_AVAILABLE:
        print("Warning: Twilio not installed")
        return False
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    if not all([account_sid, auth_token, from_number]):
        print("Warning: Twilio credentials not configured")
        return False
    
    try:
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=message,
            from_=from_number,
            to=phone_number
        )
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False
```

### Step 5: Update create_notification() to Send SMS

Modify `create_notification()` to actually send SMS when `channel='sms'`:

```python
def create_notification(...):
    # ... existing code to create database record ...
    
    # If SMS channel, actually send the SMS
    if channel == "sms" and recipient_id:
        # Get phone number from metadata or query database
        phone_number = metadata.get("phone_number")
        if phone_number:
            send_sms(phone_number, message)
            # Update notification status to 'sent'
            # ... update database record ...
```

## Option 2: Email with SendGrid

### Step 1: Sign Up for SendGrid

1. Go to https://sendgrid.com/
2. Sign up (free tier: 100 emails/day)
3. Create API Key
4. Verify sender email

### Step 2: Install SendGrid SDK

```bash
pip install sendgrid
```

### Step 3: Add Environment Variables

```bash
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@globapp.app
```

### Step 4: Add Email Sending Function

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_email: str, subject: str, message: str) -> bool:
    """Send email via SendGrid"""
    api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL")
    
    if not api_key or not from_email:
        return False
    
    try:
        message = Mail(
            from_email=from_email,
            to_emails=to_email,
            subject=subject,
            plain_text_content=message
        )
        sg = SendGridAPIClient(api_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
```

## Option 3: Simple SMTP (No Third-Party Service)

For basic email without external services:

```python
import smtplib
from email.mime.text import MIMEText

def send_email_smtp(to_email: str, subject: str, message: str) -> bool:
    """Send email via SMTP"""
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)
    
    try:
        msg = MIMEText(message)
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
```

## Implementation Strategy

### Phase 1: In-App Only (Current)
- ✅ Notifications stored in database
- ✅ Retrieved via API
- ✅ Frontend can display them

### Phase 2: Add SMS (Recommended Next)
- Add Twilio integration
- Send SMS for critical events (ride assigned, driver arrived)
- Update notification status to 'sent' after SMS sent

### Phase 3: Add Email
- Add SendGrid/SMTP integration
- Send email for important events (ride completed, receipts)
- Support HTML emails

### Phase 4: User Preferences
- Let users choose notification channels
- Opt-in/opt-out per channel
- Store preferences in database

## Cost Considerations

**Twilio SMS:**
- ~$0.0075 per SMS (US)
- Free tier: $15 credit
- ~2,000 free SMS

**SendGrid Email:**
- Free tier: 100 emails/day
- Paid: $19.95/month for 50,000 emails

**SMTP:**
- Free (if using your own server)
- Gmail: Free but limited

## Recommendation

**Start with:** In-app notifications (already working!)
**Add next:** SMS for critical events (ride assigned, driver arrived)
**Add later:** Email for receipts and summaries

Would you like me to implement Twilio SMS integration now?

