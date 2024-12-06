import { Link, useNavigate, useSearchParams } from "react-router";
import { Loader2, LogInIcon } from "lucide-react";
import { useState } from "react";
import { CenterScreenContainer } from "~/components/CenterScreenContainer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { forgetPassword, signIn } from "~/lib/auth.client";
import { setUserSession } from "~/lib/localStorageManager";

type FormState =
  | "YetToStartLogin"
  | "LoginInProgress"
  | "LoginFailed"
  | "LoginSuccess"
  | "ForgotPasswordInProgress"
  | "ForgotPasswordFailed"
  | "ForgotPasswordSuccess";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [formState, setFormState] = useState<FormState>("YetToStartLogin");
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setFormState("LoginInProgress");
      setError("");

      await signIn.email(
        { email, password },
        {
          onRequest: (ctx) => {
            setFormState("LoginInProgress");
          },
          onSuccess: (ctx) => {
            setFormState("LoginSuccess");
            setUserSession({
              name: ctx.data.user.name,
              email: ctx.data.user.email,
            });

            if (ctx.data.user?.role === "admin") {
              navigate("/superadmin/organizations");
              return;
            }
            navigate("/onboarding");
          },
          onError: (ctx) => {
            setFormState("LoginFailed");
            if (ctx.error.message) {
              setError(ctx.error.message);
            }
          },
        }
      );
      // Handle successful sign-in (e.g., redirect or show a success message)
    } catch (error) {
      // Handle sign-in error (e.g., show an error message)
      console.error("Sign-in failed:", error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || email.includes("@") === false) {
      alert("Please enter your email to reset your password");
      return;
    }

    try {
      setFormState("ForgotPasswordInProgress");
      await forgetPassword({ email, redirectTo: "/reset-password" });
      setError("Password reset email sent");
      setFormState("ForgotPasswordSuccess");
      navigate("/signin");
    } catch (error) {
      console.error("Password reset failed:", error);
      alert("Password reset failed");
    }
  };

  const isInProgress =
    formState === "LoginInProgress" || formState === "ForgotPasswordInProgress";

  if (formState === "ForgotPasswordSuccess") {
    return (
      <CenterScreenContainer>
        <Card className="relative mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Please check your email and follow the instructions to reset your
              password
            </CardDescription>
          </CardHeader>
        </Card>
      </CenterScreenContainer>
    );
  }

  return (
    <CenterScreenContainer>
      <Card className="relative mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
            {searchParams.get("verified") && (
              <span className="text-green-500">
                {" "}
                Your email has been verified. You can now login.
              </span>
            )}
            {searchParams.get("registered") && (
              <span className="text-green-500">
                {" "}
                Your account has been created. Please check your email to verify
                your email first.
              </span>
            )}
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
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="ml-auto inline-block text-sm underline"
                    disabled={isInProgress}
                  >
                    {isInProgress ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <span className="transition-all duration-200 group-hover:-rotate-12">
                        Forgot your password?
                      </span>
                    )}
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-red-500 mb-2">{error}</div>}
              <Button className="w-full" disabled={isInProgress}>
                {isInProgress ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="transition-all duration-200 group-hover:-rotate-12">
                    <LogInIcon className="h-3.5 w-3.5" />
                  </span>
                )}
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
    </CenterScreenContainer>
  );
}
