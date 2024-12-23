import { zodResolver } from "@hookform/resolvers/zod";
import { and, eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { useActionData, useLoaderData, useNavigate } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { CustomerForm } from "~/components/customer-form";
import { Button } from "~/components/ui/button";
import { database } from "~/db/context";
import { customerTable, organizationMembership } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import type { Route } from "./+types/organizations.$organizationId.$role.customer.$id";

const updateCustomerSchema = createInsertSchema(customerTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  addedByUserId: true,
});
const selectCustomerScehma = createSelectSchema(customerTable);
type CustomerTable = z.infer<typeof selectCustomerScehma>;

const resolver = zodResolver(updateCustomerSchema);
type CustomerFormType = z.infer<typeof updateCustomerSchema>;

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<CustomerFormType>;
};

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const auth = getAuth(context.cloudflare.env);

  const { organizationId, role, id } = params;

  if (!organizationId || !role || !id) {
    throw new Error("Organization ID, role, and ID are required");
  }

  // First get the user's permission
  const customerUpdatePermission = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        customer: ["update"],
      },
    },
  });

  if (!customerUpdatePermission.success) {
    throw new Error("Unauthorized");
  }

  const db = database();
  // Get customer data
  const customers = await db
    .select()
    .from(customerTable)
    .where(
      and(
        eq(customerTable.organizationId, organizationId),
        eq(customerTable.id, id)
      )
    )
    .execute();

  if (customers.length === 0) {
    throw new Error("Customer not found");
  }

  return Response.json({
    organizationId: organizationId,
    customer: customers[0],
  });
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const { id } = params;

  if (!id) {
    throw new Error("Unauthorized or Invalid ID");
  }

  const { errors, data } = await getValidatedFormData<CustomerFormType>(
    request,
    resolver,
    false
  );

  if (errors) {
    return Response.json({ errors });
  }

  try {
    const db = database();
    const { user } = context.cloudflare.var;

    const userOrg = await db
      .select()
      .from(organizationMembership)
      .where(eq(organizationMembership.userId, user!.id))
      .execute();

    // Update customer
    await db
      .update(customerTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(customerTable.id, id),
          eq(customerTable.organizationId, userOrg[0].organizationId)
        )
      );

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export default function EditCustomer() {
  const { organizationId, customer } = useLoaderData<{
    organizationId: string;
    customer: CustomerTable;
  }>();
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
