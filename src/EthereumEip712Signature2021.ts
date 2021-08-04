import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { suites } from "jsonld-signatures";
import { SuiteVerifyOptions } from "./types/SuiteVerifyOptions";
import { SignatureSuiteOptions } from "./types/SignatureSuiteOptions";
import { SuiteSignOptions } from "./types/SuiteSignOptions";
import { verifyTypedData } from "ethers/lib/utils";
import { CreateProofOptions } from "./types/CreateProofOptions";
import { c14nDocumentToEip712StructuredDataTypes, w3cDate } from "./utils";
import { CreateVerifyDataOptions } from "./types/CreateVerifyDataOptions";
import jcs from "canonicalize";
import { EIP712SignatureOptions } from "./types/EIP712SignatureOptions";

export class EthereumEip712Signature2021 extends suites.LinkedDataSignature {
  proof: Record<string, any>;
  LDKeyClass: any;
  signer: TypedDataSigner;
  verificationMethod: string;
  proofSignatureKey: string;
  date: string | number;

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
      this.date = new Date(date).getTime();
    }
  }

  async createProof(options: CreateProofOptions): Promise<any> {
    let proof: any = {
      type: this.type,
    };

    let date = this.date;
    if (date === undefined) {
      date = Date.now();
    }

    if (date !== undefined && typeof date !== "string") {
      date = w3cDate(date);
    }

    if (date !== undefined) {
      proof.created = date;
    }

    if (this.verificationMethod !== undefined) {
      proof.verificationMethod = this.verificationMethod;
    }

    proof = await options.purpose.update(proof, {
      document: options.document,
      suite: this,
      documentLoader: options.documentLoader,
      expansionMap: options.expansionMap,
    });

    const domain = {
      name: "https://example.com",
      version: "2",
      chainId: 4,
      salt: "0x000000000000000000000000000000000000000000000000aaaabbbbccccdddd",
    };

    const toBeSignedDocument: EIP712SignatureOptions = {
      types: {
        ...c14nDocumentToEip712StructuredDataTypes(options.document),
        // TODO: Eip712Domain here???
      },
      domain,
      primaryType: "Document",
      message: options.document,
    };

    const [c14nProof, c14nDocument] = await this.createVerifyData({
      proof,
      document: toBeSignedDocument,
    });

    let signOptions: SuiteSignOptions = {
      proof: JSON.parse(c14nProof),
      verifyData: JSON.parse(c14nDocument),
    };

    proof = await this.sign(signOptions);

    return proof;
  }

  // TODO: Stricter types

  async verifyProof(data: any): Promise<any> {
    return "Not implemented";
  }

  async canonize(input: any): Promise<string> {
    return jcs(input);
  }

  async canonizeProof(proof: any): Promise<string> {
    proof = { ...proof };
    delete proof[this.proofSignatureKey];
    return this.canonize(proof);
  }

  async createVerifyData(options: CreateVerifyDataOptions): Promise<string[]> {
    const { proof, document } = options;

    const c14nProof = await this.canonizeProof(proof);
    const c14nDocument = await this.canonize(document);

    return [c14nProof, c14nDocument];
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
      verifyData.message
    );

    proof[this.proofSignatureKey] = proofValue;
    proof["eip712Domain"] = {
      domain: options.verifyData.domain,
      messageSchema: options.verifyData.types,
      primaryType: options.verifyData.primaryType,
    };
    return proof;
  }

  verifySignature(options: SuiteVerifyOptions): boolean {
    const recoveredAddress = verifyTypedData(
      options.domain,
      options.types,
      options.message,
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
