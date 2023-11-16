import {
  BaseSmartContractAccount,
  type BaseSmartAccountParams,
  type BatchUserOperationCallData,
  type ISmartContractAccount,
  type PublicErc4337Client,
  type SignTypedDataParams,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  encodeFunctionData,
  type Address,
  type Hex,
  type HttpTransport,
  type Transport,
} from "viem";
import { z } from "zod";
import { IStandardExecutorAbi } from "./abis/IStandardExecutor.js";
import type { Plugin } from "./plugins/types";

interface MSCA extends ISmartContractAccount {
  extendWithPluginMethods: <D>(plugin: Plugin<D>) => this & D;
}

type Executor = <A extends MSCA>(
  acct: A,
  rpcClient: PublicErc4337Client<HttpTransport> | PublicErc4337Client<Transport>
) => Pick<ISmartContractAccount, "encodeExecute" | "encodeBatchExecute">;

type SignerMethods = <A extends MSCA>(
  acct: A,
  rpcClient: PublicErc4337Client<HttpTransport> | PublicErc4337Client<Transport>
) => Pick<
  ISmartContractAccount,
  | "signMessage"
  | "signTypedData"
  | "signUserOperationHash"
  | "getDummySignature"
>;

type AccountInitter = <A extends MSCA>(
  acct: A,
  rpcClient: PublicErc4337Client<HttpTransport> | PublicErc4337Client<Transport>
) => Promise<Hex>;

// TODO: this can be moved out into its own file
export const StandardExecutor: Executor = () => ({
  async encodeExecute(
    target: Address,
    value: bigint,
    data: Hex
  ): Promise<`0x${string}`> {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "execute",
      args: [
        {
          target,
          data,
          value,
        },
      ],
    });
  },

  async encodeBatchExecute(
    txs: BatchUserOperationCallData
  ): Promise<`0x${string}`> {
    return encodeFunctionData({
      abi: IStandardExecutorAbi,
      functionName: "executeBatch",
      args: [
        txs.map((tx) => ({
          target: tx.target,
          data: tx.data,
          value: tx.value ?? 0n,
        })),
      ],
    });
  },
});

const zCompleteBuilder = z.object({
  executor: z.custom<Executor>(),
  signer: z.custom<SignerMethods>(),
  accountInitter: z.custom<AccountInitter>(),
});

export class MSCABuilder {
  executor?: Executor;
  signer?: SignerMethods;
  accountInitter?: AccountInitter;

  withExecutor(executor: Executor): this & { executor: Executor } {
    return Object.assign(this, { executor });
  }

  withSigner(methods: SignerMethods): this & { signer: SignerMethods } {
    return Object.assign(this, { signer: methods });
  }

  withInitCode(
    initCode: AccountInitter
  ): this & { accountInitter: AccountInitter } {
    return Object.assign(this, { accountInitter: initCode });
  }

  build<TTransport extends SupportedTransports = Transport>(
    params: BaseSmartAccountParams
  ): MSCA {
    const builder = this;
    const { signer, executor, accountInitter } =
      zCompleteBuilder.parse(builder);

    return new (class extends BaseSmartContractAccount<TTransport> {
      getDummySignature(): `0x${string}` {
        return signer(this, this.rpcProvider).getDummySignature();
      }

      encodeExecute(
        target: string,
        value: bigint,
        data: string
      ): Promise<`0x${string}`> {
        return executor(this, this.rpcProvider).encodeExecute(
          target,
          value,
          data
        );
      }

      encodeBatchExecute(
        txs: BatchUserOperationCallData
      ): Promise<`0x${string}`> {
        return executor(this, this.rpcProvider).encodeBatchExecute(txs);
      }

      signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
        return signer(this, this.rpcProvider).signMessage(msg);
      }

      signTypedData(params: SignTypedDataParams): Promise<`0x${string}`> {
        return signer(this, this.rpcProvider).signTypedData(params);
      }

      signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
        return signer(this, this.rpcProvider).signUserOperationHash(uoHash);
      }

      protected getAccountInitCode(): Promise<`0x${string}`> {
        return accountInitter(this, this.rpcProvider);
      }

      extendWithPluginMethods = <D>(plugin: Plugin<D>): this & D => {
        const methods = plugin.decorators;
        return Object.assign(this, methods);
      };
    })(params);
  }
}
