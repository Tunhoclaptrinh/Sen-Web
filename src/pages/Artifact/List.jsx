// ================================================
// src/pages/Artifact/List.jsx - FULL EXAMPLE
// ================================================
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber } from 'antd';
import { useCRUD, useSearch, useFilters } from '@hooks';
import { artifactService } from '@api/services';
import { DataTable, FormModal, SearchBar } from '@components/common';

const { TextArea } = Input;

const ArtifactList = () => {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    data,
    loading,
    pagination,
    fetchAll,
    create,
    update,
    remove,
    handleTableChange,
  } = useCRUD(artifactService);

  const { searchTerm, setSearchTerm } = useSearch(artifactService);
  const { filters, updateFilter, clearFilters } = useFilters({
    artifact_type: undefined,
    condition: undefined,
  });

  useEffect(() => {
    fetchAll(filters);
  }, [filters]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Loại', dataIndex: 'artifact_type', key: 'artifact_type' },
    { title: 'Tình Trạng', dataIndex: 'condition', key: 'condition' },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => `⭐ ${rating?.toFixed(1) || 'N/A'}`,
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalOpen(true);
  };

  const handleModalOk = async (values) => {
    const success = editingId
      ? await update(editingId, values)
      : await create(values);
    if (success) {
      setModalOpen(false);
      form.resetFields();
    }
  };

  return (
    <div>
      <h2>Quản Lý Hiện Vật</h2>

      <SearchBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={() => fetchAll({ ...filters, q: searchTerm })}
        filters={[
          {
            key: 'artifact_type',
            placeholder: 'Chọn loại',
            options: [
              { label: 'Điêu khắc', value: 'sculpture' },
              { label: 'Tranh vẽ', value: 'painting' },
              { label: 'Gốm sứ', value: 'pottery' },
            ],
          },
          {
            key: 'condition',
            placeholder: 'Tình trạng',
            options: [
              { label: 'Tuyệt vời', value: 'excellent' },
              { label: 'Tốt', value: 'good' },
              { label: 'Khá', value: 'fair' },
            ],
          },
        ]}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <DataTable
        data={data}
        loading={loading}
        columns={columns}
        pagination={pagination}
        onPaginationChange={handleTableChange}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={remove}
        onRefresh={() => fetchAll(filters)}
        searchable={false}
      />

      <FormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleModalOk}
        form={form}
        title={editingId ? 'Chỉnh Sửa Hiện Vật' : 'Thêm Hiện Vật'}
        loading={loading}
      >
        <Form.Item
          name="name"
          label="Tên Hiện Vật"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô Tả"
          rules={[{ required: true }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="artifact_type"
          label="Loại"
          rules={[{ required: true }]}
        >
          <Select
            options={[
              { label: 'Điêu khắc', value: 'sculpture' },
              { label: 'Tranh vẽ', value: 'painting' },
              { label: 'Gốm sứ', value: 'pottery' },
            ]}
          />
        </Form.Item>

        <Form.Item name="condition" label="Tình Trạng">
          <Select
            options={[
              { label: 'Tuyệt vời', value: 'excellent' },
              { label: 'Tốt', value: 'good' },
              { label: 'Khá', value: 'fair' },
            ]}
          />
        </Form.Item>
      </FormModal>
    </div>
  );
};

export default ArtifactList;
