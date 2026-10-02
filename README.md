# Finora

A personal finance tracker built with React, Express, and MongoDB. Log expenses and income, set budgets, create savings goals, and view insights about where your money goes. Includes auth, private view, theme switching, Excel export, admin tools, and password reset via email.

## Stack

React with Vite for the frontend. Express and MongoDB with Mongoose for the backend. JWT for auth. Resend for password reset emails. SheetJS for Excel export.

## Project layout
Finora/
finora/ React frontend
finora-backend/ Express and MongoDB backend

## Running locally

You need Node.js 18 or newer, a MongoDB connection string, and a Resend API key.

Backend: go into `finora-backend`, run `npm install`, then create a `.env` file with `PORT`, `FRONTEND_URL`, `MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `SUPER_ADMIN_EMAIL`, `SEED_ADMIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`. Start it with `npm start`. On first run, an admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Change `SEED_ADMIN` to `false` after that.

Frontend: go into `finora`, run `npm install`, then `npm run dev`. Open http://localhost:5173.

## Notes

The `.env` file is gitignored and must never be committed. Resend's sandbox sender only delivers to the email on your own Resend account. To send reset emails to other addresses, verify a domain in Resend and update the `from` field in `finora-backend/server.js`.

## License

Personal project. Not licensed for redistribution.