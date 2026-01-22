# 🚀 Quick Start Guide

## Prerequisites

You need **Node.js 18+** installed on your system.

### Install Node.js (if not installed)

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/)
2. Run the installer
3. Restart your terminal/command prompt

**Verify installation:**
```bash
node --version
npm --version
```

## Setup & Run

### 1. Navigate to the project
```bash
cd c:/awahab/quiz-mini-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Open in browser
Navigate to: http://localhost:3000

## 📱 Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: Vercel Dashboard (Easiest)

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quiz-mini-app.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

Your app will be live at: `https://your-quiz-name.vercel.app`

## 🎮 How to Use

1. **Enter a Topic**: Type any topic (e.g., "Cryptocurrency", "Space Exploration")
2. **Generate Quiz**: Click "Generate Quiz"
3. **Answer Questions**: Select your answers
4. **View Results**: See your score and review answers
5. **Share**: Share your result with friends
6. **Save**: Save quizzes to play later

## 🎨 Features

- ✅ Topic-based quiz generation
- ✅ 5 questions per quiz
- ✅ Local storage for saved quizzes
- ✅ Share results via Web Share API
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Progress tracking
- ✅ Answer review with explanations

## 🔧 Optional: Add AI-Powered Questions

To use real AI for question generation:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
2. Create `.env.local` file:
```
OPENAI_API_KEY=sk-your-key-here
```
3. Update the `generateQuiz` function in `app/page.tsx` to call OpenAI API

## 📚 Project Structure

```
quiz-mini-app/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main quiz application
│   └── globals.css         # Global styles + Tailwind
├── public/
│   ├── og-image.svg        # Open Graph image
│   └── .well-known/
│       └── farcaster.json  # Farcaster manifest
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.ts      # Tailwind config
├── vercel.json             # Vercel deployment config
└── README.md               # Full documentation
```

## 🆘 Troubleshooting

### "node is not recognized"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Build errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📖 Resources

- [Base Mini Apps Docs](https://docs.base.org/mini-apps)
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Ready to build your quiz app? Start with step 1 above! 🎉**
