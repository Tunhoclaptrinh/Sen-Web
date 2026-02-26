import { BaseEntity, TimestampEntity } from "./index";

export enum VoucherType {
  TRAVEL = "travel",
  FOOD = "food",
  SHOP = "shop",
  DISCOUNT = "discount",
  OTHER = "other"
}

export enum CurrencyType {
  COINS = "coins",
  PETALS = "petals",
  PCOIN = "pcoin"
}

export interface Voucher extends BaseEntity, TimestampEntity {
  title: string;
  description: string;
  type: VoucherType;
  provider: string; // e.g., "P-coffee", "P-shop"
  price: number;
  currencyType: CurrencyType;
  image?: string;
  expiryDate: string;
  isActive: boolean;
  totalQuantity?: number;
  remainingQuantity?: number;
}

export interface UserVoucher extends BaseEntity, TimestampEntity {
  userId: number;
  voucherId: number;
  code: string;
  redeemedAt: string;
  isUsed: boolean;
  usedAt?: string;
  voucher?: Voucher; // Populated voucher details
}

export interface WelfareExchangeRate {
  fromCurrency: CurrencyType;
  toCurrency: CurrencyType;
  rate: number; // e.g., 10 coins = 1 P-coin => rate = 0.1
  minAmount?: number;
}

export interface ExchangeHistory extends BaseEntity, TimestampEntity {
  userId: number;
  fromAmount: number;
  fromCurrency: CurrencyType;
  toAmount: number;
  toCurrency: CurrencyType;
  rate: number;
}
