import BaseService from './base.service';

class HistoryService extends BaseService {
  constructor() {
    super('/history');
  }

  getRelated(id: number | string) {
    return this.get(`/${id}/related`);
  }
}

export default new HistoryService();
