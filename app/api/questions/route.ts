// Minimal sample questions API for the test page
export const dynamic = "force-dynamic"

type Question = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

// In-memory question store (resets on reload)
let currentQuestions: Question[] = [
  {
    id: "q1",
    prompt: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
  },
  {
    id: "q2",
    prompt: "What is the chemical symbol for water?",
    options: ["H2O", "O2", "CO2", "NaCl"],
    correctIndex: 0,
  },
  {
    id: "q3",
    prompt: "Who wrote 'Romeo and Juliet'?",
    options: ["Mark Twain", "William Shakespeare", "Jane Austen", "Charles Dickens"],
    correctIndex: 1,
  },
  { id: "q4", prompt: "What is 12 × 8?", options: ["88", "96", "104", "112"], correctIndex: 1 },
  {
    id: "q5",
    prompt: "The process by which plants make food is called?",
    options: ["Transpiration", "Respiration", "Photosynthesis", "Germination"],
    correctIndex: 2,
  },
]

export async function GET() {
  return Response.json({ questions: currentQuestions })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Accept either { questions: [...] } or just [...]
    const incoming = Array.isArray(body) ? body : body?.questions
    if (!Array.isArray(incoming)) {
      return Response.json({ error: "Expected JSON array of questions or { questions: [...] }" }, { status: 400 })
    }

    // Minimal validation
    const parsed: Question[] = incoming.map((q: any, idx: number) => {
      if (
        typeof q?.prompt !== "string" ||
        !Array.isArray(q?.options) ||
        typeof q?.correctIndex !== "number" ||
        q.options.length < 2
      ) {
        throw new Error(`Invalid question at index ${idx}`)
      }
      const id = typeof q.id === "string" && q.id.trim() ? q.id : `q_${Date.now()}_${idx}`
      return { id, prompt: q.prompt, options: q.options, correctIndex: q.correctIndex }
    })

    currentQuestions = parsed
    return Response.json({ ok: true, count: currentQuestions.length })
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Invalid JSON" }, { status: 400 })
  }
}
