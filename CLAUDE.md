# StyleForge

> Personal-style SFT data production tool. Distill a target writer's voice into a reusable rule profile, then mass-generate SFT-ready Q/A pairs in that voice.

See parent workspace `../CLAUDE.md` for shared context, glossary, and house style (no em dashes, etc.).

## Pipeline

1. **Reference Upload** — user pastes 5-10 paragraphs of target writing
2. **Style Profile Extraction** (`/api/extract`) — Claude analyzes the texts and outputs a 5-dimension style profile (syntax, vocabulary, emotional tone, perspective, signature fingerprints) plus 3 mimicry guidelines for an LLM
3. **Data Generation** (`/api/generate`) — given the profile and a topic, Claude produces 10 Q/A pairs in that voice
4. **Rating UI** — user gives each pair a 1-5 star rating
5. **Export** — pairs rated >=4 are exported as JSONL with the schema:
   ```
   {"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
   ```

## File layout

```
app/
├── layout.tsx               root layout, loads globals.css
├── page.tsx                 single-page UI, all 3 steps + state machine
├── globals.css              tailwind directives + body font
└── api/
    ├── extract/route.ts     style profile extraction (1500 max tokens)
    └── generate/route.ts    Q/A pair generation (4000 max tokens, JSON output)
```

## Key conventions

- All Claude API calls live server-side in `app/api/*/route.ts`. Never call from client.
- API routes return plain JSON responses; errors as plain-text 500s.
- The page is a client component (`'use client'`). State machine: `step` is implicit via `if (profile)` and `if (pairs.length > 0)` gates.
- Model ID `claude-sonnet-4-5` is hardcoded as the constant `MODEL` in each route. Change in one place to test other models.

## Prompt design notes

The extract prompt asks for **5 numbered dimensions + 3-sentence mimicry guidance** in plain text (no markdown). This format is intentional: structured enough for the next LLM to follow, but not so rigid it kills nuance.

The generate prompt forces JSON-only output with a strict schema. Markdown fences are stripped defensively in the route handler.

## Iteration ideas (not yet built)

- Pairwise comparison module (for DPO data)
- Multiple style profiles + style mixing
- Embedding-based style retrieval over a reference corpus
- "Critique" pass: have a separate LLM call rate generated pairs to bootstrap quality

## Run

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
# http://localhost:3000
```
