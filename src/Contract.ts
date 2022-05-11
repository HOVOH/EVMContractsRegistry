import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ZERO_ADDRESS } from './constants';
import {Fragment, JsonFragment} from '@ethersproject/abi';

export interface IContractAddress {
  address: string;
  abi: JsonFragment[] | string[] | Fragment[],
  deployedAt: number;
}

export type BindingsFactory<C> = (
  address: string,
  signerOrProvider: Signer | Provider
) => C;

export type MulticallBindingsFactory<C> = (
    address: string,
) => C;

export interface SimpleContract<C, M> extends IContractAddress {
  factory: BindingsFactory<C>;
  multicallFactory: MulticallBindingsFactory<M>
}

const multicallUnavailable = () => { throw "Multicall is not available for this contract"; }

export class ContractVersions<F, T = never> {
  private readonly versions: IContractAddress[];
  factory: BindingsFactory<F>;
  multicallFactory: MulticallBindingsFactory<T>

  constructor(
      versions: IContractAddress[],
      factory: BindingsFactory<F>,
      multicallFactory?: MulticallBindingsFactory<T>
      ) {
    this.factory = factory;
    this.versions = versions;
    this.multicallFactory = multicallFactory ?? multicallUnavailable;
  }

  public getVersion(i: number): SimpleContract<F, T> {
    if (i < 0 || i >= this.versions.length) {
      throw new Error('Contract not found');
    }
    return this.toSimpleContract(this.versions[i]);
  }

  private toSimpleContract(contract?: IContractAddress): SimpleContract<F, T> {
    if (!contract) {
      throw new Error('Contract not found');
    }
    return {
      address: contract.address,
      deployedAt: contract.deployedAt,
      factory: this.factory,
      multicallFactory: this.multicallFactory,
      abi: contract.abi
    };
  }

  public atBlock(block: number): SimpleContract<F, T> {
    const found = this.versions
      .slice(0)
      .reverse()
      .find((contract) => contract.deployedAt <= block);
    return this.toSimpleContract(found);
  }

  public latest(): SimpleContract<F, T> {
    if (this.versions.length === 0) {
      throw new Error('Contract not found');
    }
    return this.toSimpleContract(this.versions[this.versions.length - 1]);
  }

  public add(contract: IContractAddress) {
    this.versions.push(contract);
    this.versions.sort((c0, c1) => c0.deployedAt - c1.deployedAt);
  }
}

export type IContractsRegistry<T extends string | number | symbol> = {
  [contract in T]: ContractVersions<unknown, unknown>;
};
