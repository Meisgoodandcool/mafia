# The Mafia — DonutSMP Hub

## Project Structure

```
mafia-hub/
├── pages/
│   ├── index.js         ← Password login gate
│   ├── hicom.js         ← HICOM / Leader portal
│   ├── staff.js         ← Staff portal
│   ├── _app.js
│   └── api/
│       ├── auth.js      ← Password checking
│       ├── staff/
│       │   └── index.js ← Staff CRUD
│       ├── infractions.js
│       ├── tasks.js
│       └── reports.js
├── components/
│   └── Layout.js
├── lib/
│   └── db.js            ← Vercel KV helpers
├── styles/
│   └── globals.css
└── package.json
```

---

## Deployment Steps

### 1. Create a GitHub repo
- Go to github.com → New Repository
- Name it `mafia-hub`
- Upload all these files into it

### 2. Deploy on Vercel
- Go to vercel.com → New Project
- Import your GitHub repo
- Framework: **Next.js** (auto-detected)
- Click Deploy

### 3. Add Vercel KV (the database)
- In your Vercel project dashboard, go to **Storage**
- Click **Create Database** → choose **KV**
- Connect it to your project
- Vercel will automatically add the KV environment variables

### 4. Set your passwords as environment variables
- In Vercel: Settings → Environment Variables
- Add:
  - `HICOM_PASSWORD` = `2363564`
  - `STAFF_PASSWORD` = `52345673`

### 5. Redeploy
- Go to Deployments → click the three dots → Redeploy

---

## How It Works

**Login page (/):**
- Enter `52345673` → goes to Staff Portal
- Enter `2363564` → goes to HICOM Portal

**HICOM Portal (/hicom):**
- View all staff organized by role
- Add new staff members (username, Discord, role)
- Click any member to open their tab
- Issue infractions (Warning / Strike / Severe)
- Assign tasks with descriptions
- Add reports / view staff reports

**Staff Portal (/staff):**
- Select your name from the roster
- View your pending and completed tasks
- Mark tasks as complete
- View your infractions
- Submit reports to HICOM

---

## Passwords

| Password   | Access Level              |
|------------|---------------------------|
| `2363564`  | Leader, Co-Leader, Advisor (HICOM) |
| `52345673` | All other staff roles      |

---

## Roles Included

- Leader
- Co-Leader  
- Advisor
- Recruitment Manager
- Events Manager
- Giveaway Manager
- Media Manager
- Community Manager
- Tickets Manager
- Intelligence Manager
- Public Relations
- Mission Director
