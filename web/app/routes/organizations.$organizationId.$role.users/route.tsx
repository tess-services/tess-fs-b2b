import { and, desc, eq, not } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Ban, DoorOpen } from "lucide-react";
import {
  useLoaderData,
  useParams,
  useRevalidator
} from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { database } from "~/db/context";
import { organizationMembership, user } from "~/db/schema";
import { admin } from "~/lib/auth.client";
import { getAuth } from "~/lib/auth.server";
import type { Route } from "./+types/route";
import { InviteOrgMember } from "./invite-org-member";

const selectUserSchema = createSelectSchema(user);
const selectMembershipSchema = createSelectSchema(organizationMembership);

type User = z.infer<typeof selectUserSchema>;
type Membership = z.infer<typeof selectMembershipSchema>;

type LoaderData = {
  hasInvitePermission: boolean;
  hasMemberEditPermission: boolean;
  currentUser: User;
  users: {
    user: User;
    member: Membership;
  }[];
};

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { user: currentUser } = context.cloudflare.var;
  const { organizationId, role } = params;

  const auth = getAuth(context.cloudflare.env as Env);
  const invitePermissionCheck = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        invitation: ["create"],
      },
    },
  });
  const memberPermissionCheck = await auth.api.hasPermission({
    headers: request.headers,
    body: {
      role: {
        in: [role],
      },
      permission: {
        member: ["update", "delete"],
      },
    },
  });
  // Get all users in the organization with their member details
  const db = database();
  const users = await db
    .select()
    .from(user)
    .innerJoin(
      organizationMembership,
      eq(user.id, organizationMembership.userId)
    )
    .where(
      and(
        eq(organizationMembership.organizationId, organizationId),
        not(eq(organizationMembership.role, "owner"))
      )
    )
    .orderBy(desc(organizationMembership.updatedAt))
    .execute();

  return Response.json({
    currentUser,
    users,
    hasInvitePermission: invitePermissionCheck.success,
    hasMemberEditPermission: memberPermissionCheck.success,
  });
}

export default function Users() {
  const { currentUser, users, hasInvitePermission, hasMemberEditPermission } =
    useLoaderData<LoaderData>();
  const { organizationId } = useParams();
  const revalidator = useRevalidator();

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const handleUserActionSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const actionType = data.get("actionType") as string;
    const userId = data.get("userId") as string;

    if (actionType === "ban") {
      await admin.banUser({ userId });
    } else {
      await admin.unbanUser({ userId });
    }

    revalidator.revalidate();
  };

  return (
    <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">Organization Users</h1>
        {hasInvitePermission && (
          <InviteOrgMember organizationId={organizationId} />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined At</TableHead>
          {hasMemberEditPermission && <TableHead>Actions</TableHead>}
          <TableCell>Status</TableCell>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const u = user.user;
            const member = user.member;

            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {u.image && (
                      <img
                        src={u.image}
                        alt={u.name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    {u.name}
                  </div>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell className="capitalize">{member.role}</TableCell>
                <TableCell>
                  {new Date(member.createdAt!).toLocaleDateString()}
                </TableCell>
                {hasMemberEditPermission && (
                  <TableCell>
                    <form
                      onSubmit={handleUserActionSubmit}
                      className="space-y-4"
                    >
                      <input type="hidden" name="userId" defaultValue={u.id} />
                      <input
                        type="hidden"
                        name="actionType"
                        defaultValue={u.banned ? "unban" : "ban"}
                      />
                      <Button
                        variant="outline"
                        type="submit"
                        disabled={currentUser.id === u.id}
                      >
                        {u.banned ? (
                          <>
                            Unban
                            <DoorOpen className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ban
                            <Ban className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TableCell>
                )}
                <TableCell>{u.banned ? "Banned" : "Active"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
