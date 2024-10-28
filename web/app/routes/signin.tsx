import { Link, useNavigate } from '@remix-run/react'
import { useState } from 'react'
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { EmptyGridBackground } from '~/components/ui/emptyBackground'
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { signIn } from "~/lib/auth.client"

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn.email({ email, password }, {
        onRequest: (ctx) => {
          // show loading state
        },
        onSuccess: (ctx) => {
          navigate("/customers")
        },
        onError: (ctx) => {
          alert(JSON.stringify(ctx.error, null, 2))
        },
      })
      // Handle successful sign-in (e.g., redirect or show a success message)
    } catch (error) {
      // Handle sign-in error (e.g., show an error message)
      console.error('Sign-in failed:', error)
    }
  }

  return (
    // <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
    <div className="flex h-screen w-full items-center justify-center px-4">

      <EmptyGridBackground />

      <Card className="relative mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <Button variant="outline" disabled className="w-full">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>


  )
}