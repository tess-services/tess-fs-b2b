import { zodResolver } from "@hookform/resolvers/zod";
import { ActionFunctionArgs, type LoaderFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useFetcher, useLoaderData, useNavigate, useNavigation, } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { getValidatedFormData, RemixFormProvider, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { organizationTable, userOrganizationTable } from "~/db/schema";
import { useToast } from "~/hooks/use-toast";

const insertOrganizationSchema = createInsertSchema(organizationTable, {
  currentInvoiceNumber: z.number({ coerce: true }).int().positive(),
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
});
const selectOrganizationSchema = createSelectSchema(organizationTable);

const resolver = zodResolver(insertOrganizationSchema);

type OrganizationFormType = z.infer<typeof insertOrganizationSchema>;
type OrganizationLoaderType = z.infer<typeof selectOrganizationSchema>;

export const loader: LoaderFunction = async ({ context }: LoaderFunctionArgs) => {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  // Find user's organization
  const userOrg = await db.select().from(userOrganizationTable)
    .innerJoin(organizationTable, eq(userOrganizationTable.organizationId, organizationTable.id))
    .where(
      eq(userOrganizationTable.userId, user.id)
    ).execute();

  if (userOrg.length === 0) {
    return Response.json({ organization: null });
  }

  return Response.json(userOrg[0].organization);
};

type ActionData = {
  success?: boolean;
  error?: string;
  errors?: FieldErrors<OrganizationFormType>;
};

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  const { errors, data } = await getValidatedFormData<OrganizationFormType>(
    request,
    resolver,
    false,
  );

  if (errors) {
    return Response.json({ errors });
  }

  const { id: organizationId, ...organizationData } = data;

  try {
    if (organizationId) {
      // Update existing organization
      await db
        .update(organizationTable)
        .set({
          ...organizationData,
          updatedAt: new Date(),
        })
        .where(eq(organizationTable.id, organizationId));
    } else {
      // Create new organization
      const [newOrg] = await db
        .insert(organizationTable)
        .values(organizationData)
        .returning();

      // Create user-organization relationship
      await db.insert(userOrganizationTable).values({
        userId: user.id,
        organizationId: newOrg.id,
        isOwner: true,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Failed to save organization" }, { status: 500 });
  }
};

export default function OrganizationProfile() {
  const organization = useLoaderData<OrganizationLoaderType>();
  const formNavigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = formNavigation.state === "submitting";
  const actionData = useActionData<ActionData>();
  const { toast } = useToast()
  const fetcher = useFetcher();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const form = useRemixForm<OrganizationFormType>({
    mode: "onSubmit",
    resolver,
    defaultValues: organization || {},
  });

  useEffect(() => {
    if (actionData?.success) {
      console.log("Organization saved successfully");
      toast({
        title: "Organization saved successfully",
        description: "Organization profile has been updated successfully",
        variant: "default",
      });
    }
    if (actionData?.error) {
      console.error("Failed to save organization", actionData.error);
      toast({
        title: "Failed to save organization",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  useEffect(() => {
    if (fetcher.data) {
      setLogoUrl(fetcher.data as string);
      form.setValue("logoUrl", fetcher.data as string);
    }
  }, [fetcher.data]);

  const logoImageSrc = logoUrl ?? form.getValues().logoUrl;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {organization ? "Update Organization Profile" : "Create Organization Profile"}
      </h1>

      <RemixFormProvider {...form}>
        <Form id="organization-form" method="post" onSubmit={form.handleSubmit} className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:gap-x-8">
          {organization && (
            <input type="hidden" name="id" value={organization.id} />
          )}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Pty Ltd" {...field} />
                </FormControl>
                <FormDescription>
                  Name of your organization, will appear in documents as your organization name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="abn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ABN</FormLabel>
                <FormControl>
                  <Input placeholder="50 110 219 460" {...field} />
                </FormControl>
                <FormDescription>
                  ABN of your organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+61 20 11112222" {...field} />
                </FormControl>
                <FormDescription>
                  Phone number of your organization
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business address</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Address which will appear in invoice etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="xyz@abc.com" {...field} />
                </FormControl>
                <FormDescription>
                  Email from which invoices will be sent
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tradeCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency you use" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="NZD">NZD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoicePrefix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice prefix</FormLabel>
                <FormControl>
                  <Input placeholder="INV" {...field} />
                </FormControl>
                <FormDescription>
                  Constant invoice prefix
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentInvoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current pending invoice number</FormLabel>
                <FormControl>
                  <Input type="number" required placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  Number which will be used for next invoice
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

        </Form>
      </RemixFormProvider>

      <fetcher.Form
        id="image-form"
        method="post"
        action="/provider/organization/image"
        encType="multipart/form-data">
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          required
          className="mt-4"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const url = URL.createObjectURL(e.target.files[0]);
              setLogoUrl(url);
            }
          }}
        />
        {logoImageSrc && <img src={logoImageSrc} alt="Logo" className="mt-2 w-60" />}
        <Button
          type="submit"
          disabled={!logoUrl || isSubmitting}
          form="image-form"
          className="mt-2"
        >
          {isSubmitting
            ? "Uploading..."
            : "Upload logo"}
        </Button>

      </fetcher.Form>
      <div className="flex gap-8 lg:col-span-2 justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          form="organization-form"
        >
          {isSubmitting
            ? "Saving..."
            : "Submit"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
