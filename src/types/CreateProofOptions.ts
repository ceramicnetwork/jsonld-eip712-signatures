import { TypedDataField } from "@ethersproject/abstract-signer";

export interface CreateProofOptions {
  domain?: any;
  types?: Record<string, TypedDataField[]>;
  readonly document: any;
  readonly purpose: any;
  documentLoader?: Function;
  expansionMap?: Function;
  readonly compactProof: boolean;
}
