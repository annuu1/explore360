import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-balance">Study App</h1>
        <p className="text-muted-foreground">
          Take chapter-wise MCQ tests, track your progress, and analyze performance. Admins can upload question banks
          and manage classes, subjects, and chapters.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/register">Register</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/test">Start Test</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/upload">Admin Upload</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/profile">Profile</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/analytics">Analytics</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
