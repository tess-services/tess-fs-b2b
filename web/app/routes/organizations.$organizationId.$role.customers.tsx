import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { and, desc, eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { customerTable, organizationMembership } from "~/db/schema";

const selectCustomerSchema = createSelectSchema(customerTable);

type CustomerTable = z.infer<typeof selectCustomerSchema>;

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  // First get the user's organization
  const userOrg = await db
    .select()
    .from(organizationMembership)
    .where(eq(organizationMembership.userId, user.id))
    .execute();

  if (!userOrg.length) {
    throw new Error("No organization found for user");
  }

  // Then get customers for that organization
  const customers = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.organizationId, userOrg[0].organizationId))
    .orderBy(desc(customerTable.updatedAt))
    .execute();

  return Response.json({ customers });
}

export default function Customers() {
  const { customers } = useLoaderData<{ customers: CustomerTable[] }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Customers</h1>
        <Button onClick={() => navigate("../customer/new")}>
          Add new customer
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Mobile</TableHead>
        </TableHeader>
        <TableBody>
          {customers.map((c) => {
            return (
              <TableRow key={c.id}>
                <TableCell className="underline decoration-2 decoration-blue-400 hover:decoration-yellow-400">
                  <Link to={`../customer/${c.id}`}>{c.name}</Link>
                </TableCell>
                <TableCell>
                  {c.address} {c.suburb}
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>
                  <form method="post" action={`../customer/${c.id}/delete`}>
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
