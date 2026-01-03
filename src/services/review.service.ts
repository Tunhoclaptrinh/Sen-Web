import BaseService from './base.service';

class ReviewService extends BaseService {
    constructor() {
        super('/reviews');
    }
}

export default new ReviewService();
