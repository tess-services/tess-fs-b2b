import { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useParams } from "react-router";
import { and, eq } from "drizzle-orm";
import { useEffect } from "react";
import { TessMenuBar } from "~/components/TessMenuBar";
import { user, organizationMembership, organizationTable } from "~/db/schema";
import { setUserSession } from "~/lib/localStorageManager";
import { OrgRoles } from "~/lib/permissions";

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { db, user: currentUser } = context.cloudflare.var;

  if (!currentUser || !db) {
    throw new Error("Unauthorized");
  }

  const { organizationId, role } = params;

  if (!organizationId || !role) {
    throw new Error("Organization ID and role are required");
  }

  const userOrgMemberMap = await db
    .select()
    .from(organizationMembership)
    .innerJoin(user, eq(organizationMembership.userId, currentUser.id))
    .innerJoin(
      organizationTable,
      eq(organizationMembership.organizationId, organizationTable.id)
    )
    .where(
      and(
        eq(user.id, currentUser.id),
        eq(organizationMembership.organizationId, organizationId),
        eq(organizationMembership.role, role)
      )
    )
    .execute();

  if (userOrgMemberMap.length === 0) {
    throw new Error(`Unauthorized: User is not ${role} of this organization`);
  }

  return {
    [role]: true,
    name: userOrgMemberMap[0].user.name,
    email: userOrgMemberMap[0].user.email,
    organizationId,
    role: userOrgMemberMap[0].member.role,
    organizationName: userOrgMemberMap[0].organization.name,
  };
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

  if (role === "member") {
    return [
      { url: `/organizations/${orgId}/member/tasks`, label: "Tasks" },
      {
        url: `/organizations/${orgId}/member/projects`,
        label: "Projects",
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

  const { name, email, organizationName } = useLoaderData<{
    name: string;
    email: string;
    organizationName: string;
  }>();
  if (!role || !organizationId) {
    throw new Error("Organization ID and role are required");
  }

  useEffect(() => {
    setUserSession({
      name,
      email,
      activeOrganizationId: organizationId,
      role,
      organizationName,
    });
  }, [name, email, organizationName]);

  const orgMenuItems = getOrgRoleMenuItems(organizationId, role);

  return (
    <div className="min-h-screen flex flex-col">
      <TessMenuBar
        menuItemMeta={orgMenuItems}
        name={name}
        email={email}
        organizationName={organizationName}
      />
      <main className="flex-1 sm:mx-auto sm:w-full md:max-w-7xl lg:w-full md:px-8 lg:px-10 py-6">
        <Outlet />
      </main>
    </div>
  );
}
