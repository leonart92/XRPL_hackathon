import { type Amount, Client } from "xrpl";

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
      timeout: 20000,
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
    amount: Amount,
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

  async prepareIssueToken(params: {
    issuerAccount: string;
    destination: string;
    currency: string;
    amount: string;
  }) {
    const client = this.getClient();

    const transaction = {
      TransactionType: "Payment" as const,
      Account: params.issuerAccount,
      Destination: params.destination,
      Amount: {
        currency: params.currency,
        issuer: params.issuerAccount,
        value: params.amount,
      },
    };

    const prepared = await client.autofill(transaction, 20);
    return prepared;
  }

  async autofillWithBuffer(transaction: any, signerListCount = 0) {
    const client = this.getClient();
    return await client.autofill(transaction, 20 + signerListCount);
  }

  async subscribeToAccount(account: string, callback: (tx: any) => void) {
    const client = this.getClient();

    await client.request({
      command: "subscribe",
      accounts: [account],
    });

    client.on("transaction", (tx: any) => {
      const transaction = tx.tx_json || tx.transaction;
      
      if (transaction && transaction.Destination === account && tx.validated) {
        callback({ transaction, meta: tx.meta });
      }
    });
  }
}

export const xrplService = new XRPLService();
export { XRPLService, type NetworkType };
