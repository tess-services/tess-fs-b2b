import { parseFormData } from "@mjackson/form-data-parser";
import { nanoid } from "nanoid";
import { ActionFunctionArgs } from "react-router";
import { imageFileMetadata } from "~/db/schema";
import { cfImageUploadHandler } from "~/lib/cfImageUploadHandler.server";

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const { db, user } = context.cloudflare.var;

  if (!user || !db) {
    throw new Error("Unauthorized");
  }
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
  const imageUrl = formData.get("logo");

  try {
    await db
      .insert(imageFileMetadata)
      .values({
        id: fileId,
        name: "logo",
        imageUrl,
        uploadedByUserId: user.id,
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
