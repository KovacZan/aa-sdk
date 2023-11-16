import { type GetFunctionArgs, encodeFunctionData } from "viem";
import type { Plugin } from "./types";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC6900PluginGen: This file is auto-generated by plugingen
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const MultiOwnerPlugin_ = {
  meta: {
    name: "Multi Owner Plugin",
    version: "1.0.0",
  },
  decorators: {
    encodeUpdateOwnersData: ({
      args,
    }: GetFunctionArgs<
      typeof MultiOwnerPluginExecutionFunctionAbi,
      "updateOwners"
    >) => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "updateOwners",
        args,
      });
    },

    encodeIsValidSignatureData: ({
      args,
    }: GetFunctionArgs<
      typeof MultiOwnerPluginExecutionFunctionAbi,
      "isValidSignature"
    >) => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "isValidSignature",
        args,
      });
    },

    encodeOwnersOfData: ({
      args,
    }: GetFunctionArgs<
      typeof MultiOwnerPluginExecutionFunctionAbi,
      "ownersOf"
    >) => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "ownersOf",
        args,
      });
    },

    encodeIsOwnerOfData: ({
      args,
    }: GetFunctionArgs<
      typeof MultiOwnerPluginExecutionFunctionAbi,
      "isOwnerOf"
    >) => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "isOwnerOf",
        args,
      });
    },

    encodeEip712DomainData: () => {
      return encodeFunctionData({
        abi: MultiOwnerPluginExecutionFunctionAbi,
        functionName: "eip712Domain",
      });
    },
  },
};

export const MultiOwnerPlugin: Plugin<
  (typeof MultiOwnerPlugin_)["decorators"]
> = MultiOwnerPlugin_;

export const MultiOwnerPluginExecutionFunctionAbi = [
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "ownersToAdd", internalType: "address[]", type: "address[]" },
      { name: "ownersToRemove", internalType: "address[]", type: "address[]" },
    ],
    name: "updateOwners",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "digest", internalType: "bytes32", type: "bytes32" },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "isValidSignature",
    outputs: [{ name: "", internalType: "bytes4", type: "bytes4" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "ownersOf",
    outputs: [{ name: "owners", internalType: "address[]", type: "address[]" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "account", internalType: "address", type: "address" },
      { name: "ownerToCheck", internalType: "address", type: "address" },
    ],
    name: "isOwnerOf",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "eip712Domain",
    outputs: [
      { name: "fields", internalType: "bytes1", type: "bytes1" },
      { name: "name", internalType: "string", type: "string" },
      { name: "version", internalType: "string", type: "string" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
      { name: "verifyingContract", internalType: "address", type: "address" },
      { name: "salt", internalType: "bytes32", type: "bytes32" },
      { name: "extensions", internalType: "uint256[]", type: "uint256[]" },
    ],
  },
] as const;
