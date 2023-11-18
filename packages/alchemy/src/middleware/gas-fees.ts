import type { UserOperationFeeOverrides } from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyGasFeeEstimator = (
  provider: AlchemyProvider,
  feeOverrides?: Pick<
    UserOperationFeeOverrides,
    "maxFeePerGas" | "maxPriorityFeePerGas"
  >
): AlchemyProvider => {
  provider.withFeeDataGetter(async () => {
    const [block, priorityFeePerGas] = await Promise.all([
      provider.rpcClient.getBlock({ blockTag: "latest" }),
      // it's a fair assumption that if someone is using this Alchemy Middleware, then they are using Alchemy RPC
      (provider.rpcClient as ClientWithAlchemyMethods).request({
        method: "rundler_maxPriorityFeePerGas",
        params: [],
      }),
    ]);
    const baseFeePerGas = block.baseFeePerGas;
    if (baseFeePerGas == null) {
      throw new Error("baseFeePerGas is null");
    }
    return {
      maxFeePerGas: baseFeePerGas,
      maxPriorityFeePerGas: BigInt(priorityFeePerGas),
    };
  });
  return provider;
};
