import * as z from "zod";

export const billingInfoSchema = z.object({
  billingCompany: z.string().max(100).optional(),
  billingName: z.string().min(2).max(100).optional(),
  billingAddress: z.string().min(5).max(200).optional(),
  billingCity: z.string().min(2).max(100).optional(),
  billingState: z.string().max(100).optional(),
  billingCountry: z.string().min(2).max(100).optional(),
  billingZip: z.string().max(20).optional(),
  billingPhone: z.string().max(20).optional(),
});

export type BillingFormData = z.infer<typeof billingInfoSchema>;