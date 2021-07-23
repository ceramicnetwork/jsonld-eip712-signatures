import { suites } from "jsonld-signatures";

export class EthereumEip712Signature2021 extends suites.LinkedDataSignature {
  constructor() {
    // TODO : add impl
    super({ type: "TODO:EthereumEip712Signature2021" });
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

  async sign(data: any): Promise<any> {
    return "Not implemented";
  }

  async verifySignature(data: any): Promise<any> {
    return "Not implemented";
  }
}
