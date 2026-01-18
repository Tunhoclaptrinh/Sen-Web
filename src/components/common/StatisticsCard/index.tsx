import { formatNumber } from '@/utils/formatters';
import { Card, Col, Row, Spin } from 'antd';
import classNames from 'classnames';
import { lighten, rgba } from 'polished';
import React, { isValidElement, ReactElement } from 'react';
import './style.less';
import { AutoBackgroundConfig, StatisticsCardProps, StatisticsItem } from './typing';

/**
 * Tự động sinh màu nền từ valueColor với Polished
 * @param color - Màu gốc (hex, rgb, hsl, named color)
 * @param config - Cấu hình lighten và alpha
 * @returns Màu nền đã được xử lý
 */
const generateAutoBackground = (color: string | undefined, config: AutoBackgroundConfig = {}): string | undefined => {
	if (!color || !config.enabled) return undefined;

	const { lightenAmount = 0.4, alphaAmount = 0.15 } = config;

	// Special cases - handle first for performance
	const specialCases: Record<string, string> = {
		transparent: 'transparent',
		currentColor: 'rgba(0,0,0,0.05)',
		inherit: 'transparent',
	};

	const lowerColor = color.toLowerCase();
	if (specialCases[lowerColor]) {
		return specialCases[lowerColor];
	}

	// CSS Variables fallback
	if (color.startsWith('var(')) {
		return 'rgba(0,0,0,0.05)';
	}

	// Use Polished for color manipulation
	try {
		return rgba(lighten(lightenAmount, color), alphaAmount);
	} catch (error) {
		console.warn('Invalid color format:', color);
		return 'transparent';
	}
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({
	title,
	data,
	loading = false,
	containerStyle = {},
	cardStyle,
	colSpan = { span: 24, sm: 12, md: 8 },
	hideCard,
	rowGutter = 8,
	borderleft = false,
	statShadow = true,
	autoBackground = { enabled: true, lightenAmount: 0.1, alphaAmount: 0.1 },
}) => {
	const renderStatisticItem = ({
		title,
		value,
		icon,
		status,
		onClick,
		backgroundColor,
		valueColor,
		selected,
	}: StatisticsItem) => {
		const statusClass = status || '';

		// Tự động sinh backgroundColor nếu không được cung cấp
		const computedBackgroundColor = backgroundColor || generateAutoBackground(valueColor, autoBackground);

		const iconElement =
			icon && isValidElement(icon)
				? React.cloneElement(icon as ReactElement<any>, {
					style: {
						color: valueColor,
						...((icon as ReactElement<any>).props.style || {}),
					},
				})
				: icon;

		return (
			<div
				className={`${classNames({
					'statistics-item': true,
					pointer: !!onClick,
					border: borderleft,
					shadow: statShadow,
					selected,
				})} ${statusClass}`}
				style={{
					...cardStyle,
					backgroundColor: computedBackgroundColor,
					borderColor: valueColor,
				}}
				onClick={onClick}
			>
				<div className='text'>
					{iconElement && <span className='anticon'>{iconElement}</span>}
					<div>{title}</div>
				</div>

				<div className='num' style={status ? {} : { color: valueColor }}>
					{typeof value === 'number' ? formatNumber(value) : value}
				</div>
			</div>
		);
	};

	return hideCard ? (
		<Spin spinning={loading}>
			<div style={{ ...containerStyle }}>
				{title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>}

				<Row gutter={[rowGutter, rowGutter]}>
					{data.map((item, index) => (
						<Col {...(item.colSpan || colSpan)} key={index}>
							{renderStatisticItem(item)}
						</Col>
					))}
				</Row>
			</div>
		</Spin>
	) : (
		<Card
			style={{ borderRadius: 8, ...containerStyle }}
			loading={loading}
			variant='borderless'
		>
			{title && <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{title}</div>}

			<Row gutter={[rowGutter, rowGutter]} wrap>
				{data.map((item, index) => (
					<Col {...(item.colSpan || colSpan)} key={index}>
						{renderStatisticItem(item)}
					</Col>
				))}
			</Row>
		</Card>
	);
};

export default StatisticsCard;
