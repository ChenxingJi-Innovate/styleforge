import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})
const MODEL = 'deepseek-chat'

export async function POST(req: Request) {
  try {
    const { profile, topic, count = 10, mode = 'sft' } = await req.json()
    if (!profile?.trim() || !topic?.trim()) return new Response('Missing profile or topic', { status: 400 })

    // SFT mode — single answer per question, used for 1-5★ rating → SFT JSONL
    const sftPrompt = `你是 SFT 数据生产员。基于风格档案，围绕主题"${topic}"生成 ${count} 条 Q/A 训练样本。

要求：
- Q：用户可能问的真实问题，口语化、多样化（涵盖不同切入角度）
- A：300-500 字，严格按风格档案的方式回答，把风格落实到位
- 每条样本之间风格要一致，但话题角度要有差异

风格档案：
"""
${profile}
"""

只输出 JSON，不要任何其他文字：
{"pairs":[{"question":"...","answer":"..."}]}`

    // DPO mode — two contrasting answers per question, used for pairwise A/B comparison → DPO JSONL
    const dpoPrompt = `你是 DPO 偏好数据生产员。基于风格档案，围绕主题"${topic}"生成 ${count} 条偏好对比样本。

每条样本包含 1 个问题 + 2 个不同的回答（A 和 B）。
两个回答都应该符合风格档案的整体调性，但要在表达方式上故意制造差异，便于人工二选一对比：
- A 倾向于：更短促 / 更直接 / 更具体 / 更克制
- B 倾向于：更迂回 / 更抽象 / 更绵长 / 更外放

（目的是让标注者从两者中挑出"更符合风格档案理想态"的那个，作为 chosen，另一个作为 rejected。）

要求：
- Q：用户可能问的真实问题，多样化
- A 和 B 都是 250-400 字
- 不要在内容里暗示哪个更好

风格档案：
"""
${profile}
"""

只输出 JSON，不要任何其他文字：
{"pairs":[{"question":"...","answer_a":"...","answer_b":"..."}]}`

    const r = await client.chat.completions.create({
      model: MODEL,
      max_tokens: mode === 'dpo' ? 6000 : 4000,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: mode === 'dpo' ? dpoPrompt : sftPrompt
      }]
    })

    const text = r.choices[0].message.content ?? '{}'
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleaned)

    if (mode === 'dpo') {
      // Normalize DPO shape ({ question, answer_a, answer_b }) into our common shape ({ question, answer, answer_b })
      const normalized = (parsed.pairs || []).map((p: any) => ({
        question: p.question,
        answer: p.answer_a,
        answer_b: p.answer_b,
      }))
      return Response.json({ pairs: normalized })
    }

    return Response.json(parsed)
  } catch (e: any) {
    return new Response(e.message ?? 'generate failed', { status: 500 })
  }
}
