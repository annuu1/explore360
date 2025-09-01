"use client"
import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminPage() {
  const { data: classes, mutate: mClasses } = useSWR("/api/admin/catalog/classes", fetcher)
  const [className, setClassName] = useState("")

  const [selectedClass, setSelectedClass] = useState<string>("")
  const { data: subjects, mutate: mSubjects } = useSWR(
    selectedClass ? `/api/admin/catalog/subjects?classId=${selectedClass}` : null,
    fetcher,
  )
  const [subjectName, setSubjectName] = useState("")

  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const { data: chapters, mutate: mChapters } = useSWR(
    selectedSubject ? `/api/admin/catalog/chapters?subjectId=${selectedSubject}` : null,
    fetcher,
  )
  const [chapterName, setChapterName] = useState("")

  const [json, setJson] = useState("")

  const addClass = async () => {
    const res = await fetch("/api/admin/catalog/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: className }),
    })
    if (res.ok) {
      setClassName("")
      mClasses()
    } else toast({ title: "Failed to add class", variant: "destructive" })
  }
  const addSubject = async () => {
    const res = await fetch("/api/admin/catalog/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjectName, classId: selectedClass }),
    })
    if (res.ok) {
      setSubjectName("")
      mSubjects()
    } else toast({ title: "Failed to add subject", variant: "destructive" })
  }
  const addChapter = async () => {
    const res = await fetch("/api/admin/catalog/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: chapterName, subjectId: selectedSubject }),
    })
    if (res.ok) {
      setChapterName("")
      mChapters()
    } else toast({ title: "Failed to add chapter", variant: "destructive" })
  }

  const uploadQuestions = async () => {
    try {
      const parsed = JSON.parse(json)
      const res = await fetch("/api/admin/upload-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      const data = await res.json()
      if (res.ok) toast({ title: "Uploaded", description: `${data.inserted} questions inserted` })
      else toast({ title: "Upload failed", description: data?.error || "Error", variant: "destructive" })
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: String(e), variant: "destructive" })
    }
  }

  return (
    <main className="p-4 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-pretty">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder="Class name" value={className} onChange={(e) => setClassName(e.target.value)} />
            <Button onClick={addClass} disabled={!className}>
              Add
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Existing: {classes?.map((c: any) => c.name).join(", ")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select onValueChange={setSelectedClass}>
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
          <div className="flex gap-2">
            <Input placeholder="Subject name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
            <Button onClick={addSubject} disabled={!subjectName || !selectedClass}>
              Add
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Existing: {subjects?.map((s: any) => s.name).join(", ")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage Chapters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select onValueChange={setSelectedSubject}>
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
          <div className="flex gap-2">
            <Input placeholder="Chapter name" value={chapterName} onChange={(e) => setChapterName(e.target.value)} />
            <Button onClick={addChapter} disabled={!chapterName || !selectedSubject}>
              Add
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Existing: {chapters?.map((ch: any) => ch.name).join(", ")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Question Bank (JSON)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={8}
            placeholder='[{ "text": "...", "options":[{"key":"A","text":".."}], "correctOptionKey":"A", "classId":"...", "subjectId":"...", "chapterId":"..." }]'
            value={json}
            onChange={(e) => setJson(e.target.value)}
          />
          <Button onClick={uploadQuestions} disabled={!json}>
            Upload
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
