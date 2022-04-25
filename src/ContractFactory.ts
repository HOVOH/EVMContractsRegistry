import { Provider } from '@ethersproject/providers';
import { Signer } from 'ethers';

import {
  INetworksContractMap,
  NetworksContractsRegistry,
} from './contractRegistry';
import { NetworkID, ProvidersRegistry } from './providersRegistry';
import {
  ContractVersions,
  IContractsRegistry,
  SimpleContract,
} from './Contract';

export class ContractFactory<T extends INetworksContractMap<T>> {
  public readonly providers: ProvidersRegistry;
  private contracts: NetworksContractsRegistry<T>;

  constructor(
    providersRegistry: ProvidersRegistry,
    contractsRegistry: NetworksContractsRegistry<T>
  ) {
    this.providers = providersRegistry;
    this.contracts = contractsRegistry as NetworksContractsRegistry<T>;
  }

  public forNetwork<K extends keyof T>(
    network: K,
    provider?: Provider | Signer | null
  ) {
    const nid = network as NetworkID;
    if (!this.providers.networkAvailable(nid) && !provider) {
      throw Error(`Network ${network} is not available`);
    }
    const networkProvider = provider || this.providers.forNetwork(nid);
    const contracts = this.contracts.forNetwork(network);
    if (contracts) {
      return new NetworkContractFactory<T[K]>(
        networkProvider,
        contracts as T[K]
      );
    }
    return new NetworkContractFactory<T[K]>(networkProvider, {} as T[K]);
  }
}

// T is name => ContractVersion<FactoryType>
export class NetworkContractFactory<T extends IContractsRegistry<keyof T>> {
  public readonly networkProvider: Provider | Signer;
  private readonly contracts: IContractsRegistry<keyof T>;

  constructor(provider: Provider | Signer, contractsRegistry: T) {
    this.networkProvider = provider;
    this.contracts = contractsRegistry;
  }

  public getContractVersions<K extends keyof T>(contractName: K) {
    return this.contracts[contractName] as ContractVersions<
      ReturnType<T[K]['factory']>
    >;
  }

  public getContractAtBlock<K extends keyof T>(
    contractName: K,
    atBlock: number
  ) {
    return this.contracts[contractName].atBlock(atBlock) as SimpleContract<
      ReturnType<T[K]['factory']>
    >;
  }

  public getContract<K extends keyof T>(contractName: K, version: number) {
    return this.getContractVersions(contractName).getVersion(
      version
    ) as SimpleContract<ReturnType<T[K]['factory']>>;
  }

  public getLatestContract<K extends keyof T>(contractName: K) {
    const contract = this.getContractVersions(contractName).latest();
    return contract as SimpleContract<ReturnType<T[K]['factory']>>;
  }

  public getLatestContractInstance<K extends keyof T>(contractName: K) {
    const contract = this.getLatestContract(contractName);
    return contract.factory(contract.address, this.networkProvider);
  }

  public getContractInstanceAtBlock<K extends keyof T>(
    contractName: K,
    blockNumber: number
  ) {
    const contract = this.getContractAtBlock(
      contractName,
      blockNumber
    ) as SimpleContract<ReturnType<T[K]['factory']>>;
    return contract.factory(contract.address, this.networkProvider);
  }
}
