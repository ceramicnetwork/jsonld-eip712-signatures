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
          if (allSameType(inputCopy[key])) {
            let type: string;
            switch (typeof inputCopy[key][0]) {
              case "boolean":
                type = "bool[]";
                break;
              case "number":
                type = "uint256[]";
                break;
              case "string":
                type = "string[]";
                break;
              default:
                throw new Error("Unsupported type");
            }
            types.push({
              name: key,
              type: type,
            });
          } else {
            throw new Error("Array of mixed types are not supported");
          }
        } else if (typeof inputCopy[key] === "object") {
          let _recursiveStructuredData =
            c14nDocumentToEip712StructuredDataTypes(inputCopy[key]);

          let _recursiveTypes = _recursiveStructuredData["Document"];
          const type = key.charAt(0).toUpperCase() + key.slice(1);
          types.push({
            name: key,
            type: type,
          });

          output[type] = _recursiveTypes;

          for (let otherType in _recursiveStructuredData) {
            if (otherType !== "Document") {
              output[otherType] = _recursiveStructuredData[otherType];
            }
          }
        } else {
          throw TypeError(`Unsupported type ${key} | ${inputCopy[key]}`);
        }
    }
  }

  output["Document"] = types;

  return output;
}

function allSameType(arr: any[]): boolean {
  return new Set(arr.map((x) => typeof x)).size <= 1;
}
