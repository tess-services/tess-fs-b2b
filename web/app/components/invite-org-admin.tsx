import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { organization } from "~/lib/auth.client";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  organizationId: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function InviteOrgAdmin({ organizationId }: Readonly<{ organizationId: string }>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      organizationId,
    },
  });

  const inviteAdmin = async (values: FormValues) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setRequestInProgress(true);
    try {
      await organization.inviteMember({
        email: values.email,
        role: "admin",
        organizationId: values.organizationId,

      });

      toast({
        title: "Success",
        variant: "default",
        description: "Organization owner invited successfully",
      });
      setDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to invite organization owner",
      });
    } finally {
      setRequestInProgress(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Admin</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter owner email</DialogTitle>
          <DialogDescription>
            Person who would be managing the organization (add/edit members)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(inviteAdmin)} className="space-y-4">
            <input type="hidden" name="organizationId" value={organizationId} />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@company.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                disabled={requestInProgress}
              >
                Invite Admin
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}