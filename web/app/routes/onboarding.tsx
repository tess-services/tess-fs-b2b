import {
  redirectDocument,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { and, eq } from "drizzle-orm";
import {
  invitation,
  organizationMembership,
  organizationTable,
  user,
} from "~/db/schema";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { CenterScreenContainer } from "~/components/CenterScreenContainer";
import { organization } from "~/lib/auth.client";
import { useState } from "react";
import { Spinner } from "~/components/Spinner";
import { getAuth } from "~/lib/auth.server";
import { TessMenuBar } from "~/components/TessMenuBar";
import { organizationMetadataSchema } from "~/lib/organization";

const pendingInvitationsSchema = z.array(
  z.object({
    invitation: createSelectSchema(invitation),
    organization: createSelectSchema(organizationTable).extend({
      metadata: organizationMetadataSchema,
    }),
    inviter: createSelectSchema(user),
  })
);
type PendingInvitations = z.infer<typeof pendingInvitationsSchema>;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { db, user: currentUser } = context.cloudflare.var;
  if (!currentUser || !db) {
    throw new Error("Unauthorized");
  }

  const memberships = await db
    .select()
    .from(organizationMembership)
    .where(eq(organizationMembership.userId, currentUser.id))
    .execute();

  if (memberships.length === 1) {
    const { organizationId, role } = memberships[0];
    const auth = getAuth(context.cloudflare.env as Env);

    await auth.api.setActiveOrganization({
      headers: request.headers,
      body: {
        organizationId,
      },
    });
    return redirectDocument(`/organizations/${organizationId}/${role}`);
  }

  // Find pending invitations for the user's email
  const pendingInvitations: PendingInvitations = await db
    .select({
      invitation: invitation,
      organization: organizationTable,
      inviter: user,
    })
    .from(invitation)
    .innerJoin(
      organizationTable,
      eq(invitation.organizationId, organizationTable.id)
    )
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(
      and(
        eq(invitation.status, "pending"),
        eq(invitation.email, currentUser.email)
      )
    )
    .execute();

  return Response.json({
    pendingInvitations,
    name: currentUser.name,
    email: currentUser.email,
  });
}

type FormState =
  | "Onboarding"
  | "RequestInProgress"
  | "RequestFailed"
  | "RequestSuccess";

export default function Onboarding() {
  const { pendingInvitations, name, email } = useLoaderData<{
    pendingInvitations: PendingInvitations;
    name: string;
    email: string;
  }>();

  const [formState, setFormState] = useState<FormState>("Onboarding");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const invitationId = data.get("invitationId") as string;
    const role = data.get("role") as string;
    const organizationId = data.get("organizationId") as string;

    // Handle invitation acceptance
    await organization.acceptInvitation(
      { invitationId },
      {
        onRequest: (ctx) => {
          setFormState("RequestInProgress");
        },
        onSuccess: (ctx) => {
          setFormState("RequestSuccess");

          navigate(`/organizations/${organizationId}/${role}`);
        },
        onError: (ctx) => {
          setFormState("RequestFailed");
          if (ctx.error.message) {
            setError(ctx.error.message);
          }
        },
      }
    );
  };

  return (
    <div>
      <TessMenuBar menuItemMeta={[]} name={name} email={email} />
      {/* Add your main Onboarding content here */}
      <div className="mx-auto lg:max-w-7xl lg:p-0 p-3">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold p-6">Onboarding</h1>
        </div>
      </div>
      <CenterScreenContainer>
        {pendingInvitations.length > 0 && (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h2 className="mb-4 text-lg font-semibold">Pending Invitations</h2>
            <div className="space-y-4">
              {pendingInvitations.map((inv) => (
                <div
                  key={inv.invitation.id}
                  className="rounded-md bg-white p-4 shadow-sm"
                >
                  <p className="text-gray-700">
                    <span className="font-medium">{inv.inviter.name}</span> has
                    invited you to join{" "}
                    <span className="font-medium">{inv.organization.name}</span>
                  </p>
                  <div className="mt-3">
                    <form method="post" onSubmit={handleAcceptInvitation}>
                      <input
                        type="hidden"
                        name="invitationId"
                        value={inv.invitation.id}
                      />
                      <input
                        type="hidden"
                        name="role"
                        value={inv.invitation.role}
                      />
                      <input
                        type="hidden"
                        name="organizationId"
                        value={inv.invitation.organizationId}
                      />
                      <button
                        type="submit"
                        disabled={formState === "RequestInProgress"}
                        className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${
                          formState === "RequestInProgress"
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500"
                        } flex items-center gap-2`}
                      >
                        {formState === "RequestInProgress" ? (
                          <>
                            <Spinner />
                            Processing...
                          </>
                        ) : (
                          "Accept Invitation"
                        )}
                      </button>
                      {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                          <p className="text-sm font-semibold text-red-800">
                            {error}
                          </p>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {pendingInvitations.length === 0 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h2 className="mb-4 text-lg font-semibold">You are all set!</h2>
            <p className="text-gray-700">
              You have no pending invitations, please ask your organization
              admin to invite you.
            </p>
          </div>
        )}
      </CenterScreenContainer>
    </div>
  );
}
