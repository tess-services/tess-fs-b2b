import { type FileUpload } from "@mjackson/form-data-parser";

export type UploadResult = {
  id: string;
  fileName: string;
  uploaded: Date;
  variants: string[];
};

const uploadImageToCloudflare = async ({
  data,
  cfImageUploadUrl,
  cfImageUploadToken,
  fileName,
  variantName,
}: {
  data: AsyncIterable<Uint8Array>;
  cfImageUploadUrl: string;
  cfImageUploadToken: string;
  fileName: string | undefined;
  variantName: string;
}) => {
  const chunks: Uint8Array[] = [];

  for await (const chunk of data) {
    chunks.push(chunk);
  }

  const blob = new Blob(chunks);
  const file = new File([blob], fileName ?? "image_file.jpg", {
    type: "image/jpeg",
  });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(cfImageUploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfImageUploadToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudflare");
  }

  const json = (await response.json()) as any as { result: UploadResult };
  console.log("Uploaded image to Cloudflare:", json.result);
  return json.result.variants.find((v) => v.includes(variantName));
};

export function cfImageUploadHandler(
  accountId: string,
  cfImageToken: string,
  variantName: string
) {
  return async (fieldName: string, fileUpload: FileUpload) => {
    const result = await uploadImageToCloudflare({
      data: fileUpload.stream(),
      cfImageUploadUrl: `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      cfImageUploadToken: cfImageToken,
      fileName: fileUpload.name,
      variantName,
    });
    return result;
  };
}
