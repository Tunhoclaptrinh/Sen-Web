import React, { useState } from "react";
import { Upload, message, Modal, Input, Button, Radio, Space } from "antd";
import { PlusOutlined, LoadingOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";

interface ImageUploadProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  maxCount?: number;
  folder?: string;
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
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // For single image: toggle between URL input and file upload
  const [mode, setMode] = useState<"url" | "upload">(() => {
    const url = Array.isArray(value) ? value[0] : value;
    // If it's a relative path (uploaded locally), use upload mode; otherwise URL mode
    return url && !url.startsWith("http") && url.startsWith("/") ? "upload" : "url";
  });

  // For gallery: show/hide URL input row
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // Sync fileList with value prop (only in upload/gallery mode)
  React.useEffect(() => {
    if (maxCount === 1 && mode === "url") return;

    const isUploading = fileList.some((file) => file.status === "uploading");
    if (isUploading) return;

    const rawUrls = Array.isArray(value) ? value : value ? [value] : [];
    const urls = rawUrls.filter(
      (url) => typeof url === "string" && !url.includes("fakepath")
    );
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    const apiHost = apiBase.replace(/\/api$/, "");

    const newFileList: UploadFile[] = urls.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.png`,
      status: "done",
      url: url.startsWith("http") ? url : `${apiHost}${url}`,
    }));

    const currentUrls = fileList.map((f) => f.url).filter(Boolean);
    const newUrls = newFileList.map((f) => f.url).filter(Boolean);

    if (JSON.stringify(currentUrls) !== JSON.stringify(newUrls)) {
      setFileList(newFileList);
    }
  }, [value, mode, fileList, maxCount]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const doneFiles = newFileList.filter((file) => file.status === "done");
    const urls = doneFiles
      .map((file) => {
        if (file.response) return file.response.data.url;
        if (file.url) {
          const apiBase = import.meta.env.VITE_API_BASE_URL;
          const apiHost = apiBase.replace(/\/api$/, "");
          if (file.url.startsWith(apiHost)) return file.url.substring(apiHost.length);
          return file.url;
        }
        return "";
      })
      .filter(Boolean);

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
    formData.append("file", file);

    try {
      const token = localStorage.getItem("sen_token");
      const xhr = new XMLHttpRequest();
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const url = `${apiBase}/upload/file`;
      xhr.open("POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({ percent: (e.loaded / e.total) * 100 });
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          onSuccess(JSON.parse(xhr.responseText));
        } else {
          let errorMsg = "Upload thất bại";
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.message) errorMsg = res.message;
          } catch {
            errorMsg = xhr.statusText || "Upload thất bại";
          }
          onError(new Error(errorMsg));
          message.error(errorMsg);
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        onError(new Error("Lỗi mạng"));
        message.error("Lỗi mạng khi upload");
      };

      xhr.send(formData);
    } catch (err) {
      setLoading(false);
      onError(err as Error);
      message.error("Có lỗi xảy ra");
    }
  };

  // Add a URL to the gallery
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url.startsWith("http")) {
      message.warning("URL không hợp lệ, phải bắt đầu bằng http hoặc https");
      return;
    }
    if (maxCount === 1) {
      onChange?.(url);
      setUrlInput("");
      setShowUrlInput(false);
    } else {
      if (fileList.length >= maxCount) {
        message.warning(`Chỉ được thêm tối đa ${maxCount} ảnh`);
        return;
      }
      const newFile: UploadFile = {
        uid: `url-${Date.now()}`,
        name: url.split("/").pop() || "image",
        status: "done",
        url,
      };
      const newFileList = [...fileList, newFile];
      setFileList(newFileList);
      onChange?.(newFileList.map((f) => f.url || "").filter(Boolean));
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleModeChange = (newMode: "url" | "upload") => {
    setMode(newMode);
    if (newMode === "upload") {
      // Clear URL value when switching to upload mode
      setFileList([]);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  const previewModal = (
    <Modal
      open={previewOpen}
      title={null}
      footer={null}
      onCancel={handleCancel}
      closable={false}
      styles={{ body: { padding: 0 } }}
    >
      <img alt="preview" style={{ width: "100%", display: "block" }} src={previewImage} />
    </Modal>
  );

  // ─── Single image (maxCount === 1) ───────────────────────────────
  if (maxCount === 1) {
    return (
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        {/* Mode toggle */}
        <Radio.Group
          size="small"
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="upload">
            <UploadOutlined /> Tải lên
          </Radio.Button>
          <Radio.Button value="url">
            <LinkOutlined /> Link ảnh
          </Radio.Button>
        </Radio.Group>

        {mode === "url" ? (
          <Input
            value={Array.isArray(value) ? value[0] : value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Dán link ảnh (https://...)"
            prefix={<LinkOutlined />}
            allowClear
          />
        ) : (
          <div style={{ marginTop: 4 }}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              customRequest={customRequest}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewModal}
          </div>
        )}
      </Space>
    );
  }

  // ─── Gallery (maxCount > 1) ───────────────────────────────────────
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

      {/* URL add button */}
      {fileList.length < maxCount && (
        <div style={{ marginTop: 8 }}>
          {!showUrlInput ? (
            <Button
              size="small"
              icon={<LinkOutlined />}
              type="dashed"
              onClick={() => setShowUrlInput(true)}
            >
              Nhập URL ảnh
            </Button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Input
                size="small"
                style={{ flex: 1 }}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                prefix={<LinkOutlined />}
                onPressEnter={handleAddUrl}
                autoFocus
              />
              <Button size="small" type="primary" onClick={handleAddUrl}>
                Thêm
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput("");
                }}
              >
                Hủy
              </Button>
            </div>
          )}
        </div>
      )}

      {previewModal}
    </>
  );
};

export default ImageUpload;
