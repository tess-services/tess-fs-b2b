import { useNavigate } from "react-router";
import React, { useEffect } from "react";
import { signOut } from "~/lib/auth.client";
import { Button } from "../components/ui/button";
import { removeUserSession } from "~/lib/localStorageManager";
import { HomeIcon } from "@heroicons/react/24/outline";

export async function loader() {
  return { isSigningOut: true };
}

export default function SignOut() {
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const navigate = useNavigate();

  const signOutAsync = async () => {
    setIsSigningOut(true);
    removeUserSession();
    await signOut();
    setIsSigningOut(false);
  };

  useEffect(() => {
    signOutAsync();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
        {isSigningOut ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
            </div>
            <p className="text-gray-600">Signing you out securely...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                You've been signed out successfully!
              </h2>
              <p className="text-gray-600">
                Thank you for using our service. Have a great day! 👋
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="inline-flex items-center space-x-2 transition-transform hover:scale-105"
            >
              <HomeIcon className="h-5 w-5" />
              <span>Return Home</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
