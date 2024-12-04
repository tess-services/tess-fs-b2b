import { zodResolver } from "@hookform/resolvers/zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { organizationTable } from "~/db/schema";

// Define the metadata schema
export const organizationMetadataSchema = z
  .object({
    abn: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    businessAddress: z.string().optional().nullable(),
    tradeCurrency: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

// Export the type
export type OrganizationMetadata = z.infer<typeof organizationMetadataSchema>;

const updateOrganizationSchema = createInsertSchema(organizationTable, {
  metadata: organizationMetadataSchema,
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }),
  id: z.string(),
});

export const selectOrganizationSchema = createSelectSchema(organizationTable)
  .pick({
    id: true,
    name: true,
    slug: true,
    logo: true,
  })
  .extend({
    metadata: organizationMetadataSchema.nullable(),
  });

export const resolver = zodResolver(updateOrganizationSchema);

export type OrganizationFormType = z.infer<typeof updateOrganizationSchema>;
