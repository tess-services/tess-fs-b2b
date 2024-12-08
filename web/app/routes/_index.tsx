import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { TessMenuBar } from "~/components/TessMenuBar";
import { useUserSession } from "~/lib/localStorageManager";

export const meta: MetaFunction = () => {
  return [
    { title: "Biz Solutions Provider" },
    { name: "description", content: "Biz solutions provider" },
  ];
};

const GreenTickMark = () => (
  <svg
    className="h-6 w-6 flex-none text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// At the top of the file
const API_STACK_ITEMS = {
  'Hono JS Runtime': 'https://hono.dev',
  'Cloudflare R2 Storage': 'https://developers.cloudflare.com/r2/',
  'D1 Database': 'https://developers.cloudflare.com/d1/',
  'Drizzle ORM': 'https://orm.drizzle.team'
} as const;

const WEB_STACK_ITEMS = {
  'Remix - Modern React Framework': 'https://remix.run',
  'Shadcn UI & Tailwind CSS': 'https://ui.shadcn.com',
  'Better Auth Authentication': 'https://www.better-auth.com/',
  'TypeScript': 'https://www.typescriptlang.org'
} as const;

export default function Index() {
  const [userSession] = useUserSession();

  if (userSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <TessMenuBar
          menuItemMeta={[]}
          name={userSession.name}
          email={userSession.email}
        />
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 p-8">
          Welcome back, {userSession.name}
        </h1>
        {userSession.organizationName && (
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500 p-16">
            Your active organization is{" "}
            <a
              href={`/organizations/${userSession.activeOrganizationId}/${userSession.role}`}
            >
              {userSession.organizationName}
            </a>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex justify-between mb-8 max-w-screen-xl mx-auto w-full">
        <Link
          to="/signup"
          className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-all duration-200 font-semibold shadow-md"
        >
          Sign up
        </Link>
        <Link
          to="/signin"
          className="px-4 py-2 text-gray-700 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-500 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-500 dark:hover:text-purple-400 transition-all duration-200 font-semibold dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Login
        </Link>
      </nav>
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
            Welcome to,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-500">
              Biz Solutions Provider
            </span>
          </h1>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Modern Fullstack Application Template
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A powerful starter template combining the best of modern web
              technologies for building scalable B2B applications.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Web Stack */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Web Stack
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                {Object.entries(WEB_STACK_ITEMS).map(([name, url]) => (
                  <li key={name} className="flex items-center">
                    <GreenTickMark />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 ml-2"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* API Stack */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                API Stack
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                {Object.entries(API_STACK_ITEMS).map(([name, url]) => (
                  <li key={name} className="flex items-center">
                    <GreenTickMark />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400 ml-2"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Start */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Quick Start
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    1. bun install
                  </code>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    2. bun run migration:apply:local
                  </code>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    3. bun run dev
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Ready to start building your next B2B application?
            </p>
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
              Get Started
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
