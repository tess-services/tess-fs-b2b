import { parseFormData } from "@mjackson/form-data-parser";
import { nanoid } from "nanoid";
import { database } from "~/db/context";
import { imageFileMetadata } from "~/db/schema";
import { cfImageUploadHandler } from "~/lib/cfImageUploadHandler.server";
import type { Route } from "./+types/superadmin.organization.$id.image";

export const action = async ({
  params,
  request,
  context,
}: Route.ActionArgs) => {
  const { user } = context.cloudflare.var;
  const db = database();

  const formData = await parseFormData(
    request,
    cfImageUploadHandler(
      context.cloudflare.env.ACCOUNT_ID,
      context.cloudflare.env.CF_IMAGES_TOKEN,
      "logo"
    )
  );

  const { id } = params;
  const fileId = nanoid();
  const imageUrl = formData.get("logo") as string;

  if (!imageUrl) {
    throw new Error("No image uploaded");
  }

  try {
    await db
      .insert(imageFileMetadata)
      .values({
        id: fileId,
        name: "logo",
        imageUrl,
        uploadedByUserId: user!.id,
        imageCategory: "logo",
        organizationId: id,
        attachedEntityId: id,
        attachedEntityType: "organization",
      })
      .execute();

    return Response.json({ fileId, imageUrl });
  } catch (e) {
    console.error("Failed to save image", e);
    throw new Error("Error in saving image");
  }
};
