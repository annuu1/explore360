"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

type Question = { id: string; text: string; options: { key: string; text: string }[] }

export default function TestPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem(`test:${params.id}`)
    if (data) setQuestions(JSON.parse(data))
    else router.replace("/dashboard")
  }, [params.id, router])

  const submit = async () => {
    setSubmitting(true)
    const payload = Object.entries(answers).map(([questionId, selectedOptionKey]) => ({
      questionId,
      selectedOptionKey,
    }))
    const res = await fetch(`/api/tests/${params.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    })
    setSubmitting(false)
    if (!res.ok) return
    const data = await res.json()
    alert(`Score: ${data.score}/${data.total}`)
    router.push("/dashboard")
  }

  return (
    <main className="p-4 space-y-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-pretty">Test</h1>
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {idx + 1}. {q.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[q.id] || ""}
                onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                className="space-y-2"
              >
                {q.options.map((opt) => (
                  <div key={opt.key} className="flex items-center gap-2">
                    <RadioGroupItem id={`${q.id}-${opt.key}`} value={opt.key} />
                    <Label htmlFor={`${q.id}-${opt.key}`}>
                      {opt.key}. {opt.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button className="w-full" onClick={submit} disabled={submitting || questions.length === 0}>
        {submitting ? "Submitting..." : "Submit Test"}
      </Button>
    </main>
  )
}
