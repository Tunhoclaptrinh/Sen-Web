export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const re = /^(0|\+84)[0-9]{9}$/;
    return re.test(phone);
};

export const validateRequired = (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
};

export const validateMinLength = (value: string | null | undefined, minLength: number): boolean => {
    return value ? value.length >= minLength : false;
};

export const validateMaxLength = (value: string | null | undefined, maxLength: number): boolean => {
    return !value || value.length <= maxLength;
};

export const validateRange = (value: string | number, min: number, max: number): boolean => {
    const num = Number(value);
    return num >= min && num <= max;
};

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
