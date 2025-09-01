"use client"

import { useEffect, useMemo, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

type Attempt = {
  id: string
  score: number
  total: number
  percent: number
  createdAt: string
}

type ProgressResponse = {
  name: string
  totalAttempts: number
  avgPercent: number
  bestPercent: number
  attempts: Attempt[]
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AnalyticsPage() {
  const [name, setName] = useState("")
  const [temp, setTemp] = useState("")

  useEffect(() => {
    try {
      const n = localStorage.getItem("studentName") || ""
      setName(n)
      setTemp(n)
    } catch {}
  }, [])

  const { data, isLoading, mutate } = useSWR<ProgressResponse>(
    name ? `/api/progress?name=${encodeURIComponent(name)}` : null,
    fetcher,
  )

  const saveName = () => {
    const n = temp.trim()
    setName(n)
    try {
      localStorage.setItem("studentName", n)
    } catch {}
    if (n) mutate()
  }

  const chartData = useMemo(() => {
    const attempts = data?.attempts || []
    // API returns newest first; chart wants oldest first
    return attempts
      .slice()
      .reverse()
      .map((a, idx) => ({
        idx: idx + 1,
        label: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        percent: a.percent,
      }))
  }, [data])

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Analytics & Reports</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
          <Link href="/test">
            <Button>Test</Button>
          </Link>
        </div>
      </header>

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2 md:grid-cols-[1fr_auto] items-center">
            <Input placeholder="Your name" value={temp} onChange={(e) => setTemp(e.target.value)} />
            <Button onClick={saveName} className="md:ml-3 mt-2 md:mt-0">
              Load
            </Button>
          </div>
          {name ? <p className="mt-2 text-sm text-muted-foreground">Viewing analytics for: {name}</p> : null}
        </CardContent>
      </Card>

      {!name ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Enter your name to load analytics.</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      ) : !data ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Could not load analytics.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.totalAttempts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average %</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.avgPercent}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Best %</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{data.bestPercent}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="idx" tickFormatter={(v) => `#${v}`} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percent"]}
                      labelFormatter={(label) => `Attempt ${label}`}
                    />
                    <Line type="monotone" dataKey="percent" stroke="currentColor" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Shows percent score across attempts (older to newer).
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}
