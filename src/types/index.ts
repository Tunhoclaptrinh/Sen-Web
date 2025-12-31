// Core Types
export * from "./auth.types";
export * from "./heritage.types";
export * from "./artifact.types";
export * from "./api.types";
export * from "./user.types";
export * from "./collection.types";

// Common Types

export interface PaginationParams {
  page?: number;
  limit?: number;
  _page?: number;
  _limit?: number;
}

export interface SortParams {
  sort?: string;
  order?: "asc" | "desc" | "ascend" | "descend";
  _sort?: string;
  _order?: "asc" | "desc";
}

export interface SearchParams {
  q?: string;
  search?: string;
}

export interface FilterParams {
  [key: string]: any;
}

export interface QueryParams
  extends PaginationParams,
    SortParams,
    SearchParams,
    FilterParams {}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Metadata {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at?: string;
}

export interface TimestampEntity {
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// Component Props

export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface LoadingProps {
  loading?: boolean;
  error?: string | null;
}

// Form Types

export interface FormModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (values: any) => void | Promise<void>;
  title: string;
  loading?: boolean;
  width?: number;
  children: React.ReactNode;
}

export interface SearchBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  size?: "small" | "middle" | "large";
  showClearButton?: boolean;
  responsive?: boolean;
}

export interface FilterConfig {
  key: string;
  placeholder: string;
  width?: number;
  colSpan?: number;
  options: Array<{ label: string; value: any }>;
  disabled?: boolean;
  loading?: boolean;
  value?: any;
}

// Redux Types

export interface RootState {
  auth: any; // Will be replaced with AuthState
  heritage: any;
  artifact: any;
  ui: any;
  collection: any;
}

export interface AsyncThunkConfig {
  rejectValue: string;
}

// API Response Types

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: Pagination;
  metadata?: Metadata;
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Route Types

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  index?: boolean;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

// Storage Types

export interface StorageKeys {
  TOKEN: string;
  USER: string;
  THEME: string;
}

// Utility Types

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

// Event Types

export type ChangeHandler = (value: any) => void;
export type SubmitHandler<T = any> = (values: T) => void | Promise<void>;
export type ClickHandler = (event: React.MouseEvent) => void;

// Table Types

export interface TableColumn<T = any> {
  title: string;
  dataIndex?: string;
  key: string;
  width?: number | string;
  fixed?: "left" | "right";
  sorter?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  ellipsis?: boolean;
  filters?: Array<{ text: string; value: any }>;
}

export interface TablePaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number) => string;
  pageSizeOptions?: string[];
}

// Character/Animation Types

export interface Position {
  x: number;
  y: number;
}

export interface Accessories {
  hat: boolean;
  glasses: boolean;
  bag: boolean;
  coat: boolean;
}

export type MouthState = "smile" | "open" | "close" | "sad" | "angry" | "half";

export interface CharacterState {
  position: Position;
  scale: number;
  accessories: Accessories;
  mouthState: MouthState;
  isTalking: boolean;
  controlled: boolean;
}

// Notification Types

export interface NotificationConfig {
  message: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
}
