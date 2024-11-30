import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useNavigate } from "@remix-run/react";
import { createInsertSchema } from "drizzle-zod";
import { FieldErrors } from "react-hook-form";
import { useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { OrganizationForm } from "~/components/organization-form";
import { useToast } from "~/hooks/use-toast";
import { organization as authOrganizationClient } from "~/lib/auth.client";
import { organizationMetadataSchema } from "~/lib/organization";

export const insertOrganizationSchema = createInsertSchema(organizationTable, {
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
  id: z.undefined(),
  metadata: organizationMetadataSchema,
});

export type CreateOrganizationFormType = z.infer<
  typeof insertOrganizationSchema
>;
const resolver = zodResolver(insertOrganizationSchema);

export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<CreateOrganizationFormType>;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { user } = context.cloudflare.var;

  if (!user) {
    throw new Error("Unauthorized");
  }

  return null;
}

export default function AddOrganization() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useRemixForm<CreateOrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: {
      name: undefined,
      slug: undefined,
      metadata: {},
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // resolve data values from form
    const values = form.getValues();
    createOrg(values);
  };

  const createOrg = async (data: CreateOrganizationFormType) => {
    try {
      console.log(".....data", data);
      const response = await authOrganizationClient.create({
        name: data.name,
        slug: data.slug,
        logo: data.logo ?? undefined,
        metadata: data.metadata ?? undefined,
      });

      toast({
        title: "Success",
        description: "Organization created successfully",
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
        <h1 className="text-2xl font-semibold">Add Organization</h1>
        <Button
          variant="outline"
          onClick={() => navigate("/superadmin/organizations")}
        >
          Cancel
        </Button>
      </div>

      <OrganizationForm form={form} onSubmit={handleSubmit} />
    </div>
  );
}
