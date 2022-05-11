import { ethers, Wallet } from 'ethers';
import { Provider as MulticallProvider } from "@hovoh/ethers-multicall";

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

  public forNetwork(nid: NetworkID) {
    const provider = this.getProvider(nid);
    if (this.privateKey) {
      const wallet = new Wallet(this.privateKey);
      return wallet.connect(provider);
    }
    return provider;
  }

  private getProvider(nid:NetworkID){
    return new ethers.providers.JsonRpcProvider(this.getUrl(nid));
  }

  public getUrl(nid: NetworkID) {
    return this.networks[nid].httpRpc[0];
  }

  public multicallForNetwork(nid: NetworkID){
    return MulticallProvider.create(this.getProvider(nid), nid as number);
  }

  public addNetwork(nid: NetworkID, providers: IProvider) {
    this.networks[nid] = providers;
  }

  public networkAvailable(nid: NetworkID) {
    return Boolean(this.networks[nid]);
  }
}
