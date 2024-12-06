import { LoaderFunctionArgs, redirect } from "react-router";
import { useLoaderData, useParams } from "react-router";
import { and, desc, eq, not } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { Trash2Icon } from "lucide-react";
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
import { user, organizationMembership } from "~/db/schema";
import { getAuth } from "~/lib/auth.server";
import { InviteOrgMember } from "./invite-org-member";

const selectUserSchema = createSelectSchema(user);
const selectMembershipSchema = createSelectSchema(organizationMembership);

type User = z.infer<typeof selectUserSchema>;
type Membership = z.infer<typeof selectMembershipSchema>;

type LoaderData = {
  hasInvitePermission: boolean;
  hasMemberEditPermission: boolean;
  users: {
    user: User;
    member: Membership;
  }[];
};

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  const { db, user: currentUser } = context.cloudflare.var;
  const { organizationId, role } = params;

  if (!currentUser || !db || !organizationId) {
    return redirect("/signin");
  }
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
    users,
    hasInvitePermission: invitePermissionCheck.success,
    hasMemberEditPermission: memberPermissionCheck.success,
  });
}

export default function Users() {
  const { users, hasInvitePermission, hasMemberEditPermission } =
    useLoaderData<LoaderData>();
  const { organizationId } = useParams();

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

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
                    <form method="post" action={`remove/${u.id}`}>
                      <Button variant="outline" size="icon" type="submit">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
