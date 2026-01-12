import { useState } from "react";
import {
  Form,
  Input,
  Row,
  Col,
  Modal,
  Space,
  Tag,
  DatePicker,
  Switch,
  Image
} from "antd";
import { useCRUD } from "@hooks/useCRUD";
import historyService from "@/services/history.service";
import DataTable from "@components/common/DataTable";
import FormModal from "@components/common/FormModal";
import dayjs from 'dayjs';

const { TextArea } = Input;

const HistoryManagement = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);

  const {
    data,
    loading,
    pagination,
    filters,
    searchTerm,
    selectedIds,
    fetchAll,
    create,
    update,
    remove,
    handleTableChange,
    updateFilters,
    clearFilters,
    search,
    batchDelete,
    setSelectedIds,
  } = useCRUD(historyService, {
    pageSize: 10,
    autoFetch: true,
    initialFilters: {},
    defaultSort: "createdAt",
    defaultOrder: "desc",
    successMessage: {
      create: "Thêm bài viết thành công",
      update: "Cập nhật bài viết thành công",
      delete: "Xóa bài viết thành công",
    },
  });

  const filterDefinitions = [
    {
      key: "is_active",
      placeholder: "Trạng thái",
      width: 150,
      options: [
        { label: "Đang hiển thị", value: true },
        { label: "Đã ẩn", value: false },
      ],
    },
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
      fixed: "left" as const,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (src: string) => src ? <Image src={src} width={60} height={40} style={{objectFit: 'cover', borderRadius: 4}} /> : 'N/A'
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: true,
      sorter: true,
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 150,
      sorter: true,
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 150,
      sorter: true,
      render: (date: any) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 100,
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hiển thị" : "Ẩn"}
        </Tag>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ is_active: true, publishDate: dayjs() });
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue({
        ...record,
        publishDate: record.publishDate ? dayjs(record.publishDate) : null
    });
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleView = (record: any) => {
    setViewingRecord(record);
    setViewModalVisible(true);
  };

  const handleModalOk = async (values: any) => {
    const formattedValues = {
        ...values,
        publishDate: values.publishDate ? values.publishDate.toISOString() : null
    };

    const success = editingId
      ? await update(editingId, formattedValues)
      : await create(formattedValues);

    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        data={data}
        loading={loading}
        columns={columns}
        pagination={pagination}
        onPaginationChange={handleTableChange}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={(id) => remove(id)}
        onRefresh={fetchAll}
        searchable={true}
        searchPlaceholder="Tìm kiếm bài viết..."
        searchValue={searchTerm}
        onSearch={(val) => search(val)}
        filters={filterDefinitions}
        filterValues={filters}
        onFilterChange={(key, val) => updateFilters({ [key]: val })}
        onClearFilters={clearFilters}
        batchOperations={true}
        selectedRowKeys={selectedIds}
        onSelectChange={setSelectedIds}
        onBatchDelete={batchDelete}
        title="Quản Lý Bài Viết Lịch Sử"
        rowKey="id"
      />

      <FormModal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        form={form}
        title={editingId ? "Chỉnh Sửa Bài Viết" : "Thêm Bài Viết Mới"}
        loading={loading}
        width={800}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề bài viết" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="shortDescription"
              label="Mô tả ngắn"
              rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn" }]}
            >
              <TextArea rows={2} placeholder="Nhập mô tả ngắn gọn" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
                name="image"
                label="Link Hình Ảnh"
            >
                <Input placeholder="URL hình ảnh" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="content"
              label="Nội dung chi tiết (HTML)"
            >
              <TextArea rows={10} placeholder="Nhập nội dung bài viết (hỗ trợ HTML)" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="author" label="Tác giả">
              <Input placeholder="Tên tác giả" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="publishDate" label="Ngày đăng">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" showTime />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item name="is_active" label="Hiển thị" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </FormModal>

      <Modal
        title="Chi Tiết Bài Viết"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingRecord && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
             {viewingRecord.image && <Image src={viewingRecord.image} style={{maxHeight: 300, width: '100%', objectFit: 'cover'}} />}
            <div style={{fontSize: 24, fontWeight: 'bold'}}>{viewingRecord.title}</div>
            <div><strong>Tác giả:</strong> {viewingRecord.author} | <strong>Ngày:</strong> {dayjs(viewingRecord.publishDate).format('DD/MM/YYYY HH:mm')}</div>
             <div><strong>Mô tả ngắn:</strong> {viewingRecord.shortDescription}</div>
             <div style={{borderTop: '1px solid #eee', paddingTop: 16}}>
                 <strong>Nội dung:</strong>
                 <div dangerouslySetInnerHTML={{__html: viewingRecord.content}} style={{marginTop: 8, padding: 16, background: '#f5f5f5', borderRadius: 8}} />
             </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default HistoryManagement;
