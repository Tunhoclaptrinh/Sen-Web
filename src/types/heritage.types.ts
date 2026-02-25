// ============================================
// Heritage Types
// ============================================

import { BaseEntity, TimestampEntity, Pagination } from "./index";

// Heritage Type Enum
export enum HeritageType {
  MONUMENT = "monument",
  TEMPLE = "temple",
  MUSEUM = "museum",
  ARCHAEOLOGICAL_SITE = "archaeologicalSite",
  HISTORIC_BUILDING = "historicBuilding",
  NATURAL_HERITAGE = "naturalHeritage",
  INTANGIBLE_HERITAGE = "intangibleHeritage",
}

// Heritage Type Labels (Vietnamese)
export const HeritageTypeLabels: Record<string, string> = {
  [HeritageType.MONUMENT]: "Di tích lịch sử",
  [HeritageType.TEMPLE]: "Đền, chùa, miếu",
  [HeritageType.MUSEUM]: "Bảo tàng",
  [HeritageType.ARCHAEOLOGICAL_SITE]: "Khu khảo cổ",
  [HeritageType.HISTORIC_BUILDING]: "Công trình kiến trúc lịch sử",
  [HeritageType.NATURAL_HERITAGE]: "Di sản thiên nhiên",
  [HeritageType.INTANGIBLE_HERITAGE]: "Di sản phi vật thể",
  // Snake case mappings for robustness (matching backend strings shown in logs)
  "archaeological_site": "Khu khảo cổ",
  "historic_building": "Công trình kiến trúc lịch sử",
  "natural_heritage": "Di sản thiên nhiên",
  "intangible_heritage": "Di sản phi vật thể",
};

// Significance Level
export enum SignificanceLevel {
  LOCAL = "local",
  NATIONAL = "national",
  INTERNATIONAL = "international",
}

// Significance Level Labels (Vietnamese)
export const SignificanceLevelLabels: Record<SignificanceLevel, string> = {
  [SignificanceLevel.LOCAL]: "Cấp địa phương",
  [SignificanceLevel.NATIONAL]: "Cấp quốc gia",
  [SignificanceLevel.INTERNATIONAL]: "Cấp quốc tế",
};

// Heritage Region
export enum HeritageRegion {
  NORTH = "Bắc",
  CENTRAL = "Trung",
  SOUTH = "Nam",
}

export const HeritageRegionLabels: Record<HeritageRegion, string> = {
  [HeritageRegion.NORTH]: "Miền Bắc",
  [HeritageRegion.CENTRAL]: "Miền Trung",
  [HeritageRegion.SOUTH]: "Miền Nam",
};

// Heritage Province/City
export enum HeritageProvince {
  // Miền Bắc
  HANOI = "Hà Nội",
  HOCHIMINH = "Hồ Chí Minh",
  HAIPHONG = "Hải Phòng",
  DANANG = "Đà Nẵng",
  CANTHO = "Cần Thơ",
  HAI_DUONG = "Hải Dương",
  BAC_NINH = "Bắc Ninh",
  VINH_PHUC = "Vĩnh Phúc",
  QUANG_NINH = "Quảng Ninh",
  THAI_NGUYEN = "Thái Nguyên",
  BAC_GIANG = "Bắc Giang",
  PHU_THO = "Phú Thọ",
  HA_NAM = "Hà Nam",
  NAM_DINH = "Nam Định",
  NINH_BINH = "Ninh Bình",
  THAI_BINH = "Thái Bình",
  HUNG_YEN = "Hưng Yên",

  // Miền Trung
  THUA_THIEN_HUE = "Thừa Thiên Huế",
  QUANG_NAM = "Quảng Nam",
  QUANG_NGAI = "Quảng Ngãi",
  BINH_DINH = "Bình Định",
  PHU_YEN = "Phú Yên",
  KHANH_HOA = "Khánh Hòa",
  NINH_THUAN = "Ninh Thuận",
  BINH_THUAN = "Bình Thuận",
  KON_TUM = "Kon Tum",
  GIA_LAI = "Gia Lai",
  DAK_LAK = "Đắk Lắk",
  DAK_NONG = "Đắk Nông",
  LAM_DONG = "Lâm Đồng",
  QUANG_TRI = "Quảng Trị",
  QUANG_BINH = "Quảng Bình",
  NGHE_AN = "Nghệ An",
  HA_TINH = "Hà Tĩnh",

  // Miền Nam
  TIEN_GIANG = "Tiền Giang",
  BEN_TRE = "Bến Tre",
  TRA_VINH = "Trà Vinh",
  VINH_LONG = "Vĩnh Long",
  DONG_THAP = "Đồng Tháp",
  AN_GIANG = "An Giang",
  KIEN_GIANG = "Kiên Giang",
  CA_MAU = "Cà Mau",
  BAC_LIEU = "Bạc Liêu",
  SOC_TRANG = "Sóc Trăng",
  LONG_AN = "Long An",
  DONG_NAI = "Đồng Nai",
  BINH_DUONG = "Bình Dương",
  BINH_PHUOC = "Bình Phước",
  TAY_NINH = "Tây Ninh",
  BA_RIA_VUNG_TAU = "Bà Rịa - Vũng Tàu",
}

export const HeritageProvinceLabels: Record<HeritageProvince, string> = {
  // Miền Bắc
  [HeritageProvince.HANOI]: "Hà Nội",
  [HeritageProvince.HAIPHONG]: "Hải Phòng",
  [HeritageProvince.HAI_DUONG]: "Hải Dương",
  [HeritageProvince.BAC_NINH]: "Bắc Ninh",
  [HeritageProvince.VINH_PHUC]: "Vĩnh Phúc",
  [HeritageProvince.QUANG_NINH]: "Quảng Ninh",
  [HeritageProvince.THAI_NGUYEN]: "Thái Nguyên",
  [HeritageProvince.BAC_GIANG]: "Bắc Giang",
  [HeritageProvince.PHU_THO]: "Phú Thọ",
  [HeritageProvince.HA_NAM]: "Hà Nam",
  [HeritageProvince.NAM_DINH]: "Nam Định",
  [HeritageProvince.NINH_BINH]: "Ninh Bình",
  [HeritageProvince.THAI_BINH]: "Thái Bình",
  [HeritageProvince.HUNG_YEN]: "Hưng Yên",

  // Miền Trung
  [HeritageProvince.DANANG]: "Đà Nẵng",
  [HeritageProvince.THUA_THIEN_HUE]: "Thừa Thiên Huế",
  [HeritageProvince.QUANG_NAM]: "Quảng Nam",
  [HeritageProvince.QUANG_NGAI]: "Quảng Ngãi",
  [HeritageProvince.BINH_DINH]: "Bình Định",
  [HeritageProvince.PHU_YEN]: "Phú Yên",
  [HeritageProvince.KHANH_HOA]: "Khánh Hòa",
  [HeritageProvince.NINH_THUAN]: "Ninh Thuận",
  [HeritageProvince.BINH_THUAN]: "Bình Thuận",
  [HeritageProvince.KON_TUM]: "Kon Tum",
  [HeritageProvince.GIA_LAI]: "Gia Lai",
  [HeritageProvince.DAK_LAK]: "Đắk Lắk",
  [HeritageProvince.DAK_NONG]: "Đắk Nông",
  [HeritageProvince.LAM_DONG]: "Lâm Đồng",
  [HeritageProvince.QUANG_TRI]: "Quảng Trị",
  [HeritageProvince.QUANG_BINH]: "Quảng Bình",
  [HeritageProvince.NGHE_AN]: "Nghệ An",
  [HeritageProvince.HA_TINH]: "Hà Tĩnh",

  // Miền Nam
  [HeritageProvince.HOCHIMINH]: "Hồ Chí Minh",
  [HeritageProvince.CANTHO]: "Cần Thơ",
  [HeritageProvince.TIEN_GIANG]: "Tiền Giang",
  [HeritageProvince.BEN_TRE]: "Bến Tre",
  [HeritageProvince.TRA_VINH]: "Trà Vinh",
  [HeritageProvince.VINH_LONG]: "Vĩnh Long",
  [HeritageProvince.DONG_THAP]: "Đồng Tháp",
  [HeritageProvince.AN_GIANG]: "An Giang",
  [HeritageProvince.KIEN_GIANG]: "Kiên Giang",
  [HeritageProvince.CA_MAU]: "Cà Mau",
  [HeritageProvince.BAC_LIEU]: "Bạc Liêu",
  [HeritageProvince.SOC_TRANG]: "Sóc Trăng",
  [HeritageProvince.LONG_AN]: "Long An",
  [HeritageProvince.DONG_NAI]: "Đồng Nai",
  [HeritageProvince.BINH_DUONG]: "Bình Dương",
  [HeritageProvince.BINH_PHUOC]: "Bình Phước",
  [HeritageProvince.TAY_NINH]: "Tây Ninh",
  [HeritageProvince.BA_RIA_VUNG_TAU]: "Bà Rịa - Vũng Tàu",
};

// Province by Region mapping
export const ProvincesByRegion: Record<HeritageRegion, HeritageProvince[]> = {
  [HeritageRegion.NORTH]: [
    HeritageProvince.HANOI,
    HeritageProvince.HAIPHONG,
    HeritageProvince.HAI_DUONG,
    HeritageProvince.BAC_NINH,
    HeritageProvince.VINH_PHUC,
    HeritageProvince.QUANG_NINH,
    HeritageProvince.THAI_NGUYEN,
    HeritageProvince.BAC_GIANG,
    HeritageProvince.PHU_THO,
    HeritageProvince.HA_NAM,
    HeritageProvince.NAM_DINH,
    HeritageProvince.NINH_BINH,
    HeritageProvince.THAI_BINH,
    HeritageProvince.HUNG_YEN,
  ],
  [HeritageRegion.CENTRAL]: [
    HeritageProvince.DANANG,
    HeritageProvince.THUA_THIEN_HUE,
    HeritageProvince.QUANG_NAM,
    HeritageProvince.QUANG_NGAI,
    HeritageProvince.BINH_DINH,
    HeritageProvince.PHU_YEN,
    HeritageProvince.KHANH_HOA,
    HeritageProvince.NINH_THUAN,
    HeritageProvince.BINH_THUAN,
    HeritageProvince.KON_TUM,
    HeritageProvince.GIA_LAI,
    HeritageProvince.DAK_LAK,
    HeritageProvince.DAK_NONG,
    HeritageProvince.LAM_DONG,
    HeritageProvince.QUANG_TRI,
    HeritageProvince.QUANG_BINH,
    HeritageProvince.NGHE_AN,
    HeritageProvince.HA_TINH,
  ],
  [HeritageRegion.SOUTH]: [
    HeritageProvince.HOCHIMINH,
    HeritageProvince.CANTHO,
    HeritageProvince.TIEN_GIANG,
    HeritageProvince.BEN_TRE,
    HeritageProvince.TRA_VINH,
    HeritageProvince.VINH_LONG,
    HeritageProvince.DONG_THAP,
    HeritageProvince.AN_GIANG,
    HeritageProvince.KIEN_GIANG,
    HeritageProvince.CA_MAU,
    HeritageProvince.BAC_LIEU,
    HeritageProvince.SOC_TRANG,
    HeritageProvince.LONG_AN,
    HeritageProvince.DONG_NAI,
    HeritageProvince.BINH_DUONG,
    HeritageProvince.BINH_PHUOC,
    HeritageProvince.TAY_NINH,
    HeritageProvince.BA_RIA_VUNG_TAU,
  ],
};

// Heritage Site
export interface HeritageSite extends BaseEntity, TimestampEntity {
  name: string;
  shortDescription?: string;
  description: string;
  type: HeritageType;
  culturalPeriod?: string;
  region: HeritageRegion | string; // Allow string for backward compat
  province?: HeritageProvince | string; // New province field
  address?: string;
  latitude?: number;
  longitude?: number;
  yearEstablished?: number;
  unescoListed?: boolean;
  significance?: SignificanceLevel;
  visitHours?: string;
  entranceFee?: number;
  contactInfo?: string;
  website?: string;
  image?: string;
  images?: string[];
  gallery?: string[];
  mainImage?: string;
  rating?: number;
  totalReviews?: number;
  views?: number;
  isActive?: boolean;
  author?: string;
  authorName?: string;
  publishDate?: string;
  commentCount?: number;
  timeline?: TimelineEvent[];
  relatedArtifactIds?: number[];
  relatedHistoryIds?: number[];
  relatedHeritageIds?: number[];
  relatedLevelIds?: number[];
  relatedArtifacts?: any[]; // Full objects if needed
  relatedLevels?: any[];
  relatedProducts?: any[];
  relatedHistory?: any[];
  references?: string;
}

// Heritage Site Create/Update DTO
export interface HeritageSiteDTO {
  name: string;
  shortDescription?: string;
  description: string;
  type: HeritageType;
  culturalPeriod?: string;
  region: HeritageRegion | string;
  province?: HeritageProvince | string; // New province field
  address?: string;
  latitude?: number;
  longitude?: number;
  yearEstablished?: number;
  unescoListed?: boolean;
  significance?: SignificanceLevel;
  visitHours?: string;
  entranceFee?: number;
  contactInfo?: string;
  website?: string;
  images?: string[];
  gallery?: string[];
  timeline?: TimelineEvent[];
  relatedArtifactIds?: number[];
  relatedHistoryIds?: number[];
  relatedHeritageIds?: number[];
  relatedLevelIds?: number[];
  references?: string;
}

// Timeline Event
export interface TimelineEvent extends BaseEntity {
  heritageSiteId?: number;
  title: string;
  description: string;
  year: number;
  category: TimelineCategory;
  image?: string;
}

export enum TimelineCategory {
  FOUNDED = "founded",
  DAMAGED = "damaged",
  RESTORED = "restored",
  DISCOVERY = "discovery",
  EVENT = "event",
  RECOGNITION = "recognition",
}

export const TimelineCategoryLabels: Record<TimelineCategory, string> = {
  [TimelineCategory.FOUNDED]: "Thành lập/Khởi công",
  [TimelineCategory.DAMAGED]: "Bị phá hủy/Hư hại",
  [TimelineCategory.RESTORED]: "Trùng tu/Tôn tạo",
  [TimelineCategory.DISCOVERY]: "Phát hiện/Khai quật",
  [TimelineCategory.EVENT]: "Sự kiện lịch sử",
  [TimelineCategory.RECOGNITION]: "Được công nhận",
};

// Exhibition
export interface Exhibition extends BaseEntity, TimestampEntity {
  name: string;
  description: string;
  heritageSiteId: number;
  theme?: string;
  startDate: string;
  endDate?: string;
  curator?: string;
  artifactIds?: number[];
  relatedLevelIds?: number[];
  relatedHeritageIds?: number[];
  relatedArtifactIds?: number[];
  relatedHistoryIds?: number[];
  isActive: boolean;
}

// Nearby Heritage Query
export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radius?: number;
}

// Heritage with Distance
export interface HeritageWithDistance extends HeritageSite {
  distance: number;
}

// Heritage Filters
export interface HeritageFilters {
  type?: HeritageType;
  region?: string;
  province?: string; // New province filter
  culturalPeriod?: string;
  unescoListed?: boolean;
  significance?: SignificanceLevel;
  minRating?: number;
  maxEntranceFee?: number;
}

// Heritage Search Params
export interface HeritageSearchParams extends HeritageFilters {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Heritage State (Redux)
export interface HeritageState {
  items: HeritageSite[];
  currentItem: HeritageSite | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: HeritageFilters;
}

// Heritage Response
export interface HeritageResponse {
  success: boolean;
  data: HeritageSite[];
  pagination?: Pagination;
}

export interface HeritageSingleResponse {
  success: boolean;
  data: HeritageSite;
}
