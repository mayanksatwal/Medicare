# Deploying MediCare (about 15 minutes, all free tiers)

The backend already serves the built frontend, so you deploy ONE service.

## 1. Database (MongoDB Atlas)
1. Create a free M0 cluster at mongodb.com/atlas.
2. Database Access: add a user. Network Access: allow 0.0.0.0/0.
3. Copy the connection string: mongodb+srv://USER:PASS@cluster.mongodb.net/medicare

## 2. Google login
1. Google Cloud Console > APIs & Services > Credentials > Create OAuth client ID (Web).
2. Authorized JavaScript origins: http://localhost:5173 and your deployed URL (for example https://medicare.onrender.com).
3. Copy the Client ID (ends with .apps.googleusercontent.com).

## 3. Deploy on Render
1. Push this repo to GitHub.
2. Render > New > Blueprint > pick the repo (it reads render.yaml).
3. Fill in MONGO_URI, GOOGLE_CLIENT_ID, VITE_GOOGLE_CLIENT_ID (same Client ID) and GEMINI_API_KEY. JWT_SECRET is generated for you.
4. Deploy, then open https://YOUR-SERVICE.onrender.com/api/health - it should show database: connected.
   Doctors and demo accounts are seeded automatically on first start.

Demo logins: patient@medicare.demo / Patient@123 and aarav@medicare.demo / Doctor@123.
Set ALLOW_DEMO_VERIFY=false when you go live for real.

## Local run
npm run install:all
npm run dev:backend    (terminal 1, port 5001)
npm run dev:frontend   (terminal 2, port 5173)

Copy backend/.env.example to backend/.env and frontend/.env.example to frontend/.env first.
