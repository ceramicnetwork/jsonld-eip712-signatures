import { TypedDataField } from "@ethersproject/abstract-signer";
import assert from "assert";

export function w3cDate(date?: number | string): string {
  let result = new Date();
  if (typeof date === "number" || typeof date === "string") {
    result = new Date(date);
  }
  const str = result.toISOString();
  return str.substr(0, str.length - 5) + "Z";
}

function deepEqual(a: any, b: any) {
  try {
    assert.deepStrictEqual(a, b);
  } catch (error) {
    if (error.name === "AssertionError") {
      return false;
    }
    throw error;
  }
  return true;
}

export function generateStructuredDataTypes(
  input: any
): Record<string, Array<TypedDataField>> {
  let output: Record<string, Array<TypedDataField>> = {};
  let types: Array<TypedDataField> = [];

  const inputCopy = { ...input };

  Object.keys(inputCopy)
    .sort()
    .forEach((key) => {
      const value = inputCopy[key];
      switch (typeof value) {
        case "bigint":
        case "number":
          types.push({
            name: key,
            type: "uint256",
          });
          break;
        case "boolean":
          types.push({
            name: key,
            type: "bool",
          });
          break;
        case "string":
          types.push({
            name: key,
            type: "string",
          });
          break;
        default:
          if (Array.isArray(value)) {
            types.push(_generateStructuredDataForArray(value, key));
          } else if (typeof value === "object") {
            const _recursiveStructuredData = generateStructuredDataTypes(value);
            const _recursiveTypes = _recursiveStructuredData["Document"];
            const type = key.charAt(0).toUpperCase() + key.slice(1);
            types.push({
              name: key,
              type: type,
            });

            output[type] = _recursiveTypes.sort();

            for (let otherType in _recursiveStructuredData) {
              if (otherType !== "Document") {
                const _recursiveOtherTypes =
                  _recursiveStructuredData[otherType].sort();

                if (
                  output[otherType] &&
                  !deepEqual(output[otherType], _recursiveOtherTypes)
                ) {
                  throw new Error(
                    `Input document has mixed types with same key name`
                  );
                } else {
                  output[otherType] = _recursiveOtherTypes;
                }
              }
            }
          } else {
            throw new Error(`Unsupported type ${key} | ${value}`);
          }
      }
    });

  output["Document"] = types.sort();
  return output;
}

function _generateStructuredDataForArray(
  arr: any[],
  key: string
): TypedDataField {
  if (allSameType(arr)) {
    const value0 = arr[0];
    switch (typeof value0) {
      case "bigint":
      case "number":
        return {
          name: key,
          type: "uint256[]",
        };
      case "boolean":
        return {
          name: key,
          type: "bool[]",
        };
      case "string":
        return {
          name: key,
          type: "string[]",
        };
      default:
        throw new Error("Unsupported array type");
    }
  } else {
    throw new Error("Arrays of mixed types are not supported");
  }
}

function allSameType(arr: any[]): boolean {
  return new Set(arr.map((x) => typeof x)).size <= 1;
}
