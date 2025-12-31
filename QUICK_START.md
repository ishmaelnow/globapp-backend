# Quick Start Guide

## 🚀 Start Everything in 4 Steps

### 1️⃣ Start Backend
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project
python app.py
```
✅ Backend running on http://localhost:8000

---

### 2️⃣ Start Rider App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\rider-app
npm run dev
```
✅ Opens http://localhost:3001

---

### 3️⃣ Start Driver App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\driver-app
npm run dev
```
✅ Opens http://localhost:3002

---

### 4️⃣ Start Admin App
```powershell
cd C:\Users\koshi\cursor-apps\flask-react-project\admin-app
npm run dev
```
✅ Opens http://localhost:3003

---

## ✅ Verify Everything Works

- [ ] Backend: http://localhost:8000 (check in browser)
- [ ] Rider App: http://localhost:3001 (book a ride)
- [ ] Driver App: http://localhost:3002 (login as driver)
- [ ] Admin App: http://localhost:3003 (view dashboard)

---

## 📁 File Locations

```
flask-react-project/
├── app.py                    ← Backend (start this first)
├── rider-app/                ← Port 3001
│   ├── .env                 ← Has API key: yesican
│   └── npm run dev
├── driver-app/               ← Port 3002
│   ├── .env                 ← No API key needed
│   └── npm run dev
└── admin-app/                ← Port 3003
    ├── .env                 ← Has API key: admincan
    └── npm run dev
```

---

## 🎯 That's It!

All apps are configured and ready. Just start them in order above.




