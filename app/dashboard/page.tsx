"use client"
import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function Dashboard() {
  const router = useRouter()
  const { data: classes } = useSWR("/api/admin/catalog/classes", fetcher)
  const [classId, setClassId] = useState<string>("")
  const { data: subjects } = useSWR(classId ? `/api/admin/catalog/subjects?classId=${classId}` : null, fetcher)
  const [subjectId, setSubjectId] = useState<string>("")
  const { data: chapters } = useSWR(subjectId ? `/api/admin/catalog/chapters?subjectId=${subjectId}` : null, fetcher)
  const [chapterId, setChapterId] = useState<string>("")
  const [starting, setStarting] = useState(false)

  const startTest = async () => {
    setStarting(true)
    const res = await fetch("/api/tests/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, subjectId, chapterId, limit: 10 }),
    })
    setStarting(false)
    if (!res.ok) return
    const data = await res.json()
    router.push(`/test/${data.testId}`)
    sessionStorage.setItem(`test:${data.testId}`, JSON.stringify(data.questions))
  }

  return (
    <main className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-pretty">Start a Chapter Test</h1>
      <div className="space-y-3">
        <Select onValueChange={setClassId}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((c: any) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSubjectId} disabled={!classId}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects?.map((s: any) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setChapterId} disabled={!subjectId}>
          <SelectTrigger>
            <SelectValue placeholder="Select chapter" />
          </SelectTrigger>
          <SelectContent>
            {chapters?.map((ch: any) => (
              <SelectItem key={ch._id} value={ch._id}>
                {ch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="w-full" disabled={!chapterId || starting} onClick={startTest}>
          {starting ? "Starting..." : "Start Test"}
        </Button>
      </div>
    </main>
  )
}
