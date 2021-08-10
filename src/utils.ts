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
          type: "uint256", // uint8 all the way up to uint256
        });
        break;
      case "string":
        types.push({
          name: key,
          type: "string", // string and bytes8 to bytes32 and address (isEthAddress(xyz))
        });
        break;
      case "object":
        break;
      default:
        if (Array.isArray(inputCopy[key])) {
          types.push({
            name: key,
            type: "string[]", // same for arrays ^
          });
        } else {
          throw TypeError(`Unsupported type ${key} | ${inputCopy[key]}`);
        }
    }
  }

  output["Document"] = types;

  return output;
}
