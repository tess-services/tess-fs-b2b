import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { FieldErrors, useForm } from "react-hook-form";
import { type LoaderFunctionArgs, useNavigate } from "react-router";
import { z } from "zod";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";
import { organization as authOrganizationClient } from "~/lib/auth.client";
import { organizationMetadataSchema } from "~/lib/organization";

export const insertOrganizationSchema = createInsertSchema(organizationTable, {
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
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

  const form = useForm<CreateOrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: {
      id: nanoid(),
      name: undefined,
      slug: undefined,
      metadata: {},
    },
  });

  const createOrg = async (
    data: CreateOrganizationFormType
  ) => {
    try {
      await authOrganizationClient.create({
        name: data.name,
        slug: data.slug,
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

      <OrganizationForm form={form} onSubmit={createOrg} />
    </div>
  );
}
