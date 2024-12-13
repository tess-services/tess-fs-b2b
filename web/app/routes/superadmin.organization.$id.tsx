import { eq } from "drizzle-orm";
import { FieldErrors } from "react-hook-form";
import { ActionFunctionArgs, LoaderFunctionArgs, useActionData, useLoaderData, useNavigate } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { OrganizationForm } from "~/components/organization-form";
import { imageFileMetadata, organizationTable } from "~/db/schema";
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

  const { id } = params;
  if (!id) {
    throw new Error("Organization ID is required");
  }

  const organizations = await db
    .select()
    .from(organizationTable)
    .leftJoin(
      imageFileMetadata,
      eq(organizationTable.id, imageFileMetadata.attachedEntityId)
    )
    .where(eq(organizationTable.id, id))
    .execute();

  if (organizations.length === 0) {
    throw new Error("Organization not found");
  }

  return {
    organization: organizations[0].organization,
    imageMetaData: organizations[0].imageFileMetadata,
  };
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;
  const { id } = params;

  if (!user || !db || !id) {
    throw new Error("Unauthorized or Invalid ID");
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
    // Update organization
    await db
      .update(organizationTable)
      .set({
        name: data.name,
        slug: data.slug,
        metadata: data.metadata,
        updatedAt: new Date(),
      })
      .where(eq(organizationTable.id, id));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export default function EditOrganization() {
  const { organization, imageMetaData } = useLoaderData<{
    organization: OrganizationFormType;
    imageMetaData: any;
  }>();
  const actionData = useActionData<ActionData>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useRemixForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: organization,
  });

  if (actionData?.success) {
    toast({
      title: "Success",
      description: "Organization updated successfully",
    });
    navigate("/superadmin/organizations")
  }

  if (actionData?.error) {
    toast({
      title: "Error",
      description: actionData.error,
      variant: "destructive",
    });
    navigate("/superadmin/organizations")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Organization</h1>
      </div>

      <div className="grid gap-8">
        <OrganizationForm
          form={form}
          mode="edit"
          logoUrl={imageMetaData?.imageUrl}
          actionData={actionData}
        />
      </div>
    </div>
  );
}
