import { Client } from "xrpl";

type NetworkType = "mainnet" | "testnet" | "devnet";

const NETWORK_URLS: Record<NetworkType, string> = {
  mainnet: "wss://xrplcluster.com",
  testnet: "wss://s.altnet.rippletest.net:51233",
  devnet: "wss://s.devnet.rippletest.net:51233",
};

class XRPLService {
  private client: Client | null = null;
  private currentNetwork: NetworkType = "mainnet";

  async connect(network: NetworkType = "mainnet"): Promise<Client> {
    if (this.client?.isConnected()) {
      return this.client;
    }

    this.currentNetwork = network;
    const url = NETWORK_URLS[network];

    this.client = new Client(url, {
      connectionTimeout: 10000,
    });

    await this.client.connect();

    return this.client;
  }

  getClient(): Client {
    if (!this.client || !this.client.isConnected()) {
      throw new Error("XRPL client not connected. Call connect() first.");
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.isConnected() ?? false;
  }

  getNetwork(): NetworkType {
    return this.currentNetwork;
  }

  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    if (this.client.isConnected()) {
      await this.client.disconnect();
    }

    this.client = null;
  }
}

export const xrplService = new XRPLService();
export { XRPLService, type NetworkType };
