import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "react-router";
import { themeSessionResolver } from "./sessions.server";

import clsx from "clsx";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { Toaster } from "./components/ui/toaster";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

type LoaderDataType = {
  theme: Theme;
  ENV: {
    BETTER_AUTH_URL: string;
  };
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { getTheme } = await themeSessionResolver(request);

  return Response.json({
    theme: getTheme(),
    ENV: {
      BETTER_AUTH_URL: context.cloudflare.env.BETTER_AUTH_URL,
    },
  });
}

function App({ data }: { readonly data: LoaderDataType }) {
  const [theme] = useTheme();
  const bgClass =
    theme === "dark"
      ? "bg-gradient-to-b from-zinc-800 via-stone-800 to-zinc-900"
      : "bg-gradient-to-b from-silver-100 to-white";

  return (
    <html
      lang="en"
      className={clsx(theme)}
      style={{ colorScheme: theme ?? "inherit" }}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} />
        <Links />
      </head>
      <body>
        <div className={bgClass}>
          <Outlet />
          <Toaster />
        </div>
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

export default function AppWithProviders() {
  const data = useLoaderData<LoaderDataType>();

  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/action/set-theme"
      disableTransitionOnThemeChange={true}
    >
      <App data={data} />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        Work in progress! Something unexpected happened {(error as any).message}
        .
        <Scripts />
      </body>
    </html>
  );
}
