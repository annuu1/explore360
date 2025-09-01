"use client"

import useSWR from "swr"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Question = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}
type ApiResponse = { questions: Question[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TestPage() {
  const { data, error, isLoading } = useSWR<ApiResponse>("/api/questions", fetcher)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [temp, setTemp] = useState("")

  useEffect(() => {
    try {
      const n = localStorage.getItem("studentName") || ""
      setName(n)
      setTemp(n)
    } catch {}
  }, [])

  const questions = data?.questions ?? []

  const { score, total } = useMemo(() => {
    const totalQ = questions.length
    const s = submitted ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0), 0) : 0
    return { score: s, total: totalQ }
  }, [submitted, questions, answers])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-balance">Starting your test…</h1>
        <p className="text-muted-foreground">Loading questions.</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold mb-4 text-balance">Unable to load questions</h1>
        <p className="text-destructive">Please try again later.</p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const saveName = () => {
    const n = temp.trim()
    setName(n)
    try {
      localStorage.setItem("studentName", n)
    } catch {}
  }

  const handleSubmit = async () => {
    setSubmitted(true)
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Guest", score, total }),
      })
      await res.json()
    } catch {
      // Best-effort; ignore errors in minimal version
    }
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Quick MCQ Test</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </header>

      {/* Name capture */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto] items-center">
            <Input placeholder="Your name" value={temp} onChange={(e) => setTemp(e.target.value)} />
            <Button onClick={saveName} className="md:ml-3 mt-2 md:mt-0">
              Save
            </Button>
            {name ? <span className="text-sm text-muted-foreground md:ml-3 mt-2 md:mt-0">Current: {name}</span> : null}
          </div>
        </CardContent>
      </Card>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p>No questions available.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-pretty">
                  {idx + 1}. {q.prompt}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers[q.id]?.toString() ?? ""}
                  onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))}
                  className="grid gap-3"
                >
                  {q.options.map((opt, i) => {
                    const id = `${q.id}-${i}`
                    const chosen = answers[q.id] === i
                    const correct = submitted && i === q.correctIndex
                    const incorrect = submitted && chosen && i !== q.correctIndex
                    return (
                      <div
                        key={id}
                        className={[
                          "flex items-center gap-3 rounded-md border p-3",
                          correct ? "border-green-500 bg-green-50" : "",
                          incorrect ? "border-red-500 bg-red-50" : "",
                        ]
                          .join(" ")
                          .trim()}
                      >
                        <RadioGroupItem id={id} value={String(i)} />
                        <Label htmlFor={id} className="cursor-pointer">
                          {opt}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
                {submitted && (
                  <p className="mt-3 text-sm text-muted-foreground">Correct answer: {q.options[q.correctIndex]}</p>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center gap-3">
            {!submitted ? (
              <Button onClick={handleSubmit} disabled={questions.some((q) => answers[q.id] === undefined)}>
                Submit
              </Button>
            ) : (
              <>
                <Button onClick={handleReset} variant="secondary">
                  Retake
                </Button>
                <span className="text-sm">
                  Score: <strong>{score}</strong> / {total} ({total ? Math.round((score / total) * 100) : 0}%)
                </span>
                <Link href="/profile">
                  <Button variant="outline">View Profile</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
