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

  async getAccountBalance(account: string) {
    const client = this.getClient();

    const response = await client.request({
      command: "account_lines",
      account,
      ledger_index: "validated",
    });

    const accountInfo = await client.request({
      command: "account_info",
      account,
      ledger_index: "validated",
    });

    return {
      xrp: accountInfo.result.account_data.Balance,
      tokens: response.result.lines.map((line) => ({
        currency: line.currency,
        issuer: line.account,
        balance: line.balance,
      })),
    };
  }

  transfer(
    account: string,
    destination: string,
    currency: string,
    amount: number,
    issuer: string,
  ) {
    return {
      TransactionType: "Payment",
      Account: account,
      Destination: destination,
      Amount: {
        currency,
        issuer,
        value: amount,
      },
    };
  }
}

export const xrplService = new XRPLService();
export { XRPLService, type NetworkType };
