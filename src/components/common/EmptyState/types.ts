import { EmptyProps } from "antd";

export interface EmptyStateProps extends EmptyProps {
    title?: string;
    description?: string;
    actionText?: string;
    onAction?: () => void;
    showAction?: boolean;
}
