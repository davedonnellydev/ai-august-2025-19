# Project 19 #AIAugustAppADay: Full stack - AI-Powered Content Club

![Last Commit](https://img.shields.io/github/last-commit/davedonnellydev/ai-august-2025-19)

**📆 Date**: 29/Aug/2025  
**🎯 Project Objective**: Create/join a book/content club, discuss, and AI generates chapter summaries & discussion prompts.  
**🚀 Features**: Register/join club (auth); Add content; Create events; AI summarises chapters & generates discussion prompts  
**🛠️ Tech used**: Next.js, TypeScript, Mantine UI, NextAuth.js, Neon Postgres + Drizzle ORM, OpenAI APIs
**▶️ Live Demo**: _[https://your-demo-url.com](https://your-demo-url.com)_  
_(Link will be added after deployment)_

## 🗒️ Summary

**Lessons learned**  
_A little summary of learnings_

**Blockers**  
_Note any blockers here_

**Final thoughts**  
_Any final thoughts here_

This project has been built as part of my AI August App-A-Day Challenge. You can read more information on the full project here: [https://github.com/davedonnellydev/ai-august-2025-challenge](https://github.com/davedonnellydev/ai-august-2025-challenge).

## 🧪 Testing

![CI](https://github.com/davedonnellydev/ai-august-2025-19/actions/workflows/npm_test.yml/badge.svg)  
_Note: Test suite runs automatically with each push/merge._

## Quick Start

1. **Clone and install:**

   ```bash
   git clone https://github.com/davedonnellydev/ai-august-2025-19.git
   cd ai-august-2025-19
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Start development:**

   ```bash
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# OpenAI API (for AI features)
OPENAI_API_KEY=your_openai_api_key_here

```

### Key Configuration Files

- `next.config.mjs` – Next.js config with bundle analyzer
- `tsconfig.json` – TypeScript config with path aliases (`@/*`)
- `theme.ts` – Mantine theme customization
- `eslint.config.mjs` – ESLint rules (Mantine + TS)
- `jest.config.cjs` – Jest testing config
- `.nvmrc` – Node.js version

### Path Aliases

```ts
import { Component } from '@/components/Component'; // instead of '../../../components/Component'
```

## 📦 Available Scripts

### Build and dev scripts

- `npm run dev` – start dev server
- `npm run build` – bundle application for production
- `npm run analyze` – analyze production bundle

### Testing scripts

- `npm run typecheck` – checks TypeScript types
- `npm run lint` – runs ESLint
- `npm run jest` – runs jest tests
- `npm run jest:watch` – starts jest watch
- `npm test` – runs `prettier:check`, `lint`, `typecheck` and `jest`

### Other scripts

- `npm run prettier:check` – checks files with Prettier
- `npm run prettier:write` – formats files with Prettier

## 📜 License

![GitHub License](https://img.shields.io/github/license/davedonnellydev/ai-august-2025-19)  
This project is licensed under the MIT License.
