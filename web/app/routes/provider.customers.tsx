import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { customerTable, userOrganizationTable } from "~/db/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    console.log(user, db);
    throw new Error("Unauthorized");
  }

  const organization = await db.select().from(userOrganizationTable)
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  if (organization.length === 0) {
    return json({ customers: [], organizationProfileSetupRequired: true });
  }

  const organizationId = organization[0].organizationId;

  const customers = await db.select({
    customer: customerTable,
  }).from(customerTable)
    .innerJoin(userOrganizationTable, eq(customerTable.organizationId, userOrganizationTable.organizationId))
    .where(eq(userOrganizationTable.organizationId, organizationId))
    .execute();

  return json({ customers: customers.map(c => c.customer), organizationProfileSetupRequired: false });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { db, user } = context.cloudflare.var;

  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  if (!user || !db) {
    throw new Error("Unauthorized");
  }
  console.log(formData);
  const organization = await db.select().from(userOrganizationTable)
    .where(eq(userOrganizationTable.userId, user.id)).execute();

  if (organization.length === 0) {
    return json({ customers: [], organizationProfileSetupRequired: true });
  }

  const organizationId = organization[0].organizationId;

  await db.insert(customerTable).values({
    name: updates.name,
    email: updates.email,
    address: updates.address,
    suburb: updates.suburb,
    phone: updates.phone,
    organizationId,
    addedByUserId: user.id,
  });

  return json({ message: "Customer added" }, { status: 201 });
}

export default function Customers() {
  const { customers, organizationProfileSetupRequired } = useLoaderData<typeof loader>();

  if (organizationProfileSetupRequired) {
    return (
      <div>
        <h1>Organization Profile Setup Required</h1>
        <p>You must setup your organization profile before you can add customers.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-md p-4 sm:p-6 md:p-8 lg:p-10">
      <h1>Customers</h1>
      <Table>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Form method="post">
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" name="name" />

        <label htmlFor="address">Address:</label>
        <input id="address" type="text" name="address" />

        <label htmlFor="suburb">Suburb:</label>
        <input id="suburb" type="text" name="suburb" />

        <label htmlFor="phone">Phone:</label>
        <input id="phone" type="text" name="phone" />

        <label htmlFor="email">Email:</label>
        <input id="email" type="email" name="email" />


        <button type="submit">Add Customer</button>
      </Form>
    </div>
  );
}
