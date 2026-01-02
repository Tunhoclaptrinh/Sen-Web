import { SpinProps } from "antd";

export interface LoadingProps extends SpinProps {
    fullScreen?: boolean;
    message?: string;
}
