import { useNavigate } from "@remix-run/react";
import React, { useEffect } from "react";
import { signOut } from "~/lib/auth.client";
import { Button } from "../components/ui/button";

export async function loader() {
  return { isSigningOut: true };
}

export default function SignOut() {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const navigate = useNavigate();

  const signOutAsync = async () => {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  }

  useEffect(() => {
    signOutAsync();
  }, []);

  if (isSigningOut) {
    return <p>Signing out...</p>;
  }


  return (
    <div>
      <p>Sign out successful</p>
      <Button onClick={() => navigate("/")}>Home</Button>
    </div>
  );
}
