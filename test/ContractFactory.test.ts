import { ContractFactory } from '../src';
import { ContractVersions } from '../src';
import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { providers } from '../src';
import { NetworksContractsRegistry } from '../src';
import { Network } from '../src';

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

class SecondTestContract extends TestContract {
  tag = 'nd_test_contract';
  counter = 0;

  static connect(address: string, signerOrProvider: Signer | Provider) {
    return new SecondTestContract(address, signerOrProvider);
  }

  async world() {
    this.counter += 1;
  }
}

interface ITestRegistry {
  token: ContractVersions<TestContract>;
  staking: ContractVersions<SecondTestContract>;
}

interface ITestRegistry2 {
  token: ContractVersions<TestContract>;
}

interface INetworkTestRegistries {
  [Network.OPERA_MAIN_NET]: ITestRegistry;
  [Network.OPERA_TEST_NET]: ITestRegistry2;
}

const contracts = new NetworksContractsRegistry<INetworkTestRegistries>();
const mainnetContracts: ITestRegistry = {
  token: new ContractVersions(TestContract.connect, [
    { address: '0xtest', deployedAt: 1 },
  ]),
  staking: new ContractVersions(SecondTestContract.connect, [
    { address: '0xdead', deployedAt: 0 },
  ]),
};
contracts.addNetwork(Network.OPERA_MAIN_NET, mainnetContracts);
const testnetContracts: ITestRegistry2 = {
  token: new ContractVersions(TestContract.connect, [
    { address: '0xtest', deployedAt: 1 },
  ]),
};
contracts.addNetwork(Network.OPERA_TEST_NET, testnetContracts);

describe('ContractFactory', () => {
  let contractFactory: ContractFactory<INetworkTestRegistries>;

  beforeEach(function() {
    contractFactory = new ContractFactory(providers, contracts);
  });

  it('Should return the network contract factory', () => {
    const networkContractFactory = contractFactory.forNetwork(
      Network.OPERA_MAIN_NET
    );
    expect(networkContractFactory.networkProvider).not.toBeNull();
  });

  it('Should return the contracts properly typed and initialised', () => {
    const staking = contractFactory
      .forNetwork(Network.OPERA_MAIN_NET)
      .getLatestContractInstance('staking');
    staking.world();
    expect(staking.counter).toEqual(1);
    const token = contractFactory
      .forNetwork(Network.OPERA_MAIN_NET)
      .getLatestContractInstance('token');
    token.hello();
    expect(token.counter).toEqual(1);
    const tokenTestnet = contractFactory
      .forNetwork(Network.OPERA_TEST_NET)
      .getLatestContractInstance('token');
    tokenTestnet.hello();
    expect(tokenTestnet.counter).toEqual(1);
  });

  it('Should return the SimpleContract instance', () => {
    const contract = contractFactory
      .forNetwork(Network.OPERA_MAIN_NET)
      .getLatestContract('token');
    expect(contract.address).toEqual(mainnetContracts.token.latest().address);
  });
});
