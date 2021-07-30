import { EIP712SignatureOptions } from "./EIP712SignatureOptions";

export interface SuiteVerifyOptions extends EIP712SignatureOptions {
  signature: string;
  verificationMethod: string;
}
