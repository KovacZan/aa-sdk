import {
  LocalAccountSigner,
  SignerSchema,
  createBaseSmartAccountParamsSchema,
  type SignTypedDataParams,
  type SupportedTransports,
} from "@alchemy/aa-core";
import {
  concatHex,
  encodeFunctionData,
  hashMessage,
  hashTypedData,
  isBytes,
  toBytes,
  type Address,
  type FallbackTransport,
  type Hash,
  type Transport,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { localhost } from "viem/chains";
import { z } from "zod";
import { MultiOwnerMSCAFactoryAbi } from "./abis/MultiOwnerMSCAFactory.js";
import { MSCABuilder, StandardExecutor } from "./builder.js";
import {
  MultiOwnerPlugin,
  MultiOwnerPluginExecutionFunctionAbi,
} from "./plugins/multi-owner.js";

export const createMultiOwnerMSCASchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  createBaseSmartAccountParamsSchema<TTransport>().extend({
    owner: SignerSchema,
    index: z.bigint().optional().default(0n),
  });

export type MultiOwnerMSCAParams = z.input<
  ReturnType<typeof createMultiOwnerMSCASchema>
>;

export const createMultiOwnerMSCABuilder = <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);

  const builder = new MSCABuilder()
    .withInitCode(async (acct) => {
      const ownerAddress = await params.owner.getAddress();
      return concatHex([
        acct.getFactoryAddress(),
        encodeFunctionData({
          abi: MultiOwnerMSCAFactoryAbi,
          functionName: "createAccount",
          // TODO: this needs to support creating accounts with multiple owners
          args: [params.index, [ownerAddress]],
        }),
      ]);
    })
    .withExecutor(StandardExecutor)
    .withSigner((acct, rpcProvider) => {
      const signWith1271Wrapper = async (msg: Hash): Promise<`0x${string}`> => {
        // TODO: should expose these methods as well via the plugingen functions
        const [, name, version, chainId, verifyingContract, salt] =
          await rpcProvider.readContract({
            abi: MultiOwnerPluginExecutionFunctionAbi,
            address: await acct.getAddress(),
            functionName: "eip712Domain",
          });

        return params.owner.signTypedData({
          domain: {
            chainId: Number(chainId),
            name,
            salt,
            verifyingContract,
            version,
          },
          types: {
            ERC6900Message: [{ name: "message", type: "bytes" }],
          },
          message: {
            ERC6900Message: {
              message: toBytes(msg),
            },
          },
          primaryType: "ERC6900Message",
        });
      };

      return {
        getDummySignature(): `0x${string}` {
          return "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c";
        },

        signUserOperationHash(uoHash: `0x${string}`): Promise<`0x${string}`> {
          return params.owner.signMessage(uoHash);
        },

        signMessage(msg: string | Uint8Array): Promise<`0x${string}`> {
          return signWith1271Wrapper(
            hashMessage(
              typeof msg === "string" && !isBytes(msg)
                ? msg
                : {
                    raw: msg,
                  }
            )
          );
        },

        signTypedData(params: SignTypedDataParams): Promise<`0x${string}`> {
          return signWith1271Wrapper(hashTypedData(params));
        },
      };
    });

  return builder;
};

export const createMultiOwnerMSCA = <
  TTransport extends Transport | FallbackTransport = Transport
>(
  params_: MultiOwnerMSCAParams
) => {
  const params = createMultiOwnerMSCASchema<TTransport>().parse(params_);
  const builder = createMultiOwnerMSCABuilder<TTransport>(params);

  return builder.build(params).extendWithPluginMethods(MultiOwnerPlugin);
};

/// Example usage:
// TODO: remove this before merging
const params = {
  chain: localhost,
  factoryAddress: "0x12345" as Address,
  owner: LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey()),
  rpcClient: "http://localhost:8545",
};

const accountInstance = createMultiOwnerMSCA(params);

/// Allows for using with custom executor methods too (eg. in the case of using session keys)
const withCustomExecute = createMultiOwnerMSCABuilder(params)
  .withExecutor((acct, rpcProvider) => ({
    encodeBatchExecute: () => {
      throw new Error("this one is custom");
    },
    encodeExecute: () => {
      throw new Error("this one is custom");
    },
  }))
  .build(params)
  // TODO: figure out how we can incorporate the plugins as part of the build process
  // there's some issues here because of the generics
  .extendWithPluginMethods(MultiOwnerPlugin);
