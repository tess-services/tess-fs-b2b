import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { organization } from "~/lib/auth.client";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "member"] as const, {
    required_error: "Please select a role",
  }),
  organizationId: z.string(),
});

type FormData = z.infer<typeof formSchema>;
const resolver = zodResolver(formSchema);

export function InviteOrgMember({
  organizationId,
}: Readonly<{
  organizationId: string;
}>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver,
    defaultValues: {
      email: "",
      role: "member",
      organizationId,
    },
  });

  const inviteMember: SubmitHandler<FormData> = async (values: FormData) => {
    try {
      setRequestInProgress(true);
      await organization.inviteMember(
        {
          email: values.email,
          role: values.role,
          organizationId: values.organizationId,
        },
        {
          onRequest: (ctx) => {
            // Handle the request
          },
          onSuccess: (ctx) => {
            toast({
              title: "Success",
              variant: "default",
              description: "Organization member invited successfully",
            });
          },
          onError: (ctx) => {
            toast({
              title: "Error",
              variant: "destructive",
              description: ctx.error?.message || "Failed to invite member",
            });
          },
        }
      );

      setDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to invite member",
      });
    } finally {
      setRequestInProgress(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Organization Member</DialogTitle>
          <DialogDescription>
            Person who would be performing the everyday tasks
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(inviteMember)}
            className="space-y-4"
          >
            <input type="hidden" name="organizationId" value={organizationId} />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="abc@xyz.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="sm:justify-end">
              <Button
                type="submit"
                size="sm"
                className="px-3"
                disabled={requestInProgress}
              >
                Invite
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
