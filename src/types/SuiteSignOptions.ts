import { EIP712SignatureOptions } from "./EIP712SignatureOptions";

export interface SuiteSignOptions {
  verifyData: EIP712SignatureOptions;
  proof: Record<string, any>;
  embed: boolean;
}
