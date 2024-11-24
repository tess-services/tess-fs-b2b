import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { RemixFormProvider } from "remix-hook-form";
import { Button } from "~/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ActionData } from "~/routes/superadmin.organization.new";

export const OrganizationForm = ({
  actionData,
  form,
  mode = "new",
}: {
  actionData?: ActionData;
  form: any; // TODO: fix type
  mode?: "edit" | "new";
}) => {
  const formNavigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = formNavigation.state === "submitting";

  return (
    <RemixFormProvider {...form}>
      <Form method="post" onSubmit={form.handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corporation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="acme-corp" {...field} />
              </FormControl>
              <FormDescription>
                A unique identifier used in URLs. Use lowercase letters, numbers, and hyphens only.
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
                <Input type="email" placeholder="contact@acmecorp.com" {...field} />
              </FormControl>
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
                <Input placeholder="+61 400 000 000" {...field} />
              </FormControl>
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
                <Input placeholder="12 345 678 901" {...field} />
              </FormControl>
              <FormDescription>
                Australian Business Number
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
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Business St, Sydney NSW 2000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tradeCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trade Currency</FormLabel>
              <FormControl>
                <Input placeholder="AUD" {...field} />
              </FormControl>
              <FormDescription>
                Primary currency for transactions (e.g., AUD, USD)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>
                URL to the organization's logo image
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/superadmin/organizations")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "edit" ? "Update Organization" : "Create Organization"}
          </Button>
        </div>
      </Form>
    </RemixFormProvider>
  );
};
