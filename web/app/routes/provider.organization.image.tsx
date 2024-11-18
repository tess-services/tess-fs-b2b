import { ActionFunctionArgs, unstable_parseMultipartFormData } from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { imageFileMetadata, userOrganizationTable } from "~/db/schema";
import { cfImageUploadHandler } from "~/lib/cfImageUploadHandler.server";

// export function ErrorBoundary() {
//   const error = useRouteError();
//   return <div>Error: {error instanceof Error ? error.message : 'Unknown error occurred'}</div>;
// }

// export const loader = async ({ context }: LoaderFunctionArgs) => {
//   const { db, user } = context.cloudflare.var;
//   if (!user || !db) return null;
//   return { ok: true };
// };

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const formData = await unstable_parseMultipartFormData(
    request,
    cfImageUploadHandler(context.cloudflare.env.ACCOUNT_ID, context.cloudflare.env.CF_IMAGES_TOKEN, "logo")
  );
  const fileId = formData.get("logo");

  if (!fileId) {
    throw new Error("File not found");
  }

  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }

  try {
    const userOrgs = await db.select().from(userOrganizationTable)
      .where(eq(userOrganizationTable.userId, user.id))
      .execute()
      .catch((error) => {
        console.error('Database query failed:', error);
        throw new Error('Failed to fetch user organizations');
      });

    if (userOrgs.length === 0) {
      throw new Error("User has no org assigned");
    }

    await db.insert(imageFileMetadata).values({
      id: fileId.toString(),
      uploadedByUserId: user.id,
      organizationId: userOrgs[0].organizationId,
      attachedEntityId: userOrgs[0].organizationId,
      attachedEntityType: "organization",
    }).execute();

    return new Response(fileId, { status: 200 });
  } catch (e) {
    console.error("Failed to save image", e);
    throw new Error("User has no org assigned");
  }
};
