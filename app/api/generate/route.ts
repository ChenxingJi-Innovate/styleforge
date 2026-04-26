import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})
const MODEL = 'deepseek-chat'

export async function POST(req: Request) {
  try {
    const { profile, topic, count = 10 } = await req.json()
    if (!profile?.trim() || !topic?.trim()) return new Response('Missing profile or topic', { status: 400 })

    const r = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: `你是 SFT 数据生产员。基于风格档案，围绕主题"${topic}"生成 ${count} 条 Q/A 训练样本。

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
      }]
    })

    const text = r.choices[0].message.content ?? '{}'
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)
  } catch (e: any) {
    return new Response(e.message ?? 'generate failed', { status: 500 })
  }
}
