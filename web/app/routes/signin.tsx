import { Link, useNavigate } from '@remix-run/react'
import { Loader2, LogInIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { EmptyGridBackground } from '~/components/ui/emptyBackground'
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { signIn } from "~/lib/auth.client"

type FormState = "YetToStartLogin" | "LoginInProgress" | "LoginFailed" | "LoginSuccess";

export default function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>("YetToStartLogin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormState("LoginInProgress");
      await signIn.email({ email, password }, {
        onRequest: (ctx) => {
          // show loading state
        },
        onSuccess: (ctx) => {
          navigate("/provider/customers")
          setFormState("LoginSuccess");
        },
        onError: (ctx) => {
          setFormState("LoginFailed");
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
              <Button
                className="w-full"
                disabled={formState === "LoginInProgress"}
              >

                {formState === "LoginInProgress" ?
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : (<span className="transition-all duration-200 group-hover:-rotate-12">
                    <LogInIcon className="h-3.5 w-3.5" />
                  </span>)
                }
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
    </div>)
}