import { desc } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";
import { Trash2Icon } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";
import { z } from "zod";
import { InviteOrgAdmin } from "~/components/invite-org-admin";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { database } from "~/db/context";
import { organizationMembership, organizationTable } from "~/db/schema";
import { selectOrganizationSchema } from "~/lib/organization";
import type { Route } from "./+types/superadmin.organizations";

type OrganizationRow = z.infer<typeof selectOrganizationSchema> & {
  hasOwner: boolean;
};

export async function loader({ context }: Route.LoaderArgs) {
  const db = database();

  const organizations = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
      metadata: organizationTable.metadata,
      hasOwner: sql<boolean>`EXISTS (
        SELECT 1 FROM ${organizationMembership} 
        WHERE ${organizationMembership.organizationId} = ${organizationTable.id} 
        AND ${organizationMembership.role} = 'owner'
      )`.as("hasOwner"),
    })
    .from(organizationTable)
    .orderBy(desc(organizationTable.updatedAt))
    .execute();

  return Response.json({ organizations });
}

export default function Organizations() {
  const { organizations } = useLoaderData<{
    organizations: OrganizationRow[];
  }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Organizations</h1>
        <Button onClick={() => navigate("/superadmin/organization/new")}>
          Add new organization
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile</TableHead>
          <TableHead>Has owner</TableHead>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => {
            return (
              <TableRow key={org.id}>
                <TableCell className="underline decoration-2 decoration-blue-400 hover:decoration-yellow-400">
                  <Link to={`/superadmin/organization/${org.id}`}>
                    {org.name}
                  </Link>
                </TableCell>
                <TableCell>{org.metadata?.businessAddress}</TableCell>
                <TableCell>{org.metadata?.email}</TableCell>
                <TableCell>{org.metadata?.phone}</TableCell>
                <TableCell>
                  {org.hasOwner ? (
                    "Yes"
                  ) : (
                    <InviteOrgAdmin organizationId={org.id} />
                  )}
                </TableCell>
                <TableCell>
                  <form
                    method="post"
                    action={`/superadmin/organization/${org.id}/delete`}
                  >
                    <Button variant="outline" size="icon" type="submit">
                      <Trash2Icon />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
