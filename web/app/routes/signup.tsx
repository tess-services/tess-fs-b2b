import { Link, useNavigate } from '@remix-run/react'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { EmptyGridBackground } from '~/components/ui/emptyBackground'
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { signUp } from "~/lib/auth.client"

type FormState = "Initial" | "Submitting" | "Error" | "Success";

export default function Signup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [formState, setFormState] = useState<FormState>("Initial")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("Submitting")
    setError("")

    await signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: (ctx) => {
          // show loading state
        },
        onSuccess: (ctx) => {
          setFormState("Success")
          navigate("/signin?registered=true")
        },
        onError: (ctx) => {
          console.log(ctx.error);
          if (ctx.error.status < 500) {
            setError(ctx.error.message)
          } else {
            setError("Signup failed. Please try again.")
          }
          setFormState("Error")
        },
      },
    )
  }

  const isSubmitting = formState === "Submitting"

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <EmptyGridBackground />

      <Card className="relative mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 mb-2">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="transition-all duration-200 group-hover:-rotate-12">
                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                  </span>
                )}
                Sign Up
              </Button>

              <Button variant="outline" disabled className="w-full">
                Sign up with Google
              </Button>
            </div>

            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link to="/signin" className="underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}