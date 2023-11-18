import { z } from "zod";
import {
  BigNumberishSchema,
  HexSchema,
  PercentageSchema,
} from "./utils/index.js";

export const UserOperationFeeOverridesFieldSchema = z.union([
  BigNumberishSchema,
  PercentageSchema,
]);

export const UserOperationFeeOverridesSchema = z
  .object({
    maxFeePerGas: UserOperationFeeOverridesFieldSchema,
    maxPriorityFeePerGas: UserOperationFeeOverridesFieldSchema,
    callGasLimit: UserOperationFeeOverridesFieldSchema,
    verificationGasLimit: UserOperationFeeOverridesFieldSchema,
    preVerificationGas: UserOperationFeeOverridesFieldSchema,
  })
  .partial();

export const UserOperationOverridesSchema =
  UserOperationFeeOverridesSchema.extend({
    paymasterAndData: HexSchema.optional(),
  });
