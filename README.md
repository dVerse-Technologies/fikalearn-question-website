# FikaLearn Question Website
Admin password: murugan5
A web application for displaying weekly mock exam papers for CBSE Class 10 students.

## 📁 Project Structure

```
fikalearn_question_website/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles with Tailwind
│   ├── auth/                    # Authentication pages
│   │   ├── signin/
│   │   │   └── page.tsx        # Sign in page
│   │   └── signup/
│   │       └── page.tsx        # Sign up page
│   ├── papers/                  # Paper related pages
│   │   └── [id]/
│   │       └── page.tsx        # Individual paper view
│   └── api/                     # API routes
│       ├── auth/               # Authentication APIs
│       ├── papers/             # Paper management APIs
│       ├── questions/          # Question management APIs
│       ├── sheets/             # Google Sheets sync APIs
│       └── cron/               # Scheduled tasks
├── components/                  # Reusable React components
│   ├── Header.tsx              # Main navigation header
│   ├── Footer.tsx              # Footer component
│   ├── WeeklyPapers.tsx        # Display weekly papers
│   ├── FikaLearnPromo.tsx      # Promotion section
│   ├── PaperCard.tsx           # Individual paper card
│   ├── QuestionCard.tsx        # Individual question display
│   ├── CompetencyTag.tsx       # Colored competency tags
│   ├── auth/                   # Authentication components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── OTPVerification.tsx
│   └── ui/                     # UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
├── lib/                        # Utility functions and configurations
│   ├── prisma.ts              # Prisma client instance
│   ├── firebase.ts            # Firebase configuration
│   ├── auth.ts                # Authentication utilities
│   ├── sheets.ts              # Google Sheets integration
│   ├── cron.ts                # CRON job utilities
│   └── utils.ts               # General utilities
├── prisma/                     # Database schema and migrations
│   └── schema.prisma          # Database schema definition
├── types/                      # TypeScript type definitions
│   ├── auth.ts
│   ├── paper.ts
│   └── question.ts
├── package.json               # Dependencies and scripts
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── postcss.config.js          # PostCSS configuration
└── env.example                # Environment variables template
```

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: Firebase Auth (Phone OTP)
- **External APIs**: Google Sheets API
- **Scheduling**: node-cron
- **Deployment**: Vercel (recommended)

## 📋 Features

1. **Weekly Mock Papers**: Automatically publish 3 random papers every Friday
2. **Google Sheets Integration**: Sync questions from shared Google Sheet
3. **User Authentication**: Phone number verification with OTP
4. **Responsive Design**: Works on desktop and mobile
5. **Competency Tags**: Color-coded question categorization
6. **Paper Blueprint**: Follows CBSE structure (60 marks total)

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `env.example` to `.env.local`
   - Fill in your API keys and configuration

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration Required

- Firebase project setup for authentication
- Google Sheets API key
- Environment variables setup

## 📱 User Flow

1. User visits landing page
2. Views current week's 3 mock papers
3. Can sign up/sign in to access papers
4. Phone verification via OTP
5. Access to view questions with competency tags
6. Link to main FikaLearn app for more content

## 🗓️ Automated Schedule

- **Every Friday 8:00 AM IST**: New papers published
- **Previous papers**: Hidden from public view
- **Paper selection**: Random from database

## 🎨 Design System

- **Colors**: Blue (Remembering), Green (Applying), Purple (Creating), Orange (Evaluating), Gray (General)
- **Typography**: Inter font family
- **Layout**: Container-based responsive design
- **Components**: Reusable, typed React components 
