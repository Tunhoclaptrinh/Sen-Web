import BaseService from "./base.service";

class AdminScreenService extends BaseService<any> {
    constructor() {
        super('/admin/levels');
    }

    /**
     * Get all screens of a level
     */
    async getScreens(levelId: string | number) {
        return this.get(`/${levelId}/screens`);
    }

    /**
     * Get screen detail
     */
    async getScreenDetail(levelId: string | number, screenId: string) {
        return this.get(`/${levelId}/screens/${screenId}`);
    }

    /**
     * Add new screen
     */
    async addScreen(levelId: string | number, screenData: any) {
        return this.post(`/${levelId}/screens`, screenData);
    }

    /**
     * Update screen
     */
    async updateScreen(levelId: string | number, screenId: string, screenData: any) {
        return this.put(`/${levelId}/screens/${screenId}`, screenData);
    }

    /**
     * Delete screen
     */
    async deleteScreen(levelId: string | number, screenId: string) {
        return this.delete(`/${levelId}/screens/${screenId}`);
    }

    /**
     * Reorder screens
     */
    async reorderScreens(levelId: string | number, screenIds: string[]) {
        return this.put(`/${levelId}/screens/reorder`, { screenIds });
    }
}

export default new AdminScreenService();
