"use client"
import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProfilePage() {
  const { data: profile, mutate: mProfile } = useSWR("/api/profile", fetcher)
  const { data: classes } = useSWR("/api/admin/catalog/classes", fetcher)
  const [classId, setClassId] = useState<string>("")
  const { data: subjects } = useSWR(classId ? `/api/admin/catalog/subjects?classId=${classId}` : null, fetcher)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const { data: chapters } = useSWR(
    selectedSubject ? `/api/admin/catalog/chapters?subjectId=${selectedSubject}` : null,
    fetcher,
  )

  const [name, setName] = useState("")
  const subjectIds = useMemo<string[]>(() => profile?.subjectIds || [], [profile])
  const completed = useMemo<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    for (const item of profile?.completedChapters || []) {
      m[`${item.subjectId}:${item.chapterId}`] = true
    }
    return m
  }, [profile])

  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setClassId(profile.classId || "")
    }
  }, [profile])

  const saveProfile = async () => {
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, classId, subjectIds }),
    })
    mProfile()
  }

  const toggleSubject = (id: string) => {
    const set = new Set(subjectIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    // @ts-ignore
    profile.subjectIds = Array.from(set)
    mProfile({ ...profile }, { revalidate: false })
  }

  const toggleCompleted = async (chapterId: string, checked: boolean) => {
    await fetch("/api/profile/completed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: selectedSubject, chapterId, completed: checked }),
    })
    mProfile()
  }

  return (
    <main className="p-4 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-pretty">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={classId} onValueChange={setClassId}>
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
          <Button onClick={saveProfile} className="w-full">
            Save
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subjects (select interest)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subjects?.map((s: any) => {
            const checked = (subjectIds || []).includes(s._id)
            return (
              <label key={s._id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checked} onChange={() => toggleSubject(s._id)} />
                {s.name}
              </label>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chapters Completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects?.map((s: any) => (
                <SelectItem key={s._id} value={s._id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            {chapters?.map((ch: any) => {
              const key = `${selectedSubject}:${ch._id}`
              const checked = !!completed[key]
              return (
                <div key={ch._id} className="flex items-center gap-2">
                  <Checkbox checked={checked} onCheckedChange={(v) => toggleCompleted(ch._id, Boolean(v))} />
                  <span className="text-sm">{ch.name}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
