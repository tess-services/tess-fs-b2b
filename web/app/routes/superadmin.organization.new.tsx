import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { FieldErrors } from "react-hook-form";
import { useActionData, useNavigate } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { database } from "~/db/context";
import { organizationTable } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import { OrganizationFormType, resolver } from "~/lib/organization";
import type { Route } from "./+types/superadmin.organization.new";


export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<OrganizationFormType>;
};

// export async function loader({ context }: Route.LoaderArgs) {
//   const { user } = context.cloudflare.var;

//   if (!user) {
//     throw new Error("Unauthorized");
//   }

//   return null;
// }

export async function action({ context, request }: Route.ActionArgs) {
  const { errors, data } = await getValidatedFormData<OrganizationFormType>(request, resolver, false);

  if (errors) {
    return Response.json({ errors });
  }

  if (data) {
    try {
      const { metadata, ...dataWithoutMetadata } = data;
      const auth = getAuth(context.cloudflare.env);
      await auth.api.createOrganization({
        headers: request.headers,
        body: dataWithoutMetadata
      });
      const db = database();
      await db.update(organizationTable).set({ metadata }).where(eq(organizationTable.id, dataWithoutMetadata.id));

      return Response.json({ success: true });
    } catch (error) {
      return Response.json(
        { error: "Failed to create organization", errors: error },
        { status: 400 }
      );
    }
  }

  return Response.json({ error: "Invalid data" }, { status: 400 });
}

export default function AddOrganization() {
  const navigate = useNavigate();

  const form = useRemixForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: {
      id: nanoid(),
      name: undefined,
      slug: undefined,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const actionData = useActionData<ActionData>();
  console.log(form.formState.errors)
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

      <OrganizationForm form={form} mode="new" actionData={actionData} />
    </div>
  );
}
