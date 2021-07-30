import { TypedDataSigner } from "@ethersproject/abstract-signer";
export interface SignatureSuiteOptions {
  readonly signer?: TypedDataSigner;
  readonly verificationMethod?: string;
  readonly date?: string | Date;
  readonly proof?: any;
  readonly LDKeyClass?: any;
}
