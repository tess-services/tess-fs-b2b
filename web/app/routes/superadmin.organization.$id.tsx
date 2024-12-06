import { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useNavigate } from "react-router";
import { eq } from "drizzle-orm";
import { FieldErrors, useForm } from "react-hook-form";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import { OrganizationFormType, resolver } from "~/lib/organization";
import { organization as authOrganizationClient } from "~/lib/auth.client";

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

export default function EditOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { organization } = useLoaderData<typeof loader>();

  const form = useForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: organization,
  });

  const updateOrg = async (data: OrganizationFormType) => {
    try {
      await authOrganizationClient.update({
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo ?? undefined,
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

      <OrganizationForm form={form} mode="edit" onSubmit={updateOrg} />
    </div>
  );
}
