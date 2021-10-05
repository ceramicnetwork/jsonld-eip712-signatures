import { TypedDataSigner } from "@ethersproject/abstract-signer";
export interface SignatureSuiteOptions {
  readonly signer?: TypedDataSigner;
  readonly proof?: any;
  readonly LDKeyClass?: any;
}
