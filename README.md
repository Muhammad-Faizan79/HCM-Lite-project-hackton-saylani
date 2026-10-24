# HCM Lite — Saylani Hackathon

Responsive React + Vite frontend and Node.js + Express backend, structured around the uploaded challenge brief.

## Stack
- Frontend: React, Vite, React Router, Lucide React, plain responsive CSS
- Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs
- AI: server-side provider integration point (configure `AI_API_KEY`); a safe fallback is included.

## Requirements
Node.js 20+, MongoDB (local or Atlas).

## Run locally
1. Copy `backend/.env.example` to `backend/.env` and set values.
2. In one terminal:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
3. In another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open the Vite URL shown in the terminal.

On first launch, use **First-run setup** to create the company and Admin account. Then log in as Admin and create HR users / employees. The app does not seed dummy company or employee records.

## Important
This is a hackathon MVP scaffold, not a fully audited production HR/payroll system. Test business rules and review security before real-world use. The challenge brief's optional camera/geolocation attendance is not included in the core starter. Payroll tax slabs are illustrative as described in the brief.

## Environment
See `backend/.env.example`. Never commit real `.env` files or API keys.
