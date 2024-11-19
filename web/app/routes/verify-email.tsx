import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { verifyEmail } from "~/lib/auth.client";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get("token");

  const verify = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError("Token not found");
      setLoading(false);
      return;
    }

    try {
      await verifyEmail({ query: { token } },
        {
          onSuccess: (ctx) => {
            // redirect to signin with message that email is verified
            navigate("/signin?verified=true");
          },
          onError: (ctx) => {
            alert(JSON.stringify(ctx.error, null, 2))
          },
        });

      setSuccess(true);
    } catch (error) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
  }, [token]);

  return (
    <div>
      {loading && <p>Verifying...</p>}
      {error && <p>Error: {error}</p>}
      {success && <p>Success! Your email has been verified.</p>}
    </div>
  );
}