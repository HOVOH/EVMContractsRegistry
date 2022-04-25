import { IContractsRegistry } from './Contract';

export type INetworksContractMap<N> = {
  [network in keyof N]: IContractsRegistry<keyof N[network]>;
};

// T is registry keyed types
export class NetworksContractsRegistry<T extends INetworksContractMap<T>> {
  map: INetworksContractMap<T>;

  constructor() {
    this.map = {} as INetworksContractMap<T>;
  }

  public forNetwork<K extends keyof T>(network: K) {
    if (!this.networkAvailable(network)) {
      throw new Error(`Contracts for network ${network} unavailable`);
    }
    return this.map[network];
  }

  public addNetwork<K extends keyof T>(network: K, registry: T[K]) {
    this.map[network] = registry;
  }

  public networkAvailable<K extends keyof T>(network: K): boolean {
    return Boolean(this.map[network]);
  }
}
