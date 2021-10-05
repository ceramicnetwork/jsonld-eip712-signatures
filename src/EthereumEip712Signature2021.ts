import { TypedDataSigner } from "@ethersproject/abstract-signer";
import { suites } from "jsonld-signatures";
import { SuiteVerifyOptions } from "./types/SuiteVerifyOptions";
import { SignatureSuiteOptions } from "./types/SignatureSuiteOptions";
import { SuiteSignOptions } from "./types/SuiteSignOptions";
import { verifyTypedData } from "ethers/lib/utils";
import { CreateProofOptions } from "./types/CreateProofOptions";
import { TypedDataField } from "@ethersproject/abstract-signer";
import { generateStructuredDataTypes, w3cDate } from "./utils";
import { CreateVerifyDataOptions } from "./types/CreateVerifyDataOptions";
import { EIP712SignatureOptions } from "./types/EIP712SignatureOptions";
import { VerifyProofOptions } from "./types/VerifyProofOptions";
import { VerifyProofResult } from "./types/VerifyProofResult";

export class EthereumEip712Signature2021 extends suites.LinkedDataSignature {
  proof: Record<string, any>;
  LDKeyClass: any;
  signer: TypedDataSigner;
  proofSignatureKey: string;

  constructor(options: SignatureSuiteOptions = {}) {
    const {  signer, LDKeyClass } = options;
   
    super({ type: "EthereumEip712Signature2021" });

    this.proof = {
      type: "EthereumEip712Signature2021",
    };

    this.LDKeyClass = LDKeyClass;
    if (signer) {
      this.signer = signer;
    }
    this.proofSignatureKey = "proofValue";
  }

  async createProof(options: CreateProofOptions): Promise<any> {
    let proof: any = {
      type: this.type,
    };

    let embed = options.embed ?? true;

    if (
      options.verificationMethod !== undefined &&
      typeof options.verificationMethod !== "string"
    ) {
      throw TypeError(`"verificationMethod" must be a URI string`);
    }

    let date: string | number = options.date ? new Date(options.date).getTime() : undefined;
    if (date === undefined) {
      date = Date.now();
    }

    if (date !== undefined && typeof date !== "string") {
      date = w3cDate(date);
    }

    if (date !== undefined) {
      proof.created = date;
    }

    proof.verificationMethod = options.verificationMethod;

    proof = await options.purpose.update(proof, {
      document: options.document,
      suite: this,
      documentLoader: options.documentLoader,
      expansionMap: options.expansionMap,
    });

    let domain = options.domain ?? {};
    let types = options.types ?? generateStructuredDataTypes(options.document);
    const primaryType = options.primaryType ?? "Document";

    const toBeSignedDocument: EIP712SignatureOptions = {
      types,
      domain,
      primaryType,
      message: options.document,
    };

    const [c14nProof, c14nDocument] = await this.createVerifyData({
      proof,
      document: toBeSignedDocument,
    });

    let signOptions: SuiteSignOptions = {
      proof: c14nProof,
      verifyData: c14nDocument as EIP712SignatureOptions,
      embed: embed,
    };

    proof = await this.sign(signOptions);

    return proof;
  }

  async verifyProof(options: VerifyProofOptions): Promise<VerifyProofResult> {
    const { proof, document } = options;

    let domain = options.domain ?? {};
    let types = options.types ?? generateStructuredDataTypes(document);

    if (typeof types === "string") {
      types = await options.documentLoader(types).document;
    }

    const toBeVerifiedDocument: EIP712SignatureOptions = {
      types: types as Record<string, Array<TypedDataField>>,
      domain,
      primaryType: "Document",
      message: document,
    };

    try {
      const [c14nProof, c14nDocument] = await this.createVerifyData({
        proof,
        document: toBeVerifiedDocument,
      });

      const vm = this.getVerificationMethod(c14nProof);

      const verified = this.verifySignature({
        signature: proof[this.proofSignatureKey],
        verificationMethod: vm,
        domain: c14nDocument.domain,
        types: c14nDocument.types,
        message: c14nDocument.message,
        primaryType: c14nDocument.primaryType,
      });

      if (!verified) {
        throw Error(`Invalid signature`);
      }

      if (!(options.purpose.match(c14nProof, {}))) {
        throw Error(`Invalid purpose`);
      }

      return { verified: true };
    } catch (error) {
      return { verified: false, error };
    }
  }

  canonize(input: any): Record<string, any> {
    const ordered = Object.keys(input)
      .sort()
      .reduce((obj, key) => {
        obj[key] = input[key];
        return obj;
      }, {});
    return ordered;
  }

  canonizeProof(proof: any): Record<string, any> {
    proof = { ...proof };
    delete proof[this.proofSignatureKey];

    return this.canonize(proof);
  }

  async createVerifyData(
    options: CreateVerifyDataOptions
  ): Promise<Record<string, any>[]> {
    const { proof, document } = options;

    const c14nProof = this.canonizeProof(proof);
    const c14nDocument = this.canonize(document);

    return [c14nProof, c14nDocument];
  }

  getVerificationMethod(proof: any): string {
    let verificationMethod = proof.verificationMethod;

    if (typeof verificationMethod === "object") {
      verificationMethod = verificationMethod.id;
    }

    if (!verificationMethod) {
      throw new Error('No "verificationMethod" found in proof.');
    }

    // TODO: resolve DID to check if revoked?
    return verificationMethod;
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
    if (options.embed) {
      proof["eip712Domain"] = {
        domain: options.verifyData.domain,
        messageSchema: options.verifyData.types,
        primaryType: options.verifyData.primaryType,
      };
    }
    return proof;
  }

  verifySignature(options: SuiteVerifyOptions): boolean {
    const recoveredAddress = verifyTypedData(
      options.domain,
      options.types,
      options.message,
      options.signature
    );

    // TODO: add DID resolver (did-resolver)

    if (
      recoveredAddress.toLowerCase() ===
      this.extractAddressFromDID(options.verificationMethod).toLowerCase()
    ) {
      return true;
    }
    return false;
  }

  extractAddressFromDID(did: string): string {
    let address = did;
    if (address.startsWith("did")) {
      address = did.split(":").pop();
    }

    if (address.includes("#")) {
      address = address.split("#")[0];
    }

    return address;
  }
}
