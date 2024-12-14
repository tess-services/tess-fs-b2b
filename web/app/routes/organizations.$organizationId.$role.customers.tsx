import { desc, eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
import { Link, useLoaderData, useNavigate } from "react-router";
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
import { database } from "~/db/context";
import { customerTable } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import { Route } from "./+types/organizations.$organizationId.$role.customers";

const selectCustomerSchema = createSelectSchema(customerTable);

type CustomerTable = z.infer<typeof selectCustomerSchema>;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const auth = getAuth(context.cloudflare.env);

  const { organizationId, role } = params;
  if (!organizationId || !role) {
    throw new Error("Organization ID and role are required");
  }

  // First get the user's permission
  const customerReadPermission = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        customer: ["read"],
      },
    },
  });

  if (!customerReadPermission.success) {
    throw new Error("Unauthorized");
  }

  // Then get customers for that organization
  const db = database();
  const customers = await db
    .select()
    .from(customerTable)
    .where(eq(customerTable.organizationId, organizationId))
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
