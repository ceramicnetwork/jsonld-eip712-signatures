# jsonld-eip712-signatures

Experiments with JSON-LD documents and signatures as EIP712 structured data

Based on https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/

## TODO

- add tests and code to make sure changing order of properties doesnt affect signature verification
- add did resolver for did-pkh and did-ethr
- use the dag jose util library to put the message schema on IPFS and encode it as a URI

  - https://github.com/ceramicnetwork/js-dag-jose-utils/blob/master/src/index.ts#L15

- make demo in ceramic playground

- get rid of ethers.js

- use @ethersproject/wallet for verification
