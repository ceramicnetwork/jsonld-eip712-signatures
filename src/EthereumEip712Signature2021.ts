import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { suites } from "jsonld-signatures";
import { SuiteVerifyOptions } from "./types/SuiteVerifyOptions";
import { SignatureSuiteOptions } from "./types/SignatureSuiteOptions";
import { SuiteSignOptions } from "./types/SuiteSignOptions";
import { verifyTypedData } from "ethers/lib/utils";

export class EthereumEip712Signature2021 extends suites.LinkedDataSignature {
  proof: Record<string, any>;
  LDKeyClass: any;
  signer: TypedDataSigner;
  verificationMethod: string;
  proofSignatureKey: string;
  date: Date;

  constructor(options: SignatureSuiteOptions = {}) {
    const { verificationMethod, signer, date, LDKeyClass } = options;
    if (
      verificationMethod !== undefined &&
      typeof verificationMethod !== "string"
    ) {
      throw TypeError(`"verificationMethod" must be a URI string`);
    }
    super({ type: "EthereumEip712Signature2021" });

    this.proof = {
      type: "EthereumEip712Signature2021",
    };

    this.LDKeyClass = LDKeyClass;
    if (signer) {
      this.signer = signer;
    }
    this.verificationMethod = verificationMethod;
    this.proofSignatureKey = "proofValue";

    if (date) {
      this.date = new Date(date);
    }
  }

  // TODO: Stricter types
  async createProof(data: any): Promise<any> {
    return "Not implemented";
  }

  async updateProof(data: any): Promise<any> {
    return "Not implemented";
  }

  async verifyProof(data: any): Promise<any> {
    return "Not implemented";
  }

  async canonize(data: any): Promise<any> {
    return "Not implemented";
  }

  async canonizeProof(data: any): Promise<any> {
    return "Not implemented";
  }

  async createVerifyData(data: any): Promise<any> {
    return "Not implemented";
  }

  async getVerificationMethod(data: any): Promise<any> {
    return "Not implemented";
  }

  async sign(options: SuiteSignOptions): Promise<Record<string, any>> {
    const { verifyData, proof } = options;

    if (!this.signer) {
      throw new Error("A Web3 Signer API has not been specified");
    }

    const proofValue = await this.signer._signTypedData(
      verifyData.domain,
      verifyData.types,
      verifyData.value
    );

    proof[this.proofSignatureKey] = proofValue;

    return proof;
  }

  verifySignature(options: SuiteVerifyOptions): boolean {
    const recoveredAddress = verifyTypedData(
      options.domain,
      options.types,
      options.value,
      options.signature
    );

    if (
      recoveredAddress.toLowerCase() ===
      options.verificationMethod.split("#")[0].toLowerCase()
    ) {
      return true;
    }
    return false;
  }
}
