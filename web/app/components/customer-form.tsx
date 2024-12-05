import { Form, useNavigate, useNavigation } from "@remix-run/react";
import { useEffect } from "react";
import { RemixFormProvider } from "remix-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";

import { ActionData } from "~/routes/organizations.$organizationId.$role.customer.new";

export const CustomerForm = ({
  actionData,
  organizationId,
  form,
  mode = "new",
}: {
  actionData?: ActionData;
  organizationId: string;
  form: any; // TODO: fix it.
  mode?: "edit" | "new";
}) => {
  const formNavigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = formNavigation.state === "submitting";
  const { toast } = useToast();

  console.log(form.formState.errors);

  useEffect(() => {
    if (actionData?.success) {
      toast({
        title: "Customer saved successfully",
        description:
          mode === "edit"
            ? "Customer has been updated"
            : "New customer has been added to your organization",
        variant: "default",
      });
      navigate("../customers");
    }
    if (actionData?.error) {
      toast({
        title: "Failed to save customer",
        description: actionData.error,
        variant: "destructive",
      });
    }
  }, [actionData]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "edit" ? "Update customer detail" : "Add New Customer"}
      </h1>
      <RemixFormProvider {...form}>
        <Form method="post" onSubmit={form.handleSubmit} className="space-y-4">
          <input type="hidden" name="organizationId" value={organizationId} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
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
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="suburb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Suburb</FormLabel>
                <FormControl>
                  <Input placeholder="Sydney" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isCommercial"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Commercial Customer
                  </FormLabel>
                  <FormDescription>
                    Mark if this is a business customer
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex gap-8 justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {mode === "edit" ? "Update customer" : "Add customer"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </RemixFormProvider>
    </div>
  );
};
