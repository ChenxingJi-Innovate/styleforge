import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})
const MODEL = 'deepseek-chat'

export async function POST(req: Request) {
  try {
    const { texts } = await req.json()
    if (!texts?.trim()) return new Response('Missing texts', { status: 400 })

    const r = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `分析以下文本的写作风格，输出 5 个维度的结构化风格档案：

1. 句法（句长、复合句倾向、节奏）
2. 词汇偏好（书面/口语/方言、修辞习惯）
3. 情绪基调（克制/外放、冷峻/温暖）
4. 视角与口吻（人称、自嘲/严肃/调侃）
5. 标志性"指纹"（最易识别的 2-3 个特征）

每个维度 2-3 句话。

最后再给出 3 句话的"模仿建议"，告诉一个 LLM 应该怎么写才像这个作者。

文本：
"""
${texts}
"""

直接输出，编号 1-5，不要 markdown 标题。`
      }]
    })

    const profile = r.choices[0].message.content ?? ''
    return Response.json({ profile })
  } catch (e: any) {
    return new Response(e.message ?? 'extract failed', { status: 500 })
  }
}
