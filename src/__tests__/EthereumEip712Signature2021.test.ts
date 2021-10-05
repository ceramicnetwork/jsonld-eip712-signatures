import { Wallet } from "ethers";
import { purposes } from "jsonld-signatures";
import { EthereumEip712Signature2021 } from "../EthereumEip712Signature2021";
import eip712Context from "../contexts/EIP712.json";
import securityV2Context from "../contexts/securityv2.json";
import securityV1Context from "../contexts/securityv1.json";
import schemaOrgContext from "../contexts/schemaOrg.json";

import * as fixtures from "./fixtures";

const documents: any = {
  "https://w3id.org/security#EthereumEip712Signature2021": eip712Context,
  "https://w3id.org/security/v2": securityV2Context,
  "https://w3id.org/security/v1": securityV1Context,
  "https://schema.org": schemaOrgContext,
  "https://gist.githubusercontent.com/haardikk21/4005830542178141a762c109da5aa774/raw/67f6ea45dc847b1951033c6e4d4424bcb314be63/messageSchema.json":
    {
      Data: [
        {
          name: "job",
          type: "Job",
        },
        {
          name: "name",
          type: "Name",
        },
      ],
      Document: [
        {
          name: "@context",
          type: "string[]",
        },
        {
          name: "@type",
          type: "string",
        },
        {
          name: "data",
          type: "Data",
        },
        {
          name: "telephone",
          type: "string",
        },
      ],
      Job: [
        {
          name: "employer",
          type: "string",
        },
        {
          name: "jobTitle",
          type: "string",
        },
      ],
      Name: [
        {
          name: "firstName",
          type: "string",
        },
        {
          name: "lastName",
          type: "string",
        },
      ],
    },
};

const customDocLoader = (url: string): any => {
  const context = documents[url];

  if (context) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: context, // this is the actual document that was loaded
      documentUrl: url, // this is the actual context URL after redirects
    };
  }

  throw new Error(
    `Error attempted to load document remotely, please cache '${url}'`
  );
};

describe("EthereumEip712Signature2021", () => {
  it("should successfully do a low-level sign and verify", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:pkh:eip155:1:${address}#controller`;
    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
    });

    const domain = {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    };

    // The named list of all type definitions
    const types = {
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    };

    // The data to sign
    const message = {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: {
        name: "Bob",
        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
      },
      contents: "Hello, Bob!",
    };

    const signature = await s.sign({
      verifyData: {
        domain,
        types,
        message,
        primaryType: "Mail",
      },
      proof: {},
    });

    const valid = s.verifySignature({
      domain,
      types,
      message,
      primaryType: "Mail",
      signature: signature.proofValue,
      verificationMethod: vm,
    });

    expect(valid).toEqual(true);
  });

  it("should successfully create and verify a proof over basic document where schema is embedded", async () => {
    const wallet = new Wallet(fixtures.test_document.privateKey);

    const suite = new EthereumEip712Signature2021({signer: wallet});

    const proof = await suite.createProof({
      document: fixtures.test_document.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      verificationMethod: fixtures.test_document.inputOptions.verificationMethod,
      date: fixtures.test_document.inputOptions.date,
      domain: fixtures.test_document.inputOptions.domain,
      documentLoader: customDocLoader,
    });

    expect(proof).toEqual(fixtures.test_document.proof);

    const verificationResult = await suite.verifyProof({
      proof: fixtures.test_document.proof,
      document: fixtures.test_document.inputDocument,
      types: fixtures.test_document.proof.eip712Domain.messageSchema,
      domain: fixtures.test_document.proof.eip712Domain.domain,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: customDocLoader,
    });

    expect(verificationResult.verified).toEqual(true);
  });

  it("should successfully create and verify a proof over nested document where schema is embedded", async () => {
    const wallet = new Wallet(fixtures.test_nested_document.privateKey);

    const suite = new EthereumEip712Signature2021({signer: wallet});

    const proof = await suite.createProof({
      document: fixtures.test_nested_document.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      verificationMethod: fixtures.test_nested_document.inputOptions.verificationMethod,
      date: fixtures.test_nested_document.inputOptions.date,
      domain: fixtures.test_nested_document.inputOptions.domain,
      
      documentLoader: customDocLoader,
    });

    expect(proof).toEqual(fixtures.test_nested_document.proof);
    
    const verificationResult = await suite.verifyProof({
      proof: fixtures.test_nested_document.proof,
      types: fixtures.test_nested_document.proof.eip712Domain.messageSchema,
      domain: fixtures.test_nested_document.proof.eip712Domain.domain,
      document: fixtures.test_nested_document.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: customDocLoader,
    });

    expect(verificationResult.verified).toEqual(true);
  });

  it("should create and verify proof over nested data where schema is not embedded", async () => {
    const wallet = new Wallet(
      fixtures.test_nested_schema_not_embedded.privateKey
    );

    const suite = new EthereumEip712Signature2021({
      signer: wallet,
      
    });

    const proof = await suite.createProof({
      document: fixtures.test_nested_schema_not_embedded.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      verificationMethod:
        fixtures.test_nested_schema_not_embedded.inputOptions.verificationMethod,
      date: fixtures.test_nested_schema_not_embedded.inputOptions.date,
      embed: fixtures.test_nested_schema_not_embedded.inputOptions.embed,
      documentLoader: customDocLoader,
    });

    expect(proof).toEqual(fixtures.test_nested_schema_not_embedded.proof);

    const verificationResult = await suite.verifyProof({
      proof: proof,
      document: fixtures.test_nested_schema_not_embedded.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: customDocLoader,
    });

    expect(verificationResult.verified).toEqual(true);
  });

  it("should create and verify proof over nested data where schema is embedded as a URI", async () => {
    const wallet = new Wallet(fixtures.test_nested_schema_uri.privateKey);

    const suite = new EthereumEip712Signature2021({signer: wallet});

    const proof = await suite.createProof({
      document: fixtures.test_nested_schema_uri.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      verificationMethod: fixtures.test_nested_schema_uri.inputOptions.verificationMethod,
      date: fixtures.test_nested_schema_uri.inputOptions.date,
      domain: fixtures.test_nested_schema_uri.inputOptions.domain,
      documentLoader: customDocLoader,
    });

    const verificationResult = await suite.verifyProof({
      proof: proof,
      types: fixtures.test_nested_schema_uri.proof.eip712Domain.messageSchema,
      domain: fixtures.test_nested_schema_uri.proof.eip712Domain.domain,
      document: fixtures.test_nested_schema_uri.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: customDocLoader,
    });

    expect(verificationResult.verified).toEqual(true);
  });

  it("should create and verify proof over nested data where options are provided", async () => {
    const wallet = new Wallet(fixtures.test_nested_options_provided.privateKey);

    const suite = new EthereumEip712Signature2021({signer: wallet});

    const proof = await suite.createProof({
      document: fixtures.test_nested_options_provided.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      verificationMethod:
        fixtures.test_nested_options_provided.inputOptions.verificationMethod,
      date: fixtures.test_nested_options_provided.inputOptions.date,
      documentLoader: customDocLoader,
      types: fixtures.test_nested_options_provided.inputOptions.types,
      domain: fixtures.test_nested_options_provided.inputOptions.domain,
    });

    expect(proof).toEqual(fixtures.test_nested_options_provided.proof);

    const verificationResult = await suite.verifyProof({
      proof: proof,
      types: fixtures.test_nested_options_provided.inputOptions.types,
      domain: fixtures.test_nested_options_provided.inputOptions.domain,
      document: fixtures.test_nested_options_provided.inputDocument,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader: customDocLoader,
    });

    expect(verificationResult.verified).toEqual(true);
  });
});
