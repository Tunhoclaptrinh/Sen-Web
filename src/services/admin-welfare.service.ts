import BaseService from "./base.service";
import { Voucher } from "../types/welfare.types";

class AdminWelfareService extends BaseService<Voucher> {
  constructor() {
    super("/admin/welfare");
  }

  // Voucher CRUD is handled by BaseService (get, post, put, delete)
  
  async getStats() {
    return this.get<any>("/stats");
  }

  async extendVoucher(voucherId: number, newExpiryDate: string) {
    return this.patchRequest<Voucher>(`/vouchers/${voucherId}/extend`, { expiryDate: newExpiryDate });
  }
}

export default new AdminWelfareService();
