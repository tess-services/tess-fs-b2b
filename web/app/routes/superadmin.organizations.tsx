import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { desc } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { organizationTable } from "~/db/schema";
import { isSuperAdmin } from "~/lib/isSuperAdmin";

const selectCustomerSchema = createSelectSchema(organizationTable);

type OrganizationRow = z.infer<typeof selectCustomerSchema>;

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const organizations = await db.select()
    .from(organizationTable)
    .orderBy(desc(organizationTable.updatedAt))
    .execute();

  return Response.json({ organizations });
}

export default function Organizations() {
  const { organizations } = useLoaderData<{ organizations: OrganizationRow[] }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">
          Organizations
        </h1>
        <Button onClick={() => navigate("/superadmin/organization/new")}>Add new organization</Button>
      </div>
      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile</TableHead>
        </TableHeader>
        <TableBody>
          {
            organizations.map(c => {
              return (<TableRow key={c.id}>
                <TableCell className="underline decoration-2 decoration-blue-400 hover:decoration-yellow-400"><Link to={`/superadmin/organization/${c.id}`}>{c.name}</Link></TableCell>
                <TableCell>{c.businessAddress}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  <form method="post" action={`/superadmin/organization/${c.id}/delete`}>
                    <Button variant="outline" size="icon" type="submit"><Trash2Icon /></Button>
                  </form>
                </TableCell>
              </TableRow>)
            })
          }
        </TableBody>
      </Table>
    </div>
  )
}