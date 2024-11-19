import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { customerOrganizationMapping, customerTable, userOrganizationTable } from "~/db/schema";

const selectCustomerSchema = createSelectSchema(customerTable);

type CustomerTable = z.infer<typeof selectCustomerSchema>;

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const customers = await db.select({ ...getTableColumns(customerTable) }).from(userOrganizationTable)
    .innerJoin(customerOrganizationMapping, eq(userOrganizationTable.organizationId, customerOrganizationMapping.organizationId))
    .innerJoin(customerTable, eq(customerOrganizationMapping.customerId, customerTable.id))
    .orderBy(desc(customerTable.updatedAt
    ))
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  return Response.json({ customers });
}

export default function Customers() {
  const { customers } = useLoaderData<{ customers: CustomerTable[] }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">
          Customers
        </h1>
        <Button onClick={() => navigate("/provider/customer/new")}>Add new customer</Button>
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
            customers.map(c => {
              return (<TableRow key={c.id}>
                <TableCell className="underline decoration-2 decoration-blue-400 hover:decoration-yellow-400"><Link to={`/provider/customer/${c.id}`}>{c.name}</Link></TableCell>
                <TableCell>{c.address} {c.suburb}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  <form method="post" action={`/provider/customer/${c.id}/delete`}>
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