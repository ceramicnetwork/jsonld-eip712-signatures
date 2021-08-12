import {
  TypedDataField,
  TypedDataDomain,
} from "@ethersproject/abstract-signer";

export interface CreateProofOptions {
  domain?: TypedDataDomain;
  types?: Record<string, TypedDataField[]>;
  primaryType?: string;
  readonly document: any;
  readonly purpose: any;
  documentLoader?: Function;
  expansionMap?: Function;
  readonly compactProof: boolean;
}
