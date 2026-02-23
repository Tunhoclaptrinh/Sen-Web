import React, {useEffect} from "react";
import {Form, Input, Switch, DatePicker, Transfer, Space, Button} from "antd";
import {PictureOutlined, LinkOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {useAuth} from "@/hooks/useAuth";
import {DebounceSelect} from "@/components/common";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import historyService from "@/services/history.service";
import {HeritageSite, Artifact, HistoryArticle} from "@/types";

interface ExhibitionFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
  availableArtifacts: any[];
  isEdit?: boolean;
}

const ExhibitionForm: React.FC<ExhibitionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading,
  availableArtifacts,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const {user} = useAuth();

  const memoizedInitialValues = React.useMemo(() => {
    if (!initialValues)
      return {
        isActive: true,
        isPermanent: false,
        curator: user?.name,
        author: user?.name,
      };

    return {
      ...initialValues,
      publishDate: initialValues.publishDate ? dayjs(initialValues.publishDate) : undefined,
      dates:
        initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
    };
  }, [initialValues, user]);

  useEffect(() => {
    const initData = async () => {
      if (initialValues) {
        try {
          // Fetch labels for related IDs
          const [relHeritageRes, relArtifactsRes, relHistoryRes] = await Promise.all([
            (initialValues.relatedHeritageIds?.length ?? 0) > 0
              ? heritageService.getByIds(initialValues.relatedHeritageIds!)
              : Promise.resolve({success: true, data: []}),
            (initialValues.relatedArtifactIds?.length ?? 0) > 0
              ? artifactService.getAll({
                  ids: initialValues.relatedArtifactIds!.join(","),
                })
              : Promise.resolve({success: true, data: []}),
            (initialValues.relatedHistoryIds?.length ?? 0) > 0
              ? historyService.getAll({
                  ids: initialValues.relatedHistoryIds!.join(","),
                })
              : Promise.resolve({success: true, data: []}),
          ]);

          const formattedValues = {
            ...memoizedInitialValues,
            relatedHeritageIds: (initialValues.relatedHeritageIds || []).map((id: number) => {
              const item = relHeritageRes.data?.find((h: HeritageSite) => h.id === id);
              return item ? {label: item.name, value: item.id} : {label: `ID: ${id}`, value: id};
            }),
            relatedArtifactIds: (initialValues.relatedArtifactIds || []).map((id: number) => {
              const item = relArtifactsRes.data?.find((a: Artifact) => a.id === id);
              return item ? {label: item.name, value: item.id} : {label: `ID: ${id}`, value: id};
            }),
            relatedHistoryIds: (initialValues.relatedHistoryIds || []).map((id: number) => {
              const item = relHistoryRes.data?.find((h: HistoryArticle) => h.id === id);
              return item ? {label: item.title, value: item.id} : {label: `ID: ${id}`, value: id};
            }),
          };

          form.setFieldsValue(formattedValues);
        } catch (error) {
          console.error("Failed to init exhibition related data", error);
          form.setFieldsValue(memoizedInitialValues);
        }
      }
    };

    initData();
  }, [memoizedInitialValues, form, initialValues]);

  const handleFinish = (values: any) => {
    const {dates, ...rest} = values;
    const successData = {
      ...rest,
      relatedHeritageIds:
        rest.relatedHeritageIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedArtifactIds:
        rest.relatedArtifactIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
      relatedHistoryIds:
        rest.relatedHistoryIds?.map((item: any) => (typeof item === "object" ? item.value : item)) || [],
    };

    if (dates && Array.isArray(dates) && dates.length === 2 && !rest.isPermanent) {
      successData.startDate = dates[0].toISOString();
      successData.endDate = dates[1].toISOString();
    }
    onSubmit(successData);
  };

  // Fetch functions for DebounceSelect
  const fetchHeritageList = async (search: string) => {
    const res = await heritageService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((h: HeritageSite) => ({label: h.name, value: h.id})) : [];
  };

  const fetchArtifactList = async (search: string) => {
    const res = await artifactService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((a: Artifact) => ({label: a.name, value: a.id})) : [];
  };

  const fetchHistoryList = async (search: string) => {
    const res = await historyService.getAll({q: search, limit: 10});
    return res.success && res.data ? res.data.map((h: HistoryArticle) => ({label: h.title, value: h.id})) : [];
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleFinish} initialValues={memoizedInitialValues}>
      <Form.Item
        name="name"
        label="Tên triển lãm"
        rules={[
          {required: true, message: "Vui lòng nhập tên"},
          {min: 5, message: "Tên triển lãm yêu cầu tối thiểu 5 ký tự"},
        ]}
      >
        <Input prefix={<PictureOutlined />} placeholder="Ví dụ: Triển lãm Gốm Chu Đậu" />
      </Form.Item>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="theme" label="Chủ đề" rules={[{min: 2, message: "Chủ đề yêu cầu tối thiểu 2 ký tự"}]}>
          <Input placeholder="Ví dụ: Gốm sứ, Lịch sử" />
        </Form.Item>
        <Form.Item name="curator" label="Người phụ trách">
          <Input placeholder="Tên cán bộ phụ trách" readOnly />
        </Form.Item>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="author" label="Tác giả">
          <Input readOnly placeholder="Hệ thống tự động" />
        </Form.Item>
        <Form.Item name="publishDate" label="Ngày xuất bản">
          <DatePicker
            style={{width: "100%"}}
            disabled
            format="DD/MM/YYYY HH:mm"
            showTime
            placeholder="Tự động khi duyệt"
          />
        </Form.Item>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
        <Form.Item name="isPermanent" label="Triển lãm vĩnh viễn?" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="isActive" label="Công khai" valuePropName="checked">
          <Switch />
        </Form.Item>
      </div>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isPermanent !== curr.isPermanent}>
        {({getFieldValue}) =>
          !getFieldValue("isPermanent") && (
            <Form.Item
              name="dates"
              label="Thời gian diễn ra"
              rules={[{required: true, message: "Vui lòng chọn thời gian"}]}
            >
              <DatePicker.RangePicker style={{width: "100%"}} />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          {required: true, message: "Vui lòng nhập mô tả"},
          {min: 20, message: "Mô tả triển lãm yêu cầu tối thiểu 20 ký tự"},
        ]}
      >
        <Input.TextArea rows={4} placeholder="Mô tả nội dung triển lãm" />
      </Form.Item>

      <Form.Item name="artifactIds" label="Chọn hiện vật trưng bày">
        <Transfer
          dataSource={availableArtifacts as any[]}
          showSearch
          listStyle={{
            width: "100%",
            height: 250,
          }}
          titles={["Hiện vật kho", "Đã chọn"]}
          render={(item) => item.name}
          rowKey={(item) => item.id}
          filterOption={(inputValue, item) => item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1}
        />
      </Form.Item>

      <div style={{background: "#f9f9f9", padding: 16, borderRadius: 8, border: "1px solid #f0f0f0", marginTop: 16}}>
        <h4 style={{marginBottom: 16, display: "flex", alignItems: "center", gap: 8}}>
          <LinkOutlined /> Nội dung liên quan (Ngon Logic)
        </h4>

        <Form.Item label="Di sản liên quan" name="relatedHeritageIds" style={{marginBottom: 12}}>
          <DebounceSelect
            mode="multiple"
            placeholder="Tìm di sản..."
            fetchOptions={fetchHeritageList}
            style={{width: "100%"}}
          />
        </Form.Item>

        <Form.Item label="Hiện vật khác liên quan" name="relatedArtifactIds" style={{marginBottom: 12}}>
          <DebounceSelect
            mode="multiple"
            placeholder="Tìm hiện vật..."
            fetchOptions={fetchArtifactList}
            style={{width: "100%"}}
          />
        </Form.Item>

        <Form.Item label="Bài viết lịch sử liên quan" name="relatedHistoryIds" style={{marginBottom: 0}}>
          <DebounceSelect
            mode="multiple"
            placeholder="Tìm bài viết..."
            fetchOptions={fetchHistoryList}
            style={{width: "100%"}}
          />
        </Form.Item>
      </div>

      <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
        <Space>
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit || initialValues ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ExhibitionForm;
