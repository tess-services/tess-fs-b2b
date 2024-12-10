import { eq } from "drizzle-orm";
import { FieldErrors, useForm } from "react-hook-form";
import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { imageFileMetadata, organizationTable } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import { organization as authOrganizationClient } from "~/lib/auth.client";
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
    .leftJoin(
      imageFileMetadata,
      eq(organizationTable.id, imageFileMetadata.attachedEntityId)
    )
    .where(eq(organizationTable.id, params.id))
    .execute();

  if (!organizations.length) {
    throw new Error("Organization not found");
  }

  return {
    organization: organizations[0].organization,
    imageMetaData: organizations[0].imageFileMetadata,
  };
}

export default function EditOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization, imageMetaData } = useLoaderData<typeof loader>();

  const form = useForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: organization,
  });

  const updateOrg = async (data: OrganizationFormType) => {
    try {
      console.log("....data....", data);
      await authOrganizationClient.update({
        data: {
          name: data.name,
          slug: data.slug,
          metadata: data.metadata ?? undefined,
        },
        organizationId: data.id,
      });

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
      navigate("/superadmin/organizations");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form",
        variant: "destructive",
      });
    }
  };

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

      <OrganizationForm form={form} mode="edit" onSubmit={updateOrg} logoUrl={imageMetaData?.imageUrl} />
    </div>
  );
}
