import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Biz Solutions Provider" },
    { name: "description", content: "Biz solutions provider" },
  ];
};

export default function Index() {
  return (

    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex justify-between mb-8 max-w-screen-xl mx-auto w-full">
        <Link to="/signup" className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-md">Sign up</Link>
        <Link to="/signin" className="px-4 py-2 text-gray-700 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-500 transition-all duration-200 font-semibold">Login</Link>

      </nav>
      <div className="flex flex-col items-center gap-16">

        <header className="flex flex-col items-center gap-9">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Welcome to, <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500">Biz Solutions Provider</span>
          </h1>

        </header>
        <div className="h-[144px] w-[434px]">
          <img
            src="/assets/logo.webp"
            alt="logo"
            className="block w-full"
          />
        </div>

      </div>
    </div>
  );
}

