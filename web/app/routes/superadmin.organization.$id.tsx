import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { FieldErrors } from "react-hook-form";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import { OrganizationFormType, resolver } from "~/lib/organization";

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<OrganizationFormType>;
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!db || !user) {
    throw new Error("Unauthorized");
  }

  if (!params.id) {
    throw new Error("Organization ID is required");
  }

  const organizations = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.id, params.id))
    .execute();

  if (!organizations.length) {
    throw new Error("Organization not found");
  }

  return { organization: organizations[0] };
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  if (!params.id) {
    throw new Error("Organization ID is required");
  }

  const { errors, data } = await getValidatedFormData<OrganizationFormType>(
    request,
    resolver,
    false
  );

  if (errors) {
    return Response.json({ errors });
  }

  try {
    await db
      .update(organizationTable)
      .set({
        ...data,
        metadata: data.metadata ?? undefined,
        updatedAt: new Date(),
      })
      .where(eq(organizationTable.id, params.id))
      .returning();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export default function EditOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useLoaderData<typeof loader>();

  const form = useRemixForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: organization,
  });

  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
      navigate("/superadmin/organizations");
    }

    if (actionData?.error) {
      toast({
        title: "Error",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Organization</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/superadmin/organizations")}
        >
          Cancel
        </Button>
      </div>

      {actionData?.error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {actionData.error}
        </div>
      )}

      <OrganizationForm form={form} mode="edit" onSubmit={form.handleSubmit} />
    </div>
  );
}
