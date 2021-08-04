import { EIP712SignatureOptions } from "./types/EIP712SignatureOptions";
import { TypedDataField } from "@ethersproject/abstract-signer";

export function w3cDate(date?: number | string): string {
  let result = new Date();
  if (typeof date === "number" || typeof date === "string") {
    result = new Date(date);
  }
  const str = result.toISOString();
  return str.substr(0, str.length - 5) + "Z";
}

export function c14nDocumentToEip712StructuredDataTypes(
  input: any
): Record<string, Array<TypedDataField>> {
  let output: Record<string, Array<TypedDataField>> = {};
  let types: Array<TypedDataField> = [];

  const inputCopy = { ...input };

  // TODO: support nested types
  for (let key in inputCopy) {
    switch (typeof inputCopy[key]) {
      case "boolean":
        types.push({
          name: key,
          type: "bool",
        });
        break;

      case "number":
        types.push({
          name: key,
          type: "uint256",
        });
        break;
      case "string":
        types.push({
          name: key,
          type: "string",
        });
        break;
      default:
        if (Array.isArray(inputCopy[key])) {
          types.push({
            name: key,
            type: "string[]",
          });
        } else {
          throw TypeError(`Unsupported type ${key} | ${inputCopy[key]}`);
        }
    }
  }

  output["Document"] = types;

  return output;
}
