import { useMemo, useState } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import adminAssetService, { AdminAsset } from "@/services/admin-asset.service";

export const useAssetModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<AdminAsset | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} asset:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(adminAssetService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: AdminAsset) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;
        if (currentRecord) {
            success = await crud.update(currentRecord.id, values);
        } else {
            success = await crud.create(values);
        }

        if (success) {
            closeForm();
        }
        return success;
    };

    const handleGenerateCode = (form: any) => {
        const type = form.getFieldValue("type") || "SCAN";
        const prefix = type === "artifact" ? "SEN_ART" : type === "heritage_site" ? "SEN_SITE" : "SEN_QR";
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const code = `${prefix}_${randomStr}`;
        form.setFieldsValue({ code });
    };

    const downloadQRCode = (code: string, fileName: string) => {
        const canvas = document.getElementById(`qr-code-download-${code}`) as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${fileName || code}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            message.success("Bắt đầu tải mã QR...");
        } else {
            message.error("Không tìm thấy mã QR để tải!");
        }
    };

    return {
        ...crud,
        currentRecord,
        formVisible,
        openCreate,
        openEdit,
        closeForm,
        handleSubmit,
        handleGenerateCode,
        downloadQRCode
    };
};
