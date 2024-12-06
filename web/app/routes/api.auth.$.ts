import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getAuth } from "~/lib/auth.server"; // Adjust the path as necessary

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context.cloudflare.env as Env);

  return auth.handler(request);
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context.cloudflare.env as Env);

  return auth.handler(request);
}
