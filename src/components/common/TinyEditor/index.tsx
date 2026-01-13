import React, { useRef } from "react";
// @ts-ignore
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
// @ts-ignore
import type { Editor } from "tinymce";
import "./styles.less";

interface TinyEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  height?: number;
  placeholder?: string;
  disabled?: boolean;
  enableImageUpload?: boolean;
  enableVideoEmbed?: boolean;
  imageUploadUrl?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

const TinyEditor: React.FC<TinyEditorProps> = ({
  value = "",
  onChange,
  height = 500,
  placeholder = "Nhập nội dung...",
  disabled = false,
  enableImageUpload = true,
  enableVideoEmbed = true,
  imageUploadUrl,
  onImageUpload,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleImageUpload = (
    blobInfo: any,
    progress: (percent: number) => void,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const file = blobInfo.blob();

          if (onImageUpload) {
            const url = await onImageUpload(file);
            resolve(url);
          } else if (imageUploadUrl) {
            const formData = new FormData();
            formData.append("image", file);
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open("POST", imageUploadUrl);
            xhr.upload.onprogress = (e) => progress((e.loaded / e.total) * 100);
            xhr.onload = () => {
              if (xhr.status < 200 || xhr.status >= 300) {
                reject("HTTP Error: " + xhr.status);
                return;
              }
              const json = JSON.parse(xhr.responseText);
              resolve(json.location);
            };
            xhr.onerror = () => reject("Upload failed");
            xhr.send(formData);
          } else {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject("Failed to convert image");
          }
        } catch (error) {
          reject("Upload failed: " + error);
        }
      })();
    });
  };

  const handleEditorChange = (content: string) => {
    onChange?.(content);
  };

  return (
    <div className="tiny-editor-wrapper">
      <TinyMCEEditor
        apiKey="8y0blqjtkro9sr4z2ewp3qjek46si59f47d3ys5rscdwpxbe"
        onInit={(_evt: any, editor: any) => {
          editorRef.current = editor;
        }}
        value={value}
        disabled={disabled}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "emoticons",
            "template",
            "codesample",
            "quickbars",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | " +
            "bold italic underline strikethrough forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | " +
            "table link image media codesample emoticons | " +
            "removeformat code fullscreen preview help",
          toolbar_mode: "sliding",
          content_style: `
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            font-size: 14px;
                            line-height: 1.6;
                            color: #2c3e50;
                            padding: 15px;
                            margin: 0;
                        }
                        body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                            padding-left: 15px;
                        }
                        p { margin: 0; padding: 0; }
                        h1, h2, h3, h4, h5, h6 {
                            color: #1f5f25;
                            margin-top: 1em;
                            margin-bottom: 0.5em;
                        }
                        img { max-width: 100%; height: auto; }
                        table { border-collapse: collapse; width: 100%; }
                        table td, table th { border: 1px solid #ddd; padding: 8px; }
                        blockquote {
                            border-left: 4px solid #1f5f25;
                            padding-left: 15px;
                            margin-left: 0;
                            color: #666;
                        }
                    `,
          placeholder,
          branding: false,
          promotion: false,
          statusbar: true,
          resize: "both",
          min_height: 300,
          max_height: 800,
          ...(enableImageUpload && {
            images_upload_handler: handleImageUpload,
            automatic_uploads: true,
            file_picker_types: "image",
          }),
          ...(enableVideoEmbed && {
            media_live_embeds: true,
          }),
          templates: [
            {
              title: "Bài viết cơ bản",
              description: "Template cho bài viết thông thường",
              content: "<h2>Tiêu đề</h2><p>Nội dung bài viết...</p>",
            },
            {
              title: "Di sản văn hóa",
              description: "Template cho di sản",
              content:
                "<h2>Tên Di sản</h2><p><strong>Vị trí:</strong> </p><p><strong>Lịch sử:</strong> </p><h3>Đặc điểm nổi bật</h3><ul><li></li></ul><h3>Giá trị văn hóa</h3><p></p>",
            },
            {
              title: "Hiện vật",
              description: "Template cho hiện vật",
              content:
                "<h2>Tên Hiện vật</h2><p><strong>Niên đại:</strong> </p><p><strong>Chất liệu:</strong> </p><p><strong>Kích thước:</strong> </p><h3>Mô tả</h3><p></p><h3>Ý nghĩa lịch sử</h3><p></p>",
            },
          ],
          quickbars_selection_toolbar:
            "bold italic | quicklink h2 h3 blockquote",
          quickbars_insert_toolbar: "quicktable image media codesample",
          contextmenu: "link image table",
        }}
      />
    </div>
  );
};

export default TinyEditor;
