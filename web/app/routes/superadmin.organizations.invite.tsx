import { ActionFunctionArgs, json } from "@remix-run/cloudflare";
import { getAuth } from "~/lib/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context.cloudflare.env as Env);
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const organizationId = formData.get("organizationId") as string;

  try {
    // You'll need to implement this API endpoint in your better-auth setup
    await auth.api.inviteOrganizationOwner({
      email,
      organizationId,
    });

    return json({ success: true });
  } catch (error) {
    return json(
      { error: "Failed to invite organization owner" },
      { status: 400 }
    );
  }
}
