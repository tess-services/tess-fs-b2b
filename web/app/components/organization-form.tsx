import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export const OrganizationForm = ({
  form,
  mode = "new",
  onSubmit,
  logoUrl: logoUrlDefault,
}: {
  form: any;
  mode?: "edit" | "new";
  onSubmit: (data: any) => void;
  logoUrl?: string;
}) => {
  const formNavigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = formNavigation.state === "submitting";
  const fetcher = useFetcher();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(logoUrlDefault);

  useEffect(() => {
    if (fetcher.data) {
      setLogoUrl(fetcher.data as string);
    }
  }, [fetcher.data]);

  const handleImageUpload = async (e: any) => {
    e.preventDefault();

    const resp = await fetch(`/superadmin/organization/${form.getValues().id}/image`, {
      method: "POST",
      body: new FormData(e.target),
      headers: {
        encType: "multipart/form-data",
      },
    });
    const respBody = await resp.json() as any;
    setLogoUrl(respBody.imageUrl);
    form.setValue("logoFileId", respBody.fileId);
    console.log(respBody);
  }
  console.log("errors========", form.formState.errors)
  return (
    <>
      <Form {...form}>
        <form
          id="organization-form"
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
                  A unique identifier used in URLs. Use lowercase letters,
                  numbers, and hyphens only.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="contact@acmecorp.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.phone"
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
            name="metadata.abn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ABN</FormLabel>
                <FormControl>
                  <Input placeholder="12 345 678 901" {...field} />
                </FormControl>
                <FormDescription>Australian Business Number</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.businessAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Business St, Sydney NSW 2000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metadata.tradeCurrency"
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
        </form>
      </Form>
      <fetcher.Form
        id="image-form"
        method="post"
        onSubmit={handleImageUpload}
        encType="multipart/form-data"
      >
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
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="mt-2 w-60" />
        )}
        <Button
          type="submit"
          disabled={!logoUrl || isSubmitting}
          form="image-form"
          className="mt-2"
        >
          {isSubmitting ? "Uploading..." : "Upload logo"}
        </Button>
      </fetcher.Form>

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          form="organization-form"
          onClick={() => navigate("/superadmin/organizations")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" form="organization-form" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Organization"
              : "Create Organization"}
        </Button>
      </div>
    </>
  );
};
