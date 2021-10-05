import {
  TypedDataField,
  TypedDataDomain,
} from "@ethersproject/abstract-signer";

export interface CreateProofOptions {
  domain?: TypedDataDomain;
  types?: Record<string, TypedDataField[]>;
  primaryType?: string;
  readonly verificationMethod?: string;
  readonly date?: string | Date;
  readonly document: any;
  readonly purpose: any;
  embed?: boolean;
  documentLoader?: Function;
  expansionMap?: Function;
}
