import { ContractVersions } from '../src';
import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ZERO_ADDRESS } from '../src';

class TestContract {
  tag = 'test_contract';
  counter = 0;

  constructor(public address: string, public provider: Signer | Provider) {}

  static connect(address: string, signerOrProvider: Signer | Provider) {
    return new TestContract(address, signerOrProvider);
  }

  async hello() {
    this.counter += 1;
  }
}

describe('ContractVersions', () => {
  const ADDR_0 = '0x0001';
  const ADDR_1 = '0x1234';
  const ADDR_2 = '0x0303';
  const DEPLOYED_0 = 10;
  const DEPLOYED_1 = 150;
  const DEPLOYED_2 = 30000;

  let versions: ContractVersions<TestContract>;

  beforeEach(() => {
    versions = new ContractVersions([
      { address: ADDR_0, deployedAt: DEPLOYED_0 },
      { address: ADDR_1, deployedAt: DEPLOYED_1 },
      { address: ADDR_2, deployedAt: DEPLOYED_2 },
    ], TestContract.connect );
  });

  it('Should return the version', () => {
    expect(versions.getVersion(0).address).toEqual(ADDR_0);
    expect(versions.getVersion(1).address).toEqual(ADDR_1);
    expect(versions.getVersion(2).address).toEqual(ADDR_2);
  });

  it('Should return throw and error if no contracts found', () => {
    expect(() => versions.getVersion(-1).address).toThrow();
    expect(() => versions.getVersion(10).address).toThrow();
  });

  it('Should return contract at blocks', () => {
    expect(versions.atBlock(DEPLOYED_0).address).toEqual(ADDR_0);
    expect(versions.atBlock(DEPLOYED_0 + 1).address).toEqual(ADDR_0);
    expect(versions.atBlock(DEPLOYED_1 - 1).address).toEqual(ADDR_0);
    expect(versions.atBlock(DEPLOYED_1).address).toEqual(ADDR_1);
    expect(versions.atBlock(DEPLOYED_1 + 1).address).toEqual(ADDR_1);
    expect(versions.atBlock(DEPLOYED_2 - 1).address).toEqual(ADDR_1);
    expect(versions.atBlock(DEPLOYED_2).address).toEqual(ADDR_2);
    expect(versions.atBlock(DEPLOYED_2 + 1).address).toEqual(ADDR_2);
  });

  it('Should throw an error if no contract deployed at block', () => {
    expect(() => versions.atBlock(DEPLOYED_0 - 1)).toThrow();
  });

  it('Should return latest contract', () => {
    expect(versions.latest().address).toEqual(ADDR_2);
  });

  it('Should add a version and keep the order', () => {
    const ADD_ADDR = '0x9999';
    const ADD_DEPLOYED = DEPLOYED_1 - 10;
    versions.add({ deployedAt: ADD_DEPLOYED, address: ADD_ADDR });
    expect(versions.getVersion(0).address).toEqual(ADDR_0);
    expect(versions.getVersion(1).address).toEqual(ADD_ADDR);
    expect(versions.getVersion(2).address).toEqual(ADDR_1);
  });
});
