import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";

export interface EIP712SignatureOptions {
  domain: TypedDataDomain;
  types: Record<string, Array<TypedDataField>>;
  message: Record<string, any>;
  primaryType: string;
}
