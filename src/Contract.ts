import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ZERO_ADDRESS } from './constants';

export interface IContractAddress {
  address: string;
  deployedAt: number;
}

export type BindingsFactory<C> = (
  address: string,
  signerOrProvider: Signer | Provider
) => C;

export interface SimpleContract<C> extends IContractAddress {
  factory: BindingsFactory<C>;
}

export class ContractVersions<F> {
  private readonly versions: IContractAddress[];
  factory: BindingsFactory<F>;

  constructor(factory: BindingsFactory<F>, versions: IContractAddress[] = []) {
    this.factory = factory;
    this.versions = versions;
  }

  public getVersion(i: number): SimpleContract<F> {
    if (i < 0 || i >= this.versions.length) {
      return this.contractNotFound();
    }
    return this.toSimpleContract(this.versions[i]);
  }

  private toSimpleContract(contract: IContractAddress): SimpleContract<F> {
    return {
      address: contract.address,
      deployedAt: contract.deployedAt,
      factory: this.factory,
    };
  }

  private contractNotFound() {
    return this.toSimpleContract({ address: ZERO_ADDRESS, deployedAt: 0 });
  }

  public atBlock(block: number): SimpleContract<F> {
    const found = this.versions
      .slice(0)
      .reverse()
      .find(contract => contract.deployedAt <= block);
    if (found) {
      return this.toSimpleContract(found);
    }
    return this.contractNotFound();
  }

  public latest(): SimpleContract<F> {
    if (this.versions.length === 0) {
      return this.contractNotFound();
    }
    return this.toSimpleContract(this.versions[this.versions.length - 1]);
  }

  public add(contract: IContractAddress) {
    this.versions.push(contract);
    this.versions.sort((c0, c1) => c0.deployedAt - c1.deployedAt);
  }
}

export interface IContractsRegistry {
  [contract: string]: ContractVersions<unknown>;
}