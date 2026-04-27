<div align="center">

# StyleForge

**Distill a writing voice into SFT-ready training data.**
**把一种写作风格,蒸馏成可训练的微调数据集。**

[![Live · Global](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel)](https://styleforge-red.vercel.app)
[![Live · 中国](https://img.shields.io/badge/中国镜像-EdgeOne-1E90FF?style=for-the-badge&logo=tencentqq)](https://styleforge.edgeone.dev)
[![Built with](https://img.shields.io/badge/Built_with-Claude_Code-D97757?style=for-the-badge)](https://claude.com/claude-code)

</div>

---

## 🌐 Live Demo

| Region | Link | Notes |
|---|---|---|
| 🌍 Global | **[styleforge-red.vercel.app](https://styleforge-red.vercel.app)** | Vercel, fastest globally |
| 🇨🇳 国内访问 | **[styleforge.edgeone.dev](https://styleforge.edgeone.dev)** | 腾讯 EdgeOne, 国内秒开 |

> 🌏 Both deployments auto-sync on every push to `main`.

---

## ✨ What it does

StyleForge addresses one concrete problem in fine-tuning small language models:

> **Producing high-quality SFT training data that reflects a specific writing voice — at scale, with quality control.**

Instead of hand-writing thousands of `{prompt, ideal-response}` pairs, this tool:
1. Lets you upload reference writing from a single author
2. Distills the voice into a **5-dimensional style profile** (syntax, vocabulary, emotion, perspective, signature fingerprints)
3. Generates dozens of Q/A pairs in that voice around a topic of your choice
4. Lets you rate each pair (1-5 stars) like an editor would
5. Exports rated samples (≥4★) as a standard SFT JSONL file, ready to feed into LLaMA-Factory / TRL / Unsloth / OpenAI fine-tuning APIs

## 🔄 Pipeline

```
Reference Texts  ─→  Style Profile  ─→  Generated Pairs  ─→  ★ Rating  ─→  SFT JSONL
  (5–10 paragraphs)   (5 dimensions)     (around a topic)     (1–5 stars)   (LLM-Factory ready)
```

Output schema (one sample per line):
```jsonl
{"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
```

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| LLM | DeepSeek V3 via OpenAI SDK |
| Styling | Tailwind CSS, design tokens adapted from [Pinterest Gestalt](https://gestalt.pinterest.systems) |
| Aesthetic | [Apple HIG](https://developer.apple.com/design/human-interface-guidelines) principles (clarity, deference, depth) |
| Icons | Lucide React |
| Hosting | Vercel + Tencent EdgeOne (parallel) |

## 🎨 Design Notes

The UI sits on a dual foundation:

- **Pinterest Gestalt** provides engineering discipline — strict 4px grid, 6 font sizes, 9-step rounding, system font stack (zero web-font load), three-tier token architecture (`base / sema / comp`).
- **Apple HIG** provides art direction — dramatic display typography (`clamp(52px, 8.5vw, 96px)`), `cubic-bezier(0.16, 1, 0.3, 1)` signature easing, frosted-glass floating cards (`backdrop-blur-xl`), serif-italic editorial accents.

Together: a system that feels both engineered and intentional.

## 🚀 Local Setup

```bash
git clone https://github.com/ChenxingJi-Innovate/styleforge.git
cd styleforge
npm install
echo "DEEPSEEK_API_KEY=your_deepseek_key_here" > .env.local
npm run dev
# → http://localhost:3000
```

Get a DeepSeek API key at [platform.deepseek.com](https://platform.deepseek.com). Minimum top-up is ¥10, which runs hundreds of pipeline cycles.

## 📂 File Layout

```
app/
├── layout.tsx                Root, system font stack, metadata
├── page.tsx                  Single-page state machine + UI
├── globals.css               Off-white canvas + selection color
└── api/
    ├── extract/route.ts      Style profile extraction (DeepSeek chat)
    └── generate/route.ts     Q/A pair generation (JSON-mode)
tailwind.config.ts            Gestalt tokens + Apple shadows + easing
```

## 📝 About

Built by **Ji Chenxing (纪宸星)** as a *Vibe Coding* deliverable for the **小红书 AI 人文训练实习生 (产品经理方向)** role demo.

- 🎓 JHU Computer Music BS '26
- 🎓 Brown PRIME '27 Innovation Management & Entrepreneurship

The role asks for someone who can *"design ideal-output standards based on linguistic, psychological, and philosophical insight"* and *"build interactive prototypes with Claude Code"*. StyleForge is one answer to that brief.

---

<div align="center">

🤖 *Vibe-coded with Claude Code · April 2026*

</div>

