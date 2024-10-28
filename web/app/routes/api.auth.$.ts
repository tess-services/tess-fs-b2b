import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Bindings } from "server";
import { initAuth } from '~/lib/auth.server'; // Adjust the path as necessary

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = initAuth(context.cloudflare.env as Bindings);

  return auth.handler(request)
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = initAuth(context.cloudflare.env as Bindings);

  return auth.handler(request)
}
