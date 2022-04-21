import { ethers, Wallet } from 'ethers';

export interface IProvider {
  httpRpc: string[];
}

export type NetworkID = string | number;

export interface INetworksProviders {
  [networkID: NetworkID]: IProvider;
}

export class ProvidersRegistry {
  networks: INetworksProviders;
  private privateKey: string | undefined;

  constructor(privateKey?: string) {
    this.networks = {};
    this.privateKey = privateKey;
  }

  public setPrivateKey(pk: string) {
    this.privateKey = pk;
  }

  public getUrl(nid: NetworkID) {
    return this.networks[nid].httpRpc[0];
  }

  public forNetwork(nid: NetworkID) {
    const provider = new ethers.providers.JsonRpcProvider(this.getUrl(nid));
    if (this.privateKey) {
      const wallet = new Wallet(this.privateKey);
      return wallet.connect(provider);
    }
    return provider;
  }

  public addNetwork(nid: NetworkID, providers: IProvider) {
    this.networks[nid] = providers;
  }

  public networkAvailable(nid: NetworkID) {
    return Boolean(this.networks[nid]);
  }
}
