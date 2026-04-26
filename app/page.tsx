'use client'
import { useState } from 'react'
import { Star, Download, ArrowRight, Loader2, Check, Sparkles, Wand2, FileText, Quote, MessageCircle } from 'lucide-react'

type Pair = { question: string; answer: string; rating?: number }

export default function Home() {
  const [refs, setRefs] = useState('')
  const [profile, setProfile] = useState('')
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [pairs, setPairs] = useState<Pair[]>([])
  const [loading, setLoading] = useState<'extract' | 'generate' | null>(null)
  const [error, setError] = useState('')

  async function extract() {
    setLoading('extract'); setError('')
    try {
      const r = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: refs })
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      setProfile(data.profile)
      setTimeout(() => document.getElementById('step-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(null) }
  }

  async function generate() {
    setLoading('generate'); setError('')
    try {
      const r = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, topic, count })
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      setPairs(data.pairs)
      setTimeout(() => document.getElementById('step-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(null) }
  }

  function rate(i: number, r: number) {
    const next = [...pairs]; next[i] = { ...next[i], rating: r }; setPairs(next)
  }

  function exportJSONL() {
    const data = pairs
      .filter(p => (p.rating ?? 0) >= 4)
      .map(p => JSON.stringify({
        messages: [
          { role: 'user', content: p.question },
          { role: 'assistant', content: p.answer }
        ]
      }))
      .join('\n')
    const blob = new Blob([data], { type: 'application/jsonl' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'styleforge-sft.jsonl'; a.click()
  }

  const highRated = pairs.filter(p => (p.rating ?? 0) >= 4).length
  const ratedCount = pairs.filter(p => p.rating !== undefined).length
  const currentStep = pairs.length > 0 ? 3 : profile ? 2 : 1

  return (
    <main className="min-h-screen">

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden">
        {/* Apple-style soft gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-pushpin-50/50 via-transparent to-transparent" aria-hidden />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-pill bg-pushpin-100/40 blur-3xl" aria-hidden />
        <div className="absolute top-60 -left-32 w-[420px] h-[420px] rounded-pill bg-pushpin-50/60 blur-3xl" aria-hidden />

        <div className="relative max-w-5xl mx-auto px-600 sm:px-800 pt-1300 pb-1500 sm:pt-1600 sm:pb-1600">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-1200 items-center">

            {/* left: copy */}
            <div className="animate-fadeUp">
              <div className="inline-flex items-center gap-200 px-300 py-100 rounded-pill bg-mochimalist/80 backdrop-blur-md shadow-glass text-100 font-bold text-pushpin-450 mb-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="tracking-[0.18em]">SFT&nbsp;DATA&nbsp;WORKSHOP</span>
              </div>

              <h1 className="font-bold tracking-[-0.04em] text-cosmicore leading-[0.92] mb-500" style={{ fontSize: 'clamp(52px, 8.5vw, 96px)' }}>
                Distill<br />
                a writing<br />
                <span className="font-display italic font-normal text-pushpin-450 tracking-[-0.02em]">voice.</span>
              </h1>

              <p className="text-400 text-roboflow-700 leading-relaxed max-w-md mb-300">
                上传一段你想模仿的写作,提炼五维风格指纹,批量生成训练样本,一键导出 SFT 数据集。
              </p>
              <p className="font-display italic text-200 text-roboflow-500 max-w-md tracking-tight">
                For fine-tuning a language model that writes like someone specific.
              </p>

              <div className="flex flex-wrap items-center gap-400 mt-800">
                <a href="#step-1" className="inline-flex items-center gap-200 px-500 py-300 rounded-pill bg-cosmicore text-mochimalist text-200 font-semibold transition-all duration-500 ease-apple hover:bg-roboflow-700 hover:shadow-lift hover:-translate-y-0.5">
                  开始制作 <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-100 text-roboflow-500 hidden sm:block">输出标准 JSONL · 兼容 LLaMA-Factory · TRL · Unsloth</span>
              </div>
            </div>

            {/* right: floating preview cards (frosted glass) */}
            <div className="relative h-[440px] hidden lg:block">
              <PreviewCard
                className="absolute top-0 left-0 w-72 animate-floatA"
                badge="01 — 参考文本"
                badgeColor="bg-pushpin-50/90 backdrop-blur-sm text-pushpin-450"
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                <p className="font-display italic text-200 text-roboflow-700 leading-relaxed">
                  &ldquo;我于是用了种种法,来麻醉自己的灵魂,使我沉入于国民中,使我回到古代去⋯&rdquo;
                </p>
                <p className="text-100 font-mono text-roboflow-400 mt-200 tracking-wider">参考样本 · 5–10 段</p>
              </PreviewCard>

              <PreviewCard
                className="absolute top-32 right-0 w-72 animate-floatB"
                badge="02 — 风格档案"
                badgeColor="bg-roboflow-100/90 backdrop-blur-sm text-roboflow-700"
                icon={<Wand2 className="w-3.5 h-3.5" />}
              >
                <div className="space-y-200">
                  <ProfileTag label="句法" value="文白交织" />
                  <ProfileTag label="基调" value="自嘲冷峻" />
                  <ProfileTag label="指纹" value="借古讽今" />
                </div>
              </PreviewCard>

              <PreviewCard
                className="absolute bottom-0 left-12 w-80 animate-floatC"
                badge="03 — 评分导出"
                badgeColor="bg-pushpin-450 text-mochimalist"
                icon={<Star className="w-3.5 h-3.5 fill-current" />}
              >
                <div className="flex items-center gap-200 mb-200">
                  {[1, 2, 3, 4, 5].map(r => (
                    <Star key={r} className={`w-4 h-4 ${r <= 4 ? 'fill-pushpin-450 text-pushpin-450' : 'text-roboflow-200'}`} strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-100 font-mono text-roboflow-500">styleforge-sft.jsonl · 47 条 ≥4★</p>
              </PreviewCard>
            </div>

          </div>
        </div>
      </section>

      {/* ───── BODY (no bg shift, Apple seamless flow) ───── */}
      <div className="max-w-3xl mx-auto px-600 sm:px-800 pt-800 pb-1300 sm:pb-1500">

        {/* Progress */}
        <nav className="mb-1200 flex flex-wrap items-center gap-200 text-100">
          {[
            { n: 1, label: '提取风格' },
            { n: 2, label: '生成样本' },
            { n: 3, label: '评分导出' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-200">
              <div className={`flex items-center gap-200 px-400 py-200 rounded-pill transition-all duration-500 ease-apple ${
                currentStep === s.n ? 'bg-cosmicore text-mochimalist shadow-raised' :
                currentStep > s.n ? 'bg-pushpin-450 text-mochimalist' :
                'bg-mochimalist/70 backdrop-blur-md text-roboflow-500 shadow-glass'
              }`}>
                {currentStep > s.n ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <span className="font-mono font-bold">{String(s.n).padStart(2, '0')}</span>
                )}
                <span className="font-semibold">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-400 h-0.5 transition-colors duration-300 ease-apple ${currentStep > s.n ? 'bg-pushpin-450' : 'bg-roboflow-200'}`} />}
            </div>
          ))}
        </nav>

        {/* Step 1 */}
        <section id="step-1" className="mb-1200 animate-fadeUp">
          <SectionHeader number="01" title="参考文本" subtitle="粘贴来自同一位作者的 5–10 段写作样本。语料同源性越高,提取的风格指纹越清晰 (混入多位作者会稀释档案特征)。" />

          <div className="rounded-400 bg-mochimalist shadow-floating overflow-hidden">
            <textarea
              className="w-full h-1600 p-600 text-300 bg-transparent resize-none outline-none placeholder:text-roboflow-400 leading-relaxed"
              placeholder={`例如:\n"我于是用了种种法,来麻醉自己的灵魂,使我沉入于国民中,使我回到古代去⋯"\n"我自爱我的野草,但我憎恶这以野草作装饰的地面⋯"\n⋯`}
              value={refs}
              onChange={e => setRefs(e.target.value)}
            />
            <div className="flex items-center justify-between px-600 py-300 border-t border-roboflow-100">
              <span className="text-100 font-mono text-roboflow-500">{refs.length} / ~3000 字</span>
              <button
                onClick={extract}
                disabled={loading !== null || !refs.trim()}
                className="inline-flex items-center gap-200 px-500 py-200 rounded-pill bg-cosmicore text-mochimalist text-200 font-semibold transition-all duration-500 ease-apple hover:bg-roboflow-700 hover:shadow-raised hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading === 'extract' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />正在分析风格</>
                ) : (
                  <>抽取风格档案<ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        {(profile || loading === 'extract') && (
          <section id="step-2" className="mb-1200 scroll-mt-8 animate-fadeUp">
            <SectionHeader number="02" title="风格档案" subtitle="基于你的参考,模型提炼出五维风格指纹与模仿建议。" />

            {loading === 'extract' && !profile ? (
              <ProfileSkeleton />
            ) : (
              <div className="rounded-400 bg-mochimalist shadow-floating p-700 sm:p-800">
                <div className="flex items-center gap-200 mb-500 text-100 font-bold uppercase tracking-[0.18em] text-pushpin-450">
                  <Wand2 className="w-3.5 h-3.5" />
                  Style Profile
                </div>
                <pre className="font-sans whitespace-pre-wrap text-300 leading-[1.85] text-cosmicore">
                  {profile}
                </pre>
              </div>
            )}

            {profile && (
              <div className="mt-600 rounded-400 bg-mochimalist shadow-floating overflow-hidden">
                <div className="px-600 pt-500 pb-100">
                  <label className="text-100 font-bold uppercase tracking-[0.18em] text-roboflow-500">训练话题</label>
                  <p className="text-100 text-roboflow-400 mt-100">指定一个话题方向,模型将围绕它生成不同切入角度的对话样本</p>
                </div>
                <input
                  className="w-full px-600 pb-400 text-400 bg-transparent outline-none placeholder:text-roboflow-300"
                  placeholder="例如: 关于深夜失眠"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                />
                <div className="flex flex-wrap items-center justify-between gap-300 px-600 py-300 border-t border-roboflow-100">
                  <div className="flex items-center gap-300">
                    <span className="text-100 font-bold uppercase tracking-[0.18em] text-roboflow-500">数量</span>
                    <CountStepper value={count} onChange={setCount} />
                    <span className="text-100 text-roboflow-500">条 <span className="font-mono text-roboflow-400">(1–20)</span></span>
                  </div>
                  <button
                    onClick={generate}
                    disabled={loading !== null || !topic.trim() || count < 1}
                    className="inline-flex items-center gap-200 px-500 py-200 rounded-pill bg-pushpin-450 text-mochimalist text-200 font-semibold transition-all duration-500 ease-apple hover:bg-pushpin-500 hover:shadow-raised hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading === 'generate' ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />正在生成</>
                    ) : (
                      <><Wand2 className="w-4 h-4" />生成训练样本</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Step 3 */}
        {(pairs.length > 0 || loading === 'generate') && (
          <section id="step-3" className="mb-1000 scroll-mt-8 animate-fadeUp">
            <SectionHeader number="03" title="评分 & 导出" subtitle="像审稿人那样判断每条样本是否到位。≥4 星才会进入训练集。" />

            {loading === 'generate' && pairs.length === 0 ? (
              <PairsSkeleton />
            ) : (
              <>
                <div className="mb-500 grid grid-cols-2 gap-400">
                  <StatCard label="已评样本" value={`${ratedCount} / ${pairs.length}`} tone="neutral" />
                  <StatCard label="进入训练集" value={`${highRated} 条`} sub="≥4★" tone="accent" />
                </div>

                <div className="space-y-300">
                  {pairs.map((p, i) => (
                    <PairCard key={i} index={i} pair={p} onRate={r => rate(i, r)} />
                  ))}
                </div>

                <div className="mt-800 flex items-center justify-between rounded-400 bg-cosmicore p-600 shadow-lift overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pushpin-450/20 to-transparent" aria-hidden />
                  <div className="relative">
                    <div className="text-200 font-bold text-mochimalist">导出训练数据</div>
                    <div className="text-100 text-roboflow-300 mt-100">
                      {highRated > 0
                        ? `打包 ${highRated} 条 ≥4★ 样本为标准 SFT JSONL`
                        : '请先给至少一条样本打 4 星以上'}
                    </div>
                  </div>
                  <button
                    onClick={exportJSONL}
                    disabled={highRated === 0}
                    className="relative inline-flex items-center gap-200 px-500 py-300 rounded-pill bg-pushpin-450 text-mochimalist text-200 font-semibold transition-all duration-500 ease-apple hover:bg-pushpin-500 hover:shadow-lift hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <Download className="w-4 h-4" />
                    导出 JSONL
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {error && (
          <div className="mt-800 rounded-400 bg-pushpin-50 p-400 text-200 text-pushpin-700 flex items-start gap-300 animate-fadeUp">
            <span className="font-mono font-bold shrink-0">!</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

      </div>

      {/* ───── FOOTER (Apple-thin) ───── */}
      <footer className="border-t border-roboflow-100 py-700 px-600">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-300">
          <div className="text-100 text-roboflow-500">
            <span className="font-bold text-cosmicore">StyleForge</span> · <span className="font-display italic">a vibe-coded SFT data tool</span>
          </div>
          <div className="text-100 font-mono text-roboflow-400 tracking-tight">
            Tokens · Pinterest Gestalt · Aesthetic · Apple HIG
          </div>
        </div>
      </footer>
    </main>
  )
}

/* ─────── components ─────── */

function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="mb-600 flex items-start gap-400">
      <span className="font-mono text-500 font-bold text-pushpin-450 leading-none shrink-0 w-1100 tabular-nums">{number}</span>
      <div className="pt-100">
        <h2 className="text-500 font-bold text-cosmicore tracking-[-0.02em] mb-100">{title}</h2>
        <p className="text-200 text-roboflow-600 leading-relaxed max-w-xl">{subtitle}</p>
      </div>
    </div>
  )
}

function PreviewCard({ className, badge, badgeColor, icon, children }: { className?: string; badge: string; badgeColor: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`rounded-400 bg-mochimalist/80 backdrop-blur-xl shadow-lift p-500 transition-transform duration-700 ease-apple hover:scale-105 hover:shadow-lift ${className ?? ''}`}>
      <div className={`inline-flex items-center gap-100 px-200 py-100 rounded-pill text-100 font-bold mb-300 ${badgeColor}`}>
        {icon}
        <span className="tracking-wide">{badge}</span>
      </div>
      {children}
    </div>
  )
}

function CountStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.max(1, Math.min(20, n))
  const dec = () => onChange(clamp(value - 1))
  const inc = () => onChange(clamp(value + 1))
  return (
    <div className="inline-flex items-center gap-200 rounded-pill bg-roboflow-50 p-100">
      <button
        onClick={dec}
        disabled={value <= 1}
        aria-label="减少"
        className="w-700 h-700 rounded-pill flex items-center justify-center font-mono text-300 font-bold text-cosmicore bg-mochimalist shadow-floating transition-all duration-300 ease-apple hover:bg-pushpin-50 hover:text-pushpin-450 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={20}
        value={value}
        onChange={e => {
          const raw = e.target.value
          if (raw === '') return onChange(1)
          const n = parseInt(raw, 10)
          if (!isNaN(n)) onChange(clamp(n))
        }}
        onBlur={e => {
          const n = parseInt(e.target.value, 10)
          onChange(isNaN(n) ? 1 : clamp(n))
        }}
        className="w-800 h-700 text-center bg-transparent font-mono font-bold tabular-nums text-200 text-cosmicore outline-none rounded-pill focus:bg-mochimalist focus:shadow-floating focus:ring-2 focus:ring-pushpin-450/30 transition-all duration-200 ease-apple [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        onClick={inc}
        disabled={value >= 20}
        aria-label="增加"
        className="w-700 h-700 rounded-pill flex items-center justify-center font-mono text-300 font-bold text-cosmicore bg-mochimalist shadow-floating transition-all duration-300 ease-apple hover:bg-pushpin-50 hover:text-pushpin-450 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        +
      </button>
    </div>
  )
}

function ProfileTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-200">
      <span className="text-100 font-mono text-roboflow-400 w-1000 shrink-0 uppercase tracking-wider">{label}</span>
      <span className="text-200 font-semibold text-cosmicore">{value}</span>
    </div>
  )
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: 'neutral' | 'accent' }) {
  const isAccent = tone === 'accent'
  return (
    <div className={`rounded-400 p-500 transition-all duration-500 ease-apple ${isAccent ? 'bg-gradient-to-br from-pushpin-50 to-pushpin-100/60' : 'bg-mochimalist shadow-floating'}`}>
      <div className={`text-100 font-bold uppercase tracking-[0.18em] mb-200 ${isAccent ? 'text-pushpin-450' : 'text-roboflow-500'}`}>{label}</div>
      <div className="flex items-baseline gap-200">
        <span className={`text-500 font-bold tabular-nums tracking-tight ${isAccent ? 'text-pushpin-450' : 'text-cosmicore'}`}>{value}</span>
        {sub && <span className="text-100 font-mono text-roboflow-500">{sub}</span>}
      </div>
    </div>
  )
}

function PairCard({ index, pair, onRate }: { index: number; pair: Pair; onRate: (r: number) => void }) {
  const isHigh = (pair.rating ?? 0) >= 4
  const isLow = pair.rating !== undefined && pair.rating < 4
  return (
    <article className={`rounded-400 bg-mochimalist transition-all duration-500 ease-apple hover:shadow-lift ${
      isHigh ? 'shadow-raised ring-2 ring-pushpin-450/30' : isLow ? 'shadow-floating opacity-60' : 'shadow-floating'
    }`}>
      <div className="p-600 sm:p-700">
        <div className="flex items-start gap-400 mb-400">
          <span className={`shrink-0 w-1100 h-1100 rounded-pill flex items-center justify-center font-mono text-100 font-bold tabular-nums transition-colors duration-300 ${
            isHigh ? 'bg-pushpin-450 text-mochimalist' : 'bg-roboflow-100 text-roboflow-500'
          }`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex-1 pt-100">
            <div className="flex items-center gap-200 text-100 font-bold uppercase tracking-[0.18em] text-roboflow-500 mb-200">
              <MessageCircle className="w-3 h-3" />
              Question
            </div>
            <p className="text-300 leading-relaxed text-cosmicore">{pair.question}</p>
          </div>
        </div>
        <div className="pl-1300 mb-500">
          <div className="flex items-center gap-200 text-100 font-bold uppercase tracking-[0.18em] text-pushpin-450 mb-200">
            <Quote className="w-3 h-3" />
            Answer
          </div>
          <p className="font-display text-300 leading-[1.85] text-roboflow-700 whitespace-pre-wrap tracking-tight">{pair.answer}</p>
        </div>
        <div className="flex items-center justify-between gap-300 pl-1300 pt-400 border-t border-roboflow-100">
          <div className="flex items-center gap-300">
            <span className="text-100 font-bold uppercase tracking-[0.18em] text-roboflow-500">Rate</span>
            <div className="flex gap-100">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  onClick={() => onRate(r)}
                  className="p-100 rounded-pill transition-all duration-300 ease-apple hover:bg-roboflow-50 hover:scale-110"
                  aria-label={`${r} stars`}
                >
                  <Star
                    className={`w-5 h-5 transition-colors duration-300 ${
                      (pair.rating ?? 0) >= r ? 'fill-pushpin-450 text-pushpin-450' : 'text-roboflow-300'
                    }`}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>
          {pair.rating !== undefined && (
            <span className={`text-100 font-mono font-bold px-300 py-100 rounded-pill tracking-wider ${
              isHigh ? 'bg-pushpin-50 text-pushpin-450' : 'bg-roboflow-100 text-roboflow-500'
            }`}>
              {isHigh ? '✓ INTO TRAINING SET' : '✗ EXCLUDED'}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function ProfileSkeleton() {
  return (
    <div className="rounded-400 bg-mochimalist shadow-floating p-700 sm:p-800 space-y-300">
      {[100, 88, 95, 82, 90, 75, 92, 80].map((w, i) => (
        <div
          key={i}
          className="h-200 rounded-pill bg-roboflow-100 animate-pulse"
          style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

function PairsSkeleton() {
  return (
    <div className="space-y-300">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-400 bg-mochimalist shadow-floating p-600 sm:p-700 space-y-300">
          <div className="h-200 w-1600 rounded-pill bg-roboflow-100 animate-pulse" />
          <div className="h-300 rounded-pill bg-roboflow-100 animate-pulse w-3/4" style={{ animationDelay: '120ms' }} />
          <div className="space-y-200 pt-200">
            <div className="h-200 rounded-pill bg-roboflow-50 animate-pulse" style={{ animationDelay: '200ms' }} />
            <div className="h-200 rounded-pill bg-roboflow-50 animate-pulse w-11/12" style={{ animationDelay: '280ms' }} />
            <div className="h-200 rounded-pill bg-roboflow-50 animate-pulse w-4/5" style={{ animationDelay: '360ms' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
