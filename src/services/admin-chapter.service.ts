import ReviewableBaseService from "./reviewable.service";
import {Chapter} from "@/types/game.types";

class AdminChapterService extends ReviewableBaseService<Chapter> {
  constructor() {
    super("/admin/chapters");
  }

  reorder(chapterIds: number[]) {
    return this.put(`/reorder`, {
      chapterIds: chapterIds,
    });
  }
}

export default new AdminChapterService();
