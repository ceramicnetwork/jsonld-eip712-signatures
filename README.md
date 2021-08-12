# jsonld-eip712-signatures

Experiments with JSON-LD documents and signatures as EIP712 structured data

Based on https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/

## Ask Joel

- When converting from JSON-LD to structured data, how to differentiate between different lenghts of uints, bytes, address/string etc.
  - address/string can be figured out by something like `isEthereumAddress(str)`
  - keep string for now, add optional Types array to function params
- Spec requires `EIP712Domain` type to be specified, but since it is not used in the message ethers.js throws an unused type error. Can keep it for decorative purposes and ignore it during signing/verification but don't think that's the right way to go about it.
  - is this a bug with ethers???
- Security context URL for this scheme

  - temp custom doc loader, need to make a issue

// TODO

- use the dag jose util library to put the message schema on IPFS and encode it as a URI

  - https://github.com/ceramicnetwork/js-dag-jose-utils/blob/master/src/index.ts#L15

- move more thigns to function params instead of constructor
- get rid of ethers.js
- use @ethersproject/wallet for verification
