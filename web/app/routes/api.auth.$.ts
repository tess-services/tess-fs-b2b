import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { initAuth } from '~/lib/auth.server'; // Adjust the path as necessary

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = initAuth(context.cloudflare.env as Env);

  return auth.handler(request)
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = initAuth(context.cloudflare.env as Env);

  return auth.handler(request)
}
