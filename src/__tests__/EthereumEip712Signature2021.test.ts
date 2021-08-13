import { Wallet } from "ethers";
import { purposes } from "jsonld-signatures";
import { EthereumEip712Signature2021 } from "../EthereumEip712Signature2021";
import eip712Context from "../contexts/EIP712.json";
import securityV2Context from "../contexts/securityv2.json";
import securityV1Context from "../contexts/securityv1.json";
import schemaOrgContext from "../contexts/schemaOrg.json";

const documents: any = {
  "https://w3id.org/security#EthereumEip712Signature2021": eip712Context,
  "https://w3id.org/security/v2": securityV2Context,
  "https://w3id.org/security/v1": securityV1Context,
  "https://schema.org": schemaOrgContext,
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
    const vm = `did:ethr:${address}#controller`;
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
  it("should create and verify proof", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:ethr:${address}#controller`;
    const date = new Date();

    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
      date,
    });

    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
      lastName: "Does",
      jobTitle: "Professor",
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    try {
      const res = await s.createProof({
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        compactProof: false,
        documentLoader: customDocLoader,
      });

      const v = await s.verifyProof({
        proof: res,
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader: customDocLoader,
      });

      expect(v.verified).toEqual(true);
    } catch (error) {
      console.error(error);
    }
  });
  it("should create and verify proof over nested data", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:ethr:${address}#controller`;
    const date = new Date();

    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
      date,
    });

    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      data: {
        name: {
          firstName: "John",
          lastName: "Doe",
        },
        job: {
          jobTitle: "Professor",
          employer: "University of Waterloo",
        },
      },
      telephone: "(425) 123-4567",
    };

    try {
      const res = await s.createProof({
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        compactProof: false,
        documentLoader: customDocLoader,
      });

      const v = await s.verifyProof({
        proof: res,
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader: customDocLoader,
      });

      expect(v.verified).toEqual(true);
    } catch (error) {
      console.error(error);
    }
  });
  it("should fail to verify invalid sig", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:ethr:${address}#controller`;
    const date = new Date();

    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
      date,
    });

    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
      lastName: "Does",
      jobTitle: "Professor",
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    try {
      const proof = await s.createProof({
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        compactProof: false,
        documentLoader: customDocLoader,
      });

      proof.proofValue = "abc";

      const v = await s.verifyProof({
        proof: proof,
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader: customDocLoader,
      });

      expect(v.verified).toEqual(false);
    } catch (error) {
      console.error(error);
    }
  });
  it("should fail to verify with invalid doc", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:ethr:${address}#controller`;
    const date = new Date();

    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
      date,
    });

    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
      lastName: "Does",
      jobTitle: "Professor",
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    const invalidDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
    };

    try {
      const proof = await s.createProof({
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        compactProof: false,
        documentLoader: customDocLoader,
      });

      proof.proofValue = "abc";

      const v = await s.verifyProof({
        proof: proof,
        document: invalidDocument,
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader: customDocLoader,
      });

      expect(v.verified).toEqual(false);
    } catch (error) {
      console.error(error);
    }
  });
  it("should fail to verify with modified doc", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `did:ethr:${address}#controller`;
    const date = new Date();

    const s = new EthereumEip712Signature2021({
      signer: wallet,
      verificationMethod: vm,
      date,
    });

    const jsonLdDocument = {
      "@context": ["https://schema.org", "https://w3id.org/security/v2"],
      "@type": "Person",
      firstName: "Jane",
      lastName: "Does",
      jobTitle: "Professor",
      telephone: "(425) 123-4567",
      email: "jane.doe@example.com",
    };

    try {
      const proof = await s.createProof({
        document: jsonLdDocument,
        purpose: new purposes.AssertionProofPurpose(),
        compactProof: false,
        documentLoader: customDocLoader,
      });

      proof.proofValue = "abc";

      const v = await s.verifyProof({
        proof: proof,
        document: {
          ...jsonLdDocument,
          firstName: "John",
        },
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader: customDocLoader,
      });

      expect(v.verified).toEqual(false);
    } catch (error) {
      console.error(error);
    }
  });
});
