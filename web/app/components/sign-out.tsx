

import { useNavigate } from "@remix-run/react";
import React from "react";
import { signOut } from "~/lib/auth.client";
import { Button } from "./ui/button";

export const SignOut = () => {
  const [isSignOut, setIsSignOut] = React.useState(false);
  const navigate = useNavigate();
  if (isSignOut) {
    return <Button className="gap-2 z-10" variant="secondary" disabled>Signing out...</Button>;
  }

  return (
    <Button
      className="p-0"
      variant="ghost"
      onClick={async () => {
        setIsSignOut(true);
        await signOut();
        setIsSignOut(false);
        navigate("/signin");
      }}
    >Sign out</Button>);
}
