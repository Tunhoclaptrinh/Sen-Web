export const STORAGE_KEYS = {
  TOKEN: 'sen_token',
  USER: 'sen_user',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  RESEARCHER: 'researcher',
  CURATOR: 'curator',
};

export const HERITAGE_TYPES = {
  MONUMENT: 'monument',
  TEMPLE: 'temple',
  MUSEUM: 'museum',
  ARCHAEOLOGICAL_SITE: 'archaeological_site',
  HISTORIC_BUILDING: 'historic_building',
  NATURAL_HERITAGE: 'natural_heritage',
  INTANGIBLE_HERITAGE: 'intangible_heritage',
};

export const HERITAGE_TYPE_LABELS = {
  [HERITAGE_TYPES.MONUMENT]: 'Di tích',
  [HERITAGE_TYPES.TEMPLE]: 'Đền chùa',
  [HERITAGE_TYPES.MUSEUM]: 'Bảo tàng',
  [HERITAGE_TYPES.ARCHAEOLOGICAL_SITE]: 'Khu khảo cổ',
  [HERITAGE_TYPES.HISTORIC_BUILDING]: 'Công trình lịch sử',
  [HERITAGE_TYPES.NATURAL_HERITAGE]: 'Di sản thiên nhiên',
  [HERITAGE_TYPES.INTANGIBLE_HERITAGE]: 'Di sản phi vật thể',
};

export const ARTIFACT_TYPES = {
  SCULPTURE: 'sculpture',
  PAINTING: 'painting',
  DOCUMENT: 'document',
  POTTERY: 'pottery',
  TEXTILE: 'textile',
  TOOL: 'tool',
  WEAPON: 'weapon',
  JEWELRY: 'jewelry',
  MANUSCRIPT: 'manuscript',
  PHOTOGRAPH: 'photograph',
  OTHER: 'other',
};

export const ARTIFACT_TYPE_LABELS = {
  [ARTIFACT_TYPES.SCULPTURE]: 'Điêu khắc',
  [ARTIFACT_TYPES.PAINTING]: 'Tranh vẽ',
  [ARTIFACT_TYPES.DOCUMENT]: 'Tài liệu',
  [ARTIFACT_TYPES.POTTERY]: 'Gốm sứ',
  [ARTIFACT_TYPES.TEXTILE]: 'Dệt may',
  [ARTIFACT_TYPES.TOOL]: 'Công cụ',
  [ARTIFACT_TYPES.WEAPON]: 'Vũ khí',
  [ARTIFACT_TYPES.JEWELRY]: 'Trang sức',
  [ARTIFACT_TYPES.MANUSCRIPT]: 'Bản thảo',
  [ARTIFACT_TYPES.PHOTOGRAPH]: 'Ảnh',
  [ARTIFACT_TYPES.OTHER]: 'Khác',
};

export const ARTIFACT_CONDITIONS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

export const CONDITION_LABELS = {
  [ARTIFACT_CONDITIONS.EXCELLENT]: 'Tuyệt vời',
  [ARTIFACT_CONDITIONS.GOOD]: 'Tốt',
  [ARTIFACT_CONDITIONS.FAIR]: 'Khá',
  [ARTIFACT_CONDITIONS.POOR]: 'Kém',
};

export const SIGNIFICANCE_LEVELS = {
  LOCAL: 'local',
  NATIONAL: 'national',
  INTERNATIONAL: 'international',
};

export const SIGNIFICANCE_LABELS = {
  [SIGNIFICANCE_LEVELS.LOCAL]: 'Địa phương',
  [SIGNIFICANCE_LEVELS.NATIONAL]: 'Quốc gia',
  [SIGNIFICANCE_LEVELS.INTERNATIONAL]: 'Quốc tế',
};

export const REGIONS = [
  'Hà Nội',
  'Hải Phòng',
  'Quảng Ninh',
  'Ninh Bình',
  'Thanh Hóa',
  'Nghệ An',
  'Huế',
  'Đà Nẵng',
  'Quảng Nam',
  'Quảng Ngãi',
  'Khánh Hòa',
  'Lâm Đồng',
  'TP. Hồ Chí Minh',
  'An Giang',
  'Cần Thơ',
];

export const TIMELINE_CATEGORIES = {
  FOUNDED: 'founded',
  DAMAGED: 'damaged',
  RESTORED: 'restored',
  DISCOVERY: 'discovery',
  EVENT: 'event',
  RECOGNITION: 'recognition',
};

export const TIMELINE_CATEGORY_LABELS = {
  [TIMELINE_CATEGORIES.FOUNDED]: 'Thành lập',
  [TIMELINE_CATEGORIES.DAMAGED]: 'Hư hại',
  [TIMELINE_CATEGORIES.RESTORED]: 'Tu bổ',
  [TIMELINE_CATEGORIES.DISCOVERY]: 'Phát hiện',
  [TIMELINE_CATEGORIES.EVENT]: 'Sự kiện',
  [TIMELINE_CATEGORIES.RECOGNITION]: 'Công nhận',
};

export const PAGINATION_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;