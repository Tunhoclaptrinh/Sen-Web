import React, { useState } from "react";
import { Upload, message, Button } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";

interface FileUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  accept?: string;
  placeholder?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  accept,
  placeholder = "Chọn file...",
}) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Sync fileList with value prop
  React.useEffect(() => {
    const isUploading = fileList.some((file) => file.status === "uploading");
    if (isUploading) return;

    if (value) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const apiHost = apiBase.replace(/\/api$/, "");
      
      const fileName = value.split('/').pop() || "file";
      setFileList([{
        uid: '-1',
        name: fileName,
        status: 'done',
        url: value.startsWith("http") ? value : `${apiHost}${value}`,
      }]);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length === 0) {
      onChange?.("");
      return;
    }

    const lastFile = newFileList[newFileList.length - 1];
    if (lastFile.status === "done" && lastFile.response) {
      onChange?.(lastFile.response.data.url);
    }
  };

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file, onProgress } = options;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file); // Backend for generic files might expect 'file' key

    try {
      const token = localStorage.getItem("sen_token");
      const xhr = new XMLHttpRequest();
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const url = `${apiBase}/upload/file`;
      
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          onProgress({ percent });
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          onSuccess(response);
          // If the backend returns a relative URL, we use it directly
          onChange?.(response.data.url);
        } else {
          onError(new Error("Upload failed"));
          message.error("Tải file thất bại");
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        onError(new Error("Network error"));
        message.error("Lỗi kết nối");
      };

      xhr.send(formData);
    } catch (err) {
      setLoading(false);
      onError(err as Error);
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Upload
      fileList={fileList}
      onChange={handleChange}
      customRequest={customRequest}
      maxCount={1}
      accept={accept}
    >
      <Button icon={loading ? <LoadingOutlined /> : <UploadOutlined />} loading={loading}>
        {loading ? "Đang tải..." : placeholder}
      </Button>
    </Upload>
  );
};

export default FileUpload;
