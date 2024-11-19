import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { CustomerForm } from "~/components/customer-form";
import { Button } from "~/components/ui/button";

import { customerOrganizationMapping, customerTable, userOrganizationTable } from "~/db/schema";

const insertCustomerSchema = createInsertSchema(customerTable, {
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
  addedByUserId: z.undefined(),
});

const resolver = zodResolver(insertCustomerSchema);

type CustomerFormType = z.infer<typeof insertCustomerSchema>;

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<CustomerFormType>;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const organization = await db.select().from(userOrganizationTable)
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  if (organization.length === 0) {
    return Response.json({ organizationId: null });
  }

  return Response.json({ organizationId: organization[0].organizationId });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const { errors, data } = await getValidatedFormData<CustomerFormType>(
    request,
    resolver,
    false,
  );

  if (errors) {
    return Response.json({ errors });
  }

  try {
    const userOrgs = await db.select().from(userOrganizationTable)
      .where(eq(userOrganizationTable.userId, user.id)).execute();

    if (userOrgs.length === 0) {
      throw new Error("User has no org assigned");
    }

    const userOrg = userOrgs[0];

    const [newCust] = await db.insert(customerTable).values({
      ...data,
      addedByUserId: user.id,
    }).returning();

    await db.insert(customerOrganizationMapping)
      .values({
        organizationId: userOrg.organizationId,
        customerId: newCust.id,
      })

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to save customer" }, { status: 500 });
  }
}

export default function AddCustomer() {
  const { organizationId } = useLoaderData<{ organizationId: string | null }>();
  const navigate = useNavigate();

  const form = useRemixForm<CustomerFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: {
      isCommercial: false,
    },
  });
  const actionData = useActionData<ActionData>();

  if (!organizationId) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1>Organization Profile Required</h1>
        <p>Please set up your organization profile first.</p>
        <Button onClick={() => navigate("../organization")}>
          Set Up Organization
        </Button>
      </div>
    );
  }

  return (
    <CustomerForm actionData={actionData} organizationId={organizationId} form={form} />
  );
}