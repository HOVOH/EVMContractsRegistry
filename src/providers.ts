import { Network } from './Network';
import { ProvidersRegistry } from './ProvidersRegistry';

export const providers = new ProvidersRegistry();
providers.addNetwork(Network.OPERA_MAIN_NET, {
  httpRpc: ['https://rpc.ftm.tools'],
  wsRpc: ['wss://wsapi.fantom.network/']
});

providers.addNetwork(Network.OPERA_TEST_NET, {
  httpRpc: ['https://rpc.testnet.fantom.network/'],
  wsRpc: []
});
