import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { customerOrganizationMapping, customerTable, userOrganizationTable } from "~/db/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  // TODO: Perform join but PICK only customer table data!
  const customers = await db.select().from(customerTable)
    .innerJoin(customerOrganizationMapping, eq(customerOrganizationMapping.organizationId, customerOrganizationMapping.organizationId))
    .innerJoin(userOrganizationTable, eq(userOrganizationTable.organizationId, customerOrganizationMapping.organizationId))
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  return json({ customers: customers.map(c => c.customer) });
}

export default function Customers() {
  const { customers } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Customers
      </h1>
      <Button onClick={() => navigate("/provider/customer/new")}>Add new customer</Button>
      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
        </TableHeader>
        <TableBody>
          {
            customers.map(c => {
              return (<TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.address}</TableCell>

              </TableRow>)
            })
          }
        </TableBody>
      </Table>
    </div>
  )
}