import { Provider } from '@ethersproject/providers';
import { Signer } from "ethers";

import { NetworksContractsRegistry } from './contractRegistry';
import {NetworkID, ProvidersRegistry} from './providersRegistry';
import {
  ContractVersions,
  IContractsRegistry,
  SimpleContract,
} from './Contract';

export class ContractFactory<T> {
  public readonly providers: ProvidersRegistry;
  private contracts: NetworksContractsRegistry<IContractsRegistry>;

  constructor(
    providersRegistry: ProvidersRegistry,
    contractsRegistry: NetworksContractsRegistry<T>
  ) {
    this.providers = providersRegistry;
    this.contracts = (contractsRegistry as unknown) as NetworksContractsRegistry<
      IContractsRegistry
    >;
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

    return (new NetworkContractFactory<IContractsRegistry>(
      networkProvider,
      (this.contracts.forNetwork(
        nid as number | string
      ) as unknown) as IContractsRegistry
      // @ts-ignore
    ) as unknown) as NetworkContractFactory<T[K]>;
  }
}

// T is name => ContractVersion<FactoryType>
export class NetworkContractFactory<T extends IContractsRegistry> {
  public readonly networkProvider: Provider | Signer;
  private readonly contracts: IContractsRegistry;

  constructor(
    provider: Provider | Signer,
    contractsRegistry: IContractsRegistry
  ) {
    this.networkProvider = provider;
    this.contracts = contractsRegistry;
  }

  public getContractVersions<K extends keyof T>(contractName: K) {
    const key = contractName as string;
    return this.contracts[key] as ContractVersions<ReturnType<T[K]['factory']>>;
  }

  public getContractAtBlock<K extends keyof T>(
    contractName: K,
    atBlock: number
  ) {
    const key = contractName as string;
    return this.contracts[key].atBlock(atBlock) as SimpleContract<
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
