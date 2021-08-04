export interface CreateProofOptions {
  readonly document: any;
  readonly purpose: any;
  documentLoader?: Function;
  expansionMap?: Function;
  readonly compactProof: boolean;
}
