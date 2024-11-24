import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useNavigate } from "@remix-run/react";
import { createInsertSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { OrganizationForm } from "~/components/organization-form";
import { isSuperAdmin } from "~/lib/isSuperAdmin";
import { useToast } from "~/hooks/use-toast";

const insertOrganizationSchema = createInsertSchema(organizationTable, {
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
  id: z.undefined(),
});

const resolver = zodResolver(insertOrganizationSchema);

type OrganizationFormType = z.infer<typeof insertOrganizationSchema>;

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<OrganizationFormType>;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { user } = context.cloudflare.var;
  const { SUPER_ADMIN_EMAILS } = context.cloudflare.env;

  if (!user || !isSuperAdmin(SUPER_ADMIN_EMAILS, user.email)) {
    throw new Error("Unauthorized");
  }

  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;
  const { SUPER_ADMIN_EMAILS } = context.cloudflare.env;

  if (!user || !isSuperAdmin(SUPER_ADMIN_EMAILS, user?.email) || !db) {
    throw new Error("Unauthorized");
  }

  const { errors, data } = await getValidatedFormData<OrganizationFormType>(
    request,
    resolver,
    false,
  );

  if (errors) {
    return Response.json({ errors });
  }

  try {
    await db.insert(organizationTable).values({
      ...data,
    }).returning();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to create organization" }, { status: 500 });
  }
}

export default function AddOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useRemixForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
  });
  const actionData = useActionData<ActionData>();

  if (actionData?.success) {
    toast({
      title: "Success",
      description: "Organization created successfully",
    });
    navigate("/superadmin/organizations");
    return null;
  }

  if (actionData?.error) {
    toast({
      title: "Error",
      description: actionData.error,
      variant: "destructive",
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Organization</h1>
        <Button variant="outline" onClick={() => navigate("/superadmin/organizations")}>
          Cancel
        </Button>
      </div>

      {actionData?.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {actionData.error}
        </div>
      )}

      <OrganizationForm form={form} />
    </div>
  );
}