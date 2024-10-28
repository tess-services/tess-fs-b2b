import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { account, customerTable, user } from "~/db/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  const customers = (await db.select().from(user).innerJoin(account, eq(user.id, account.userId)).all())

  return json({ customers });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  await db.insert(customerTable).values({
    name: updates.name,
    email: updates.email,
    address: updates.address,
    suburb: updates.suburb,
    phone: updates.phone,
  });

  return json({ message: "Customer added" }, { status: 201 });
}

export default function Customers() {
  const { customers } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Customers</h1>
      <Table style={{ backgroundColor: "#f9f9f9", color: "#333" }}>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.user.id} style={{ borderBottom: "1px solid #ddd" }}>
              <TableCell style={{ padding: "8px", color: "#333" }}>{customer.user.name}</TableCell>
              <TableCell style={{ padding: "8px", color: "#333" }}>{customer.account.userId}</TableCell>
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
