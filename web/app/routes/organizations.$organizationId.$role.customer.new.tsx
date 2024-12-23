import { zodResolver } from "@hookform/resolvers/zod";
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { useActionData, useNavigate, useParams } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { CustomerForm } from "~/components/customer-form";
import { Button } from "~/components/ui/button";

import { database } from "~/db/context";
import { customerTable, organizationMembership } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import type { Route } from "./+types/organizations.$organizationId.$role.customer.new";

const insertCustomerSchema = createInsertSchema(customerTable, {
  // createdAt: z.date({ coerce: true }),
  // updatedAt: z.date({ coerce: true }),
  // addedByUserId: z.undefined(),
  // organizationId: z.undefined(),
});

const resolver = zodResolver(insertCustomerSchema);

type CustomerFormType = z.infer<typeof insertCustomerSchema>;

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<CustomerFormType>;
};

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { role } = params;

  const auth = getAuth(context.cloudflare.env as Env);

  const customerCreatePermission = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        customer: ["create"],
      },
    },
  });

  if (!customerCreatePermission.success) {
    throw new Error("Unauthorized");
  }

  return Response.json({ success: true });
}

export async function action({ request, context }: Route.ActionArgs) {
  const { user } = context.cloudflare.var;

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
    const userOrgs = await db
      .select()
      .from(organizationMembership)
      .where(eq(organizationMembership.userId, user!.id))
      .execute();

    if (userOrgs.length === 0) {
      throw new Error("User has no org assigned");
    }

    const userOrg = userOrgs[0];

    await db
      .insert(customerTable)
      .values({
        ...data,
        organizationId: userOrg.organizationId,
        addedByUserId: user!.id,
      })
      .returning();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to save customer" }, { status: 500 });
  }
}

export default function AddCustomer() {
  const params = useParams();
  const navigate = useNavigate();
  const { organizationId } = params;
  const form = useRemixForm<CustomerFormType>({
    mode: "onSubmit",
    resolver,
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
    <CustomerForm
      actionData={actionData}
      organizationId={organizationId}
      form={form}
    />
  );
}
