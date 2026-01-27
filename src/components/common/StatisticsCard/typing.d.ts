import { Breakpoint } from 'antd';
import { ColSize } from 'antd/es/col';
import React, { JSX } from 'react';

/**
 * Interface cho một item thống kê
 * @interface StatisticsItem
 */
export interface StatisticsItem {
	/** Tiêu đề hiển thị của item thống kê */
	title?: string | React.ReactNode;

	/** Giá trị hiển thị, có thể là số hoặc chuỗi (đã format)
	 * @example 100, '1,234 VNĐ', '50%'
	 */
	value: string | number | React.ReactNode;

	/** Icon hiển thị bên trái item */
	icon?: JSX.Element;

	/** Màu của giá trị và border trái
	 * @example '#17C229', '#FFAF0B', '#DA2128', 'red', 'rgb(255,0,0)'
	 */
	valueColor?: string;

	/** Màu nền của card (nếu không cung cấp sẽ tự động sinh từ valueColor)
	 * @example '#EAFFDF', '#fffbe6', '#fff2e8'
	 */
	backgroundColor?: string;

	/** Trạng thái của item, dùng để xác định màu sắc
	 * @default 'gray'
	 * @example 'success', 'warning', 'error', 'info', 'gray'
	 */
	status?: 'success' | 'warning' | 'error' | 'info' | 'gray';

	/** Hàm callback khi click vào item (tùy chọn) */
	onClick?: () => void;

	selected?: boolean;

	/** Tùy chỉnh span của item (override global colSpan) */
	colSpan?: any;
}

/**
 * Cấu hình auto background generation
 * @interface AutoBackgroundConfig
 */
export interface AutoBackgroundConfig {
	/** Độ sáng của màu nền (0-1)
	 * @default 0.4
	 * @example 0.3 (tối hơn), 0.5 (sáng hơn)
	 */
	lightenAmount?: number;

	/** Độ trong suốt của màu nền (0-1)
	 * @default 0.15
	 * @example 0.1 (trong suốt hơn), 0.2 (đậm hơn)
	 */
	alphaAmount?: number;

	/** Bật/tắt tính năng tự động sinh màu nền
	 * @default true
	 */
	enabled?: boolean;
}

/**
 * Props cho StatisticsCard component
 * @interface StatisticsCardProps
 */
export interface StatisticsCardProps {
	/** Tiêu đề của card thống kê */
	title?: string;

	/** Mảng dữ liệu thống kê cần hiển thị */
	data: StatisticsItem[];

	rowGutter?: number;

	/** Trạng thái loading của card
	 * @default false
	 */
	loading?: boolean;

	/** Custom style cho container bên ngoài */
	containerStyle?: React.CSSProperties;

	/** Custom style cho từng card item */
	cardStyle?: React.CSSProperties;

	/** Ẩn card và title tương tự Tablebase */
	hideCard?: boolean;

	/** Cấu hình responsive breakpoints cho columns
	 * @default { xs: 24, sm: 12, md: 8 }
	 * @example { xs: 12, sm: 6, md: 4, lg: 3 }
	 */
	colSpan?: Partial<Record<Breakpoint, number | string | ColSize>>;

	/** Hiển thị borderleft 4px (tùy chọn) */
	borderleft?: boolean;

	/** Hiển thị statShadow (tùy chọn) */
	statShadow?: boolean;

	/** Cấu hình tự động sinh màu nền từ valueColor
	 * @default { enabled: true, lightenAmount: 0.4, alphaAmount: 0.15 }
	 */
	autoBackground?: AutoBackgroundConfig;

	/** Căn chỉnh Row theo chiều ngang (start, end, center, space-around, space-between) */
	// justify?: import('antd').RowProps['justify'];
}

/*
USAGE EXAMPLES:

// 1. Sử dụng cơ bản - tự động sinh màu nền
<StatisticsCard 
  title="Statistics"
  data={[
    { title: "Sales", value: "1,234", valueColor: "red" },
    { title: "Orders", value: "567", valueColor: "#52c41a" },
    { title: "Users", value: "890", valueColor: "rgb(24,144,255)" },
  ]}
/>

// 2. Tùy chỉnh độ sáng và trong suốt
<StatisticsCard 
  title="Custom Background"
  autoBackground={{
    enabled: true,
    lightenAmount: 0.5, // Sáng hơn
    alphaAmount: 0.2    // Đậm hơn
  }}
  data={data}
/>

// 3. Tắt tự động sinh màu nền
<StatisticsCard 
  title="Manual Background"
  autoBackground={{ enabled: false }}
  data={[
    { 
      title: "Custom", 
      value: "100", 
      valueColor: "purple", 
      backgroundColor: "#f0f8ff" // Phải tự set
    }
  ]}
/>

// 4. Mix tự động và thủ công
<StatisticsCard 
  title="Mixed Mode"
  data={[
    { title: "Auto", value: "123", valueColor: "green" }, // Tự động
    { 
      title: "Manual", 
      value: "456", 
      valueColor: "red", 
      backgroundColor: "#ffe6e6" // Override
    }
  ]}
/>

BENEFITS:
- Tự động nhận diện ALL color formats (hex, rgb, hsl, named colors)
- Chỉ 2.5KB gzipped - siêu nhẹ
- API clean và intuitive 
- Robust color processing
- TypeScript support đầy đủ
- Không cần predefined mapping table
*/
