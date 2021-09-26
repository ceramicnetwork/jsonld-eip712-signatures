import { TypedDataField } from "@ethersproject/abstract-signer";

export interface VerifyProofOptions {
  domain?: any;
  types?: Record<string, TypedDataField[]> | string;
  readonly proof: any;
  readonly document: any;
  readonly purpose: any;
  documentLoader?: Function;
  expansionMap?: Function;
}
