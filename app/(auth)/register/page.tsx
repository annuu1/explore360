"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"student" | "admin">("student")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: "Registered. You can now sign in." })
      router.push("/login")
    } else {
      const data = await res.json()
      toast({ title: "Registration failed", description: data?.error || "Error", variant: "destructive" })
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold text-pretty">Create account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="role" checked={role === "student"} onChange={() => setRole("student")} />
              Student
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="role" checked={role === "admin"} onChange={() => setRole("admin")} />
              Admin
            </label>
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
      </div>
    </main>
  )
}
