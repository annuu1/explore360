// Minimal in-memory progress store. Replace with DB later.
type Attempt = {
  id: string
  score: number
  total: number
  percent: number
  createdAt: string
}

const attemptsByName: Record<string, Attempt[]> = {}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = (searchParams.get("name") || "").trim()
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 })
  }
  const list = (attemptsByName[name] || []).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  const totalAttempts = list.length
  const avgPercent = totalAttempts ? Math.round(list.reduce((s, a) => s + a.percent, 0) / totalAttempts) : 0
  const bestPercent = totalAttempts ? Math.max(...list.map((a) => a.percent)) : 0
  return Response.json({ name, totalAttempts, avgPercent, bestPercent, attempts: list })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = (body?.name || "Guest").toString().trim() || "Guest"
    const score = Number(body?.score)
    const total = Number(body?.total)
    if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
      return Response.json({ error: "Invalid score/total" }, { status: 400 })
    }
    const percent = Math.max(0, Math.round((score / total) * 100))
    const attempt: Attempt = {
      id: `a_${Date.now()}`,
      score,
      total,
      percent,
      createdAt: new Date().toISOString(),
    }
    attemptsByName[name] = attemptsByName[name] || []
    attemptsByName[name].push(attempt)
    return Response.json({ ok: true, attempt })
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid JSON" }, { status: 400 })
  }
}
