import BaseService from "./base.service";
import { Voucher, UserVoucher, CurrencyType, ExchangeHistory } from "../types/welfare.types";

class WelfareService extends BaseService<any> {
  constructor() {
    super("/welfare");
  }

  // Vouchers
  async getAvailableVouchers() {
    return this.get<Voucher[]>("/vouchers");
  }

  async getMyVouchers() {
    return this.get<UserVoucher[]>("/my-vouchers");
  }

  async redeemVoucher(voucherId: number) {
    return this.post<UserVoucher>(`/vouchers/${voucherId}/redeem`);
  }

  // P-coin Exchange
  async getExchangeRates() {
    // Mocking exchange rates for now
    return [
      { fromCurrency: CurrencyType.COINS, toCurrency: CurrencyType.PCOIN, rate: 0.1, minAmount: 100 },
      { fromCurrency: CurrencyType.PETALS, toCurrency: CurrencyType.PCOIN, rate: 1, minAmount: 10 }
    ];
  }

  async exchangeResource(params: { fromCurrency: CurrencyType; amount: number }) {
    return this.post<ExchangeHistory>("/exchange", params);
  }

  async getExchangeHistory() {
    return this.get<ExchangeHistory[]>("/exchange/history");
  }
}

export default new WelfareService();
