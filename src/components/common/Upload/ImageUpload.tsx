import React, { useState } from "react";
import { Upload, message, Modal } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";

interface ImageUploadProps {
  value?: string | string[]; // URL string or array of URL strings
  onChange?: (value: string | string[]) => void;
  maxCount?: number; // 1 for single image, >1 for gallery
  folder?: string; // Optional, though we default to generic upload
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxCount = 1,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Sync fileList with value prop
  React.useEffect(() => {
    // If we have any file currently uploading, do not override from props
    // to prevent the UI from flickering or resetting the progress.
    const isUploading = fileList.some((file) => file.status === "uploading");
    if (isUploading) return;

    const urls = Array.isArray(value) ? value : value ? [value] : [];
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
    const apiHost = apiBase.replace(/\/api$/, "");

    const newFileList: UploadFile[] = urls.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.png`,
      status: "done",
      url: url.startsWith("http") ? url : `${apiHost}${url}`,
    }));

    // Simple check to avoid infinite loop or unnecessary re-renders
    // We only update if the lengths differ or URLs differ
    const currentUrls = fileList.map((f) => f.url).filter(Boolean);
    const newUrls = newFileList.map((f) => f.url).filter(Boolean);

    if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
      setFileList(newFileList);
    }
  }, [value, fileList]); // fileList in dep array is needed for isUploading check, but we guard against loop with JSON check

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
    );
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // Filter for successfully uploaded files to update parent
    const doneFiles = newFileList.filter((file) => file.status === "done");

    // Only trigger onChange if ALL files are done (or removed)
    // Actually, we should trigger whenever the *valid* list changes.
    // But if we are uploading, we might not want to trigger onChange with partial data?
    // Standard practice: Trigger onChange with whatever valid URLs we have.

    const urls = doneFiles
      .map((file) => {
        if (file.response) {
          return file.response.data.url;
        }
        // If it was already there (from props), strip the host if needed?
        // Usually we want to store relative paths if that's what backend expects.
        // But our prop sync added the host.
        // Let's rely on the fact that if it's existing, it has a URL.
        // We might need to strip the host prefix if we want to save relative paths.
        if (file.url) {
          const apiBase =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
          const apiHost = apiBase.replace(/\/api$/, "");
          // If url starts with apiHost, strip it.
          if (file.url.startsWith(apiHost)) {
            return file.url.substring(apiHost.length);
          }
          return file.url;
        }
        return "";
      })
      .filter(Boolean);

    // If we are strictly in 'done' state for all files involved?
    // Ideally update every time a file finishes.

    if (maxCount === 1) {
      onChange?.(urls[0] || "");
    } else {
      onChange?.(urls as string[]);
    }
  };

  const customRequest = async (options: any) => {
    const { onSuccess, onError, file, onProgress } = options;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("sen_token");
      const xhr = new XMLHttpRequest();
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
      const url = `${apiBase}/upload/file`;
      console.log(`Upload Target URL: ${url}`);
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
        } else {
          console.error("Upload Error Status:", xhr.status);
          console.error("Upload Error Response:", xhr.responseText);
          let errorMsg = "Upload failed";
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.message) errorMsg = res.message;
          } catch (e) {
            errorMsg = xhr.statusText || "Upload failed";
          }
          onError(new Error(errorMsg));
          message.error(errorMsg);
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        console.error("Upload Network Error");
        onError(new Error("Network error"));
        message.error("Network error during upload");
      };

      xhr.send(formData);
    } catch (err) {
      setLoading(false);
      console.error("Upload Catch Error:", err);
      onError(err as Error);
      message.error("Something went wrong");
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
        maxCount={maxCount}
        accept="image/*"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={null}
        footer={null}
        onCancel={handleCancel}
        closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <img
          alt="example"
          style={{ width: "100%", display: "block" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default ImageUpload;
