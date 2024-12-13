import { json } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { FieldErrors } from "react-hook-form";
import { ActionFunctionArgs, type LoaderFunctionArgs, useActionData, useNavigate } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { OrganizationForm } from "~/components/organization-form";
import { Button } from "~/components/ui/button";
import { organizationTable } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import { OrganizationFormType, resolver } from "~/lib/organization";


export type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<OrganizationFormType>;
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { user } = context.cloudflare.var;

  if (!user) {
    throw new Error("Unauthorized");
  }

  return null;
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }


  const { errors, data } = await getValidatedFormData<OrganizationFormType>(request, resolver, false);

  if (errors) {
    return Response.json({ errors });
  }

  if (data) {
    try {
      const { metadata, ...dataWithoutMetadata } = data;
      const auth = getAuth(context);
      await auth.api.createOrganization({
        headers: request.headers,
        body: dataWithoutMetadata
      });

      await db.update(organizationTable).set({ metadata }).where(eq(organizationTable.id, dataWithoutMetadata.id));

      return Response.json({ success: true });
    } catch (error) {
      return json(
        { error: "Failed to create organization", errors: error },
        { status: 400 }
      );
    }
  }

  return json({ error: "Invalid data" }, { status: 400 });
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
    },
  });
  const actionData = useActionData<ActionData>();

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
