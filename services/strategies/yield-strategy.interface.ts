export interface YieldStrategy {
  deploy(amount: string): Promise<void>;
  withdraw(amount: string): Promise<string>;
  getYield(): Promise<string>;
  getTotalValue(): Promise<string>;
}
