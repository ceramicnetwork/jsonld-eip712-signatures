import { Wallet } from "ethers";
import { EthereumEip712Signature2021 } from "../EthereumEip712Signature2021";

describe("EthereumEip712Signature2021", () => {
  it("should successfully do a low-level sign and verify", async () => {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const vm = `${address}#controller`;
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
    const value = {
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
        value,
      },
      proof: {},
    });

    const valid = s.verifySignature({
      domain,
      types,
      value,
      signature: signature.proofValue,
      verificationMethod: vm,
    });

    expect(valid).toBe(true);
  });
  it("should successfully be verified", () => {});
  it("should fail to verify invalid sig", () => {});
  it("should fail to verify with invalid doc", () => {});
  it("should fail to verify with modified doc", () => {});
  it("should sign nested verifiable credential", () => {});
  it("should verify nested verifiable credential", () => {});
});
