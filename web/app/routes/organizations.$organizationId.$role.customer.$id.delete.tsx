// implement Remix action to delete customer by id given in params argument
import { and, eq } from "drizzle-orm";
import { redirect } from "react-router";
import { database } from "~/db/context";
import { customerTable } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import type { Route } from "./+types/organizations.$organizationId.$role.customer.$id.delete";

export const action = async ({
  params,
  context,
  request,
}: Route.ActionArgs) => {
  const auth = getAuth(context.cloudflare.env as Env);

  const { organizationId, role, id } = params;

  if (!organizationId || !role || !id) {
    throw new Error("Organization ID, role, and ID are required");
  }

  // First get the user's permission
  const customerDeletePermission = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        customer: ["delete"],
      },
    },
  });

  if (!customerDeletePermission.success) {
    throw new Error("Unauthorized");
  }

  // db1 of cloudflare does not support SQL transactions. https://github.com/drizzle-team/drizzle-orm/issues/2463 & https://blog.cloudflare.com/whats-new-with-d1/
  const db = database();

  await db
    .delete(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.id, id)
      )
    )
    .execute();

  return redirect(`../../customers`);
};
