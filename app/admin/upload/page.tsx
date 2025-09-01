"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const sample = `[
  {
    "id": "q1",
    "prompt": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "correctIndex": 1
  },
  {
    "id": "q2",
    "prompt": "What is 12 × 8?",
    "options": ["88", "96", "104", "112"],
    "correctIndex": 1
  }
]`

export default function AdminUploadPage() {
  const [text, setText] = useState(sample)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onSubmit = async () => {
    setLoading(true)
    try {
      const parsed = JSON.parse(text)
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      toast({ title: "Uploaded", description: `Questions saved: ${data.count}` })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Invalid JSON", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Admin: Upload Questions</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/test">
            <Button variant="outline">Test</Button>
          </Link>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Paste JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Provide an array of questions or {"{ questions: [...] }"} with fields: id (optional), prompt, options[],
            correctIndex. This temporarily stores data in memory.
          </p>
          <textarea
            className="w-full min-h-[240px] rounded-md border bg-background p-3 font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
          <div className="flex items-center gap-3">
            <Button onClick={onSubmit} disabled={loading}>
              {loading ? "Uploading..." : "Upload"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setText(sample)}>
              Use Sample
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
