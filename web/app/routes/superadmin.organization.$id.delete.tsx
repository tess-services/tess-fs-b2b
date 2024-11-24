// implement Remix action to delete customer by id given in params argument
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { organizationTable } from "~/db/schema";
import { isSuperAdmin } from "~/lib/isSuperAdmin";

export const action = async ({ params, context }: ActionFunctionArgs) => {
  const { db, user } = context.cloudflare.var;

  const organizationId = params.id;

  if (!organizationId) {
    throw new Error("Customer ID is required");
  }

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  await db.delete(organizationTable).where(and(eq(organizationTable.id, organizationId))).execute();


  return redirect("/superadmin/organizations");
};
