import { IContractsRegistry } from './Contract';
import { NetworkID } from './providersRegistry';

export interface INetworksContractMap {
  [network: NetworkID]: IContractsRegistry;
}

// T is registry keyed types
export class NetworksContractsRegistry<T> {
  map: INetworksContractMap;

  constructor() {
    this.map = {};
  }

  public forNetwork<K extends keyof T>(network: K) {
    const networkID = network as NetworkID;
    if (!this.networkAvailable(networkID)) {
      throw new Error(`Contracts for network ${network} unavailable`);
    }
    return (this.map[networkID] as unknown) as T[K];
  }

  public addNetwork<K extends keyof T>(network: K, registry: T[K]) {
    this.map[network as NetworkID] = (registry as unknown) as IContractsRegistry;
  }

  public networkAvailable(network: NetworkID): boolean {
    return Boolean(this.map[network]);
  }
}
