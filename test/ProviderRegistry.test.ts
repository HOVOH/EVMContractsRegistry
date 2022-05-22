import {Network, providers, ProvidersRegistry} from "../src";

describe("Providers Registry", () => {

    it("Should return http provider", async () => {
        const provider = providers.forNetwork(Network.OPERA_MAIN_NET)
    })

    it("Should return ws provider", async () => {
        const provider = providers.wsForNetwork(Network.OPERA_MAIN_NET)
    })

    it("Should return Multicall provider", async () => {
        const provider = providers.multicallForNetwork(Network.OPERA_MAIN_NET)
    })
})
