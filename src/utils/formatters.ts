import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatDate = (date: string | Date | Dayjs | null | undefined, format: string = 'DD/MM/YYYY'): string => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | Dayjs | null | undefined, format: string = 'DD/MM/YYYY HH:mm'): string => {
    if (!date) return '';
    return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date | Dayjs | null | undefined): string => {
    if (!date) return '';
    return dayjs(date).fromNow();
};

export const formatNumber = (num: number | null | undefined): string => {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatCurrency = (amount: number | null | undefined, currency: string = 'VND'): string => {
    if (!amount && amount !== 0) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDistance = (distance: number | null | undefined): string => {
    if (!distance && distance !== 0) return '';
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
};

export const truncateText = (text: string | null | undefined, maxLength: number = 100): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const capitalizeFirst = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
