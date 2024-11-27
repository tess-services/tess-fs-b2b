import { useState } from "react";
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
import { organization } from "~/lib/auth.client";
export function InviteOrgOwner({ organizationId }: { organizationId: string }) {
  const [email, setEmail] = useState("");
  const inviteOwner = async () => {
    await organization.inviteMember({ email, role: "owner", organizationId });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite Owner</Button>
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
          <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" size="sm" className="px-3" onClick={inviteOwner}>
              Submit
            </Button>
            </DialogClose>
            </DialogFooter>
 
      </DialogContent>
    </Dialog>
  );
}
