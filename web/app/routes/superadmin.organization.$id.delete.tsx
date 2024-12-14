// implement Remix action to delete customer by id given in params argument
import { and, eq } from "drizzle-orm";
import { redirect } from "react-router";
import { database } from "~/db/context";
import { organizationTable } from "~/db/schema";
import { Route } from "./+types/superadmin.organization.$id.delete";

export const action = async ({ params }: Route.ActionArgs) => {
  const organizationId = params.id;

  if (!organizationId) {
    throw new Error("Customer ID is required");
  }

  const db = database();
  await db
    .delete(organizationTable)
    .where(and(eq(organizationTable.id, organizationId)))
    .execute();

  return redirect("/superadmin/organizations");
};
