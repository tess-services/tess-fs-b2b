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
import { useToast } from "~/hooks/use-toast";
import { organization } from "~/lib/auth.client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { UserPlusIcon } from "lucide-react";

export function InviteOrgMember({
  organizationId,
}: {
  organizationId: string;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const inviteMember = async () => {
    try {
      await organization.inviteMember({
        email,
        role,
        organizationId,
      });

      toast({
        title: "Success",
        variant: "default",
        description: "Organization owner invited successfully",
      });
    } catch (error) {
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
        <Button>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Invite User
        </Button>
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
          <div className="space-y-2">
            <label
              htmlFor="role"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Role
            </label>
            <Select
              name="role"
              onValueChange={(val: "admin" | "member") => setRole(val)}
              value={role}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="sm:justify-end ">
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={inviteMember}
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
