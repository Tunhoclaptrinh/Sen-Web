import { message, notification } from "antd";
import type { ArgsProps as MessageArgsProps } from "antd/es/message";
import type { ArgsProps as NotificationArgsProps } from "antd/es/notification";

class NotificationService {
  // MESSAGE METHODS
  success(content: string, duration?: number) {
    message.success(content, duration);
  }

  error(content: string, duration?: number) {
    message.error(content, duration);
  }

  warning(content: string, duration?: number) {
    message.warning(content, duration);
  }

  info(content: string, duration?: number) {
    message.info(content, duration);
  }

  loading(content: string, duration?: number) {
    return message.loading(content, duration);
  }

  // NOTIFICATION METHODS
  showNotification(
    type: "success" | "error" | "warning" | "info",
    config: NotificationArgsProps,
  ) {
    notification[type](config);
  }

  successNotification(
    title: string,
    description?: string,
    duration: number = 4.5,
  ) {
    notification.success({
      message: title,
      description,
      duration,
      placement: "topRight",
    });
  }

  errorNotification(
    title: string,
    description?: string,
    duration: number = 4.5,
  ) {
    notification.error({
      message: title,
      description,
      duration,
      placement: "topRight",
    });
  }

  warningNotification(
    title: string,
    description?: string,
    duration: number = 4.5,
  ) {
    notification.warning({
      message: title,
      description,
      duration,
      placement: "topRight",
    });
  }

  infoNotification(
    title: string,
    description?: string,
    duration: number = 4.5,
  ) {
    notification.info({
      message: title,
      description,
      duration,
      placement: "topRight",
    });
  }

  // CUSTOM NOTIFICATION
  customNotification(config: NotificationArgsProps) {
    notification.open(config);
  }

  // CLOSE ALL NOTIFICATIONS
  closeAllNotifications() {
    notification.destroy();
  }

  closeAllMessages() {
    message.destroy();
  }

  // API ERROR HANDLER
  handleApiError(error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
    const statusCode = error?.response?.status;

    switch (statusCode) {
      case 400:
        this.error("Yêu cầu không hợp lệ");
        break;
      case 401:
        this.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        break;
      case 403:
        this.error("Bạn không có quyền truy cập");
        break;
      case 404:
        this.error("Không tìm thấy dữ liệu");
        break;
      case 422:
        this.error("Dữ liệu không hợp lệ");
        break;
      case 429:
        this.error("Quá nhiều yêu cầu. Vui lòng thử lại sau.");
        break;
      case 500:
        this.error("Lỗi hệ thống. Vui lòng thử lại sau.");
        break;
      default:
        this.error(errorMessage);
    }
  }

  // VALIDATION ERROR HANDLER
  handleValidationErrors(errors: Array<{ field: string; message: string }>) {
    if (errors && errors.length > 0) {
      const errorMessages = errors
        .map((err) => `${err.field}: ${err.message}`)
        .join("\n");
      this.errorNotification("Lỗi xác thực", errorMessages);
    }
  }
}

export default new NotificationService();
