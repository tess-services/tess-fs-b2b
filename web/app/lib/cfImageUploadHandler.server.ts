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
  variantName,
}: {
  data: FileUpload;
  cfImageUploadUrl: string;
  cfImageUploadToken: string;
  variantName: string;
}) => {
  const formData = new FormData();
  const fileBlob = new File([await data.arrayBuffer()], data.name, { type: data.type });
  formData.append("file", fileBlob);

  const response = await fetch(cfImageUploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfImageUploadToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to upload image to Cloudflare: ${response.status} ${response.statusText}`,
      {
        cause: { response, errorText },
      }
    );
  }

  const json = (await response.json()) as any as { result: UploadResult };
  console.log("Uploaded image to Cloudflare:", json.result);
  return json.result.variants.find((v) => v.includes(variantName));
};

export const cfImageUploadHandler =
  (accountId: string, cfImageUploadToken: string, variantName: string) =>
    async (fileUpload: FileUpload) => {
      const cfImageUploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
      const uploadedImageId = await uploadImageToCloudflare({
        data: fileUpload,
        cfImageUploadUrl,
        cfImageUploadToken,
        variantName,
      });

      return uploadedImageId;
    };
