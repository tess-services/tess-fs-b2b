import { useState } from "react";
import { nanoid } from "nanoid";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { admin, organization } from "~/lib/auth.client";

export function InviteOrgAdmin({ organizationId }: { organizationId: string }) {
  const [email, setEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const inviteAdmin = async () => {
    try {
      // const isUserExist = await admin.listUsers({
      //   query: {
      //     searchField: "email",
      //     searchValue: email,
      //   },
      // });

      // if (isUserExist.data?.users.length === 0) {
      //   await admin.createUser({
      //     email,
      //     name: email.split("@")[0],
      //     password: nanoid(),
      //     role: "member",
      //   });
      // }

      await organization.inviteMember({ email, role: "admin", organizationId });

      toast({
        title: "Success",
        description: "Organization owner invited successfully",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to invite organization owner",
        variant: "destructive",
      });
    }

    setDialogOpen(false);
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
        <input type="hidden" name="organizationId" value={organizationId} />
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="abc@xyz.com"
              className="w-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end ">
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={inviteAdmin}
          >
            Submit
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              size="sm"
              className="px-3"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
