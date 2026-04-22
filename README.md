# My Notebook: The Scholar's Digital Vault

> "Capture, synthesize, and architecturalize your career intelligence."

My Notebook is a premium, privacy-first digital workspace designed for the modern academic and professional curator. Built on the philosophy of **Zero-Party Data Ownership**, it transforms your Google Drive into a sophisticated intelligence layer, providing a high-end editorial experience without the data-privacy compromises of traditional note-taking apps.

---

## Core Pillars

### 1. Zero-Party Data Strategy

Unlike traditional SaaS platforms, **My Notebook does not store your content**. All notes, PDF highlights, and career mappings live exclusively in your own Google Drive. We provide the _lens and the tools_, you provide the _vault_.

### 2. Personal Curator Space

An elegantly structured 3-column workspace designed to manage your life’s milestones:

- **Studies**: Academic papers, lecture notes, and research syntheses.
- **Internships**: Project logs, documentation, and skill tracking.
- **Jobs**: Role descriptions, interview prep, and career strategy.
- **Archive**: A timeless repository for completed chapters.

### 3. Editorial AI (Intelligence Layer)

A sophisticated sidebar assistant that lives alongside your documents:

- **Deep Summarization**: Extract the core essence from long academic papers.
- **MCQ Generation**: Automatically generate practice questions for exam defense.
- **Career Alignment**: Analyze how your current notes align with specific job descriptions.

---

## Technological Odyssey

### **The Forge (Backend)**

- **Runtime**: [Node.js](https://nodejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Architecture**: Strict **OOP (Object-Oriented Programming)** with Controller-Service-Interface patterns for maximum scalability.
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL for metadata/auth, Google Drive for content).
- **Security**: JWT Auth, Bcrypt encryption, Redis-backed session management.
- **Integrations**: Google Drive API v3, OpenAI GPT-4o.

### **The Gallery (Frontend)**

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (Custom UI tokens, HSL color palettes).
- **Editor**: [Tiptap](https://tiptap.dev/) (Rich-text synthesis).
- **Dynamics**: [Framer Motion](https://www.framer.com/motion/) for fluid, micro-animated transitions.

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL Instance
- Google Cloud Console Project (with Drive API enabled)

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env # Fill in your DB and Google credentials
npx prisma generate
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🌐 Deployment

### **Backend**

Deployed on **Kubernetes Cluster**:
[Open Backend](https://my-notebook-yashsingh045.nstsdc.org/)

### **Frontend**

Deployed on **Vercel**:

[Open App](https://my-notebook-orcin.vercel.app/)

---
