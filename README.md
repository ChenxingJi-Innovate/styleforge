# StyleForge

SFT data production tool: distill personal writing style from samples, generate aligned Q/A pairs, rate, export as SFT-ready JSONL.

## Run

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
# open http://localhost:3000
```

## Deploy

```bash
npm i -g vercel
vercel
# add ANTHROPIC_API_KEY in Vercel project settings → Environment Variables
```

## Pipeline

1. **Reference** → upload 5-10 paragraphs of target writing style
2. **Profile** → LLM extracts a 5-dimension style profile
3. **Generate** → LLM produces 10 Q/A pairs in that style
4. **Rate** → 1-5 star rating per pair
5. **Export** → ≥4 rated pairs exported as SFT JSONL (`{"messages":[{"role":"user",...},{"role":"assistant",...}]}`)

The exported JSONL can be fed directly into HuggingFace TRL, LLaMA-Factory, Unsloth, or OpenAI/Anthropic fine-tuning APIs.
