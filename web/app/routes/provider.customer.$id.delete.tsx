// implement Remix action to delete customer by id given in params argument
import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { and, eq } from "drizzle-orm";
import { customerTable, userOrganizationTable } from "~/db/schema";

export const action = async ({ params, context }: ActionFunctionArgs) => {
  const { db, user } = context.cloudflare.var;

  const customerId = params.id;

  if (!customerId) {
    throw new Error("Customer ID is required");
  }

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const userOrg = await db.select().from(userOrganizationTable)
    .where(eq(userOrganizationTable.userId, user.id)).execute();


  if (userOrg.length === 0) {
    throw new Error("Unauthorized");
  }
  const userOrganization = userOrg[0];

  // db1 of cloudflare does not support SQL transactions. https://github.com/drizzle-team/drizzle-orm/issues/2463 & https://blog.cloudflare.com/whats-new-with-d1/

  await db.delete(customerTable).where(and(eq(customerTable.organizationId, userOrganization.organizationId),
    eq(customerTable.id, customerId))).execute();


  return redirect("/provider/customers");
};
