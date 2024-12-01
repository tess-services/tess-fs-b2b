import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Outlet, useParams } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import { TessMenuBar } from "~/components/TessMenuBar";
import { organizationMembership } from "~/db/schema";
import { OrgRoles } from "~/lib/permissions";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const { organizationId, role } = params;

  if (!organizationId || !role) {
    throw new Error("Organization ID and role are required");
  }

  const membership = await db
    .select()
    .from(organizationMembership)
    .where(
      and(
        eq(organizationMembership.userId, user.id),
        eq(organizationMembership.organizationId, organizationId),
        eq(organizationMembership.role, role)
      )
    )
    .execute();

  if (membership.length === 0) {
    throw new Error(`Unauthorized: User is not ${role} of this organization`);
  }

  return { [role]: true };
}

const getOrgRoleMenuItems = (orgId: string, role: OrgRoles) => {
  if (role === "admin") {
    return [
      { url: `/organizations/${orgId}/admin/users`, label: "Users" },
      {
        url: `/organizations/${orgId}/admin/customers`,
        label: "Customers",
      },
    ];
  }
  return [];
};

export default function UserHome() {
  const { role, organizationId } = useParams<{
    role: OrgRoles;
    organizationId: string;
  }>();

  if (!role || !organizationId) {
    throw new Error("Organization ID and role are required");
  }

  const orgMenuItems = getOrgRoleMenuItems(organizationId, role);

  return (
    <div className="min-h-screen flex flex-col">
      <TessMenuBar menuItemMeta={orgMenuItems} />
      <main className="flex-1 sm:mx-auto sm:w-full md:max-w-7xl lg:w-full md:px-8 lg:px-10 py-6">
        <Outlet />
      </main>
    </div>
  );
}
