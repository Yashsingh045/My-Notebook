# My-Notebook: Personal Knowledge Management & Learning Platform

A comprehensive full-stack solution for students and professionals to centralize their learning journey.

## Project Structure

- `server/`: Node.js + Express + TypeScript + PostgreSQL + Prisma + Redis
- `client/`: React + Vite + TypeScript 

- `styling`:
Shadcn/UI + Tailwind CSS (layout and core components) + Vanilla CSS("Note Editing" and "Drawing Canvas" areas where we need 100% control.)

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Setup Environment**:
   - Copy `server/.env.example` to `server/.env` and fill in the values.

3. **Database Setup**:
   - Ensure PostgreSQL and Redis are running.
   - Run `npx prisma generate` in the `server` directory.

4. **Run in Development**:
   ```bash
   npm run dev
   ```

## Tech Stack
- Frontend: React, TypeScript, Vite, React Router, Lucide React
- Backend: Node.js, Express, TypeScript, Prisma, Redis
- Database: PostgreSQL
- AI: OpenAI API
- Storage: Google Drive API
