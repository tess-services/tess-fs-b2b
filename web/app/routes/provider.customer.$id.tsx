import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { CustomerForm } from "~/components/customer-form";
import { Button } from "~/components/ui/button";
import { customerOrganizationMapping, customerTable, userOrganizationTable } from "~/db/schema";

const updateCustomerSchema = createInsertSchema(customerTable, {
  addedByUserId: z.undefined(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  addedByUserId: true,
});

const resolver = zodResolver(updateCustomerSchema);
type CustomerFormType = z.infer<typeof updateCustomerSchema>;

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<CustomerFormType>;
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;
  const { id } = params;

  if (!user || !db || !id) {
    throw new Error("Unauthorized or Invalid ID");
  }

  // Get user's organization
  const userOrg = await db.select().from(userOrganizationTable)
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  if (userOrg.length === 0) {
    throw new Error("Unauthorized or Invalid ID");

  }

  // Get customer data
  const customers = await db.select()
    .from(customerTable)
    .innerJoin(customerOrganizationMapping, eq(customerTable.id, customerOrganizationMapping.customerId))
    .where(
      and(eq(customerOrganizationMapping.organizationId, userOrg[0].organizationId),
        eq(customerTable.id, id))
    )
    .execute();

  if (customers.length === 0) {
    throw new Error("Customer not found");
  }

  return json({
    organizationId: userOrg[0].organizationId,
    customer: customers[0].customer
  });
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;
  const { id } = params;

  if (!user || !db || !id) {
    throw new Error("Unauthorized or Invalid ID");
  }

  const { errors, data } = await getValidatedFormData<CustomerFormType>(
    request,
    resolver,
    false,
  );

  if (errors) {
    return json({ errors });
  }

  try {
    // Verify user has access to this customer via organization
    const userOrg = await db.select().from(userOrganizationTable)
      .where(eq(userOrganizationTable.userId, user.id)).execute();

    if (userOrg.length === 0) {
      throw new Error("User has no org assigned");
    }

    const customerOrg = await db.select()
      .from(customerOrganizationMapping)
      .where(
        and(
          eq(customerOrganizationMapping.customerId, id),
          eq(customerOrganizationMapping.organizationId, userOrg[0].organizationId)))
      .execute();

    if (customerOrg.length === 0) {
      throw new Error("Unauthorized to edit this customer");
    }
    // Update customer
    await db.update(customerTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(customerTable.id, id));

    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export default function EditCustomer() {
  const { organizationId, customer } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<ActionData>();

  const form = useRemixForm<CustomerFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: customer,
  });

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
    <CustomerForm
      actionData={actionData}
      organizationId={organizationId}
      form={form}
      mode="edit"
    />
  );
}
