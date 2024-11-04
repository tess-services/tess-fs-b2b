import { json, type ActionFunction, type LoaderFunction } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { organizationTable, userOrganizationTable } from "~/db/schema";

export const loader: LoaderFunction = async ({ context }) => {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  // Find user's organization
  const userOrg = await db.select().from(userOrganizationTable).where(
    eq(userOrganizationTable.userId, user.id)
  ).innerJoin(organizationTable, eq(userOrganizationTable.organizationId, organizationTable.id)).execute();

  if (userOrg.length === 0) {
    return json({ organization: {} as typeof organizationTable });
  }

  return json({ organization: userOrg[0].organization });
};

export const action: ActionFunction = async ({ request, context }) => {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const abn = formData.get("abn") as string;
  const phone = formData.get("phone") as string;
  const businessAddress = formData.get("businessAddress") as string;
  const email = formData.get("email") as string;
  const tradeCurrency = formData.get("tradeCurrency") as string;
  const organizationId = formData.get("organizationId") as string;

  // Validation
  if (!name || !abn || !phone || !businessAddress || !email || !tradeCurrency) {
    return json({ error: "All fields are required" }, { status: 400 });
  }

  try {
    if (organizationId) {
      // Update existing organization
      await db
        .update(organizationTable)
        .set({
          name,
          abn,
          phone,
          businessAddress,
          email,
          tradeCurrency,
          updatedAt: new Date(),
        })
        .where(eq(organizationTable.id, organizationId));
    } else {
      // Create new organization
      const [newOrg] = await db
        .insert(organizationTable)
        .values({
          name,
          abn,
          phone,
          businessAddress,
          email,
          tradeCurrency,
        })
        .returning();

      // Create user-organization relationship
      await db.insert(userOrganizationTable).values({
        userId: user.id,
        organizationId: newOrg.id,
        isOwner: true,
      });
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: "Failed to save organization" }, { status: 500 });
  }
};

export default function OrganizationProfile() {
  const { organization } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {organization ? "Update Organization Profile" : "Create Organization Profile"}
      </h1>

      <Form method="post" className="space-y-4">
        {organization && (
          <input type="hidden" name="organizationId" value={organization.id} />
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Organization Name</label>
          <input
            type="text"
            name="name"
            defaultValue={organization?.name}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ABN</label>
          <input
            type="text"
            name="abn"
            defaultValue={organization?.abn}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            defaultValue={organization?.phone}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Business Address</label>
          <input
            type="text"
            name="businessAddress"
            defaultValue={organization?.businessAddress}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={organization?.email}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trade Currency</label>
          <select
            name="tradeCurrency"
            defaultValue={organization?.tradeCurrency || "AUD"}
            className="w-full border rounded-md px-3 py-2"
            required
          >
            <option value="AUD">AUD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        {/* {actionData?.error && (
          <div className="text-red-600 text-sm">{actionData.error}</div>
        )} */}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : organization
              ? "Update Organization"
              : "Create Organization"}
        </button>
      </Form>
    </div>
  );
};
