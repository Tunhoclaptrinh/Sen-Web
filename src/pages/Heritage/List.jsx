// ================================================
// src/pages/Heritage/List.jsx - FULL EXAMPLE
// ================================================
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber } from 'antd';
import { useCRUD, useSearch, useFilters } from '@hooks';
import { heritageService } from '@api/services';
import { DataTable, FormModal, SearchBar } from '@components/common';

const { TextArea } = Input;

const HeritageList = () => {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Use CRUD hook
  const {
    data,
    loading,
    pagination,
    fetchAll,
    create,
    update,
    remove,
    handleTableChange,
  } = useCRUD(heritageService, {
    successMessage: {
      create: 'Thêm di sản thành công',
      update: 'Cập nhật di sản thành công',
      delete: 'Xóa di sản thành công',
    },
  });

  // Use search hook
  const { searchTerm, setSearchTerm } = useSearch(heritageService);

  // Use filters hook
  const { filters, updateFilter, clearFilters } = useFilters({
    region: undefined,
    type: undefined,
  });

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchAll(filters);
  }, [filters]);

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên Di Sản',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Vùng',
      dataIndex: 'region',
      key: 'region',
      width: 120,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 150,
    },
    {
      title: 'Đánh Giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating) => `⭐ ${rating?.toFixed(1) || 'N/A'}`,
    },
    {
      title: 'UNESCO',
      dataIndex: 'unesco_listed',
      key: 'unesco_listed',
      width: 100,
      render: (unesco) => (unesco ? '✅' : '❌'),
    },
  ];

  // CRUD Handlers
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
      setEditingId(null);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    form.resetFields();
    setEditingId(null);
  };

  // Filter definitions for SearchBar
  const filterDefinitions = [
    {
      key: 'region',
      placeholder: 'Chọn vùng',
      options: [
        { label: 'Hà Nội', value: 'Hà Nội' },
        { label: 'Huế', value: 'Huế' },
        { label: 'Hội An', value: 'Hội An' },
        { label: 'Quảng Nam', value: 'Quảng Nam' },
      ],
    },
    {
      key: 'type',
      placeholder: 'Chọn loại',
      options: [
        { label: 'Di tích', value: 'monument' },
        { label: 'Đền chùa', value: 'temple' },
        { label: 'Bảo tàng', value: 'museum' },
      ],
    },
  ];

  return (
    <div>
      <h2>Quản Lý Di Sản Văn Hóa</h2>

      {/* Search & Filters */}
      <SearchBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onSearch={() => fetchAll({ ...filters, q: searchTerm })}
        filters={filterDefinitions}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      {/* Data Table */}
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
        searchable={false} // We're using SearchBar above
      />

      {/* Form Modal */}
      <FormModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        form={form}
        title={editingId ? 'Chỉnh Sửa Di Sản' : 'Thêm Di Sản Mới'}
        loading={loading}
        width={700}
      >
        <Form.Item
          name="name"
          label="Tên Di Sản"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input placeholder="Nhập tên di sản" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô Tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <TextArea rows={4} placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          name="region"
          label="Vùng"
          rules={[{ required: true, message: 'Vui lòng chọn vùng' }]}
        >
          <Select
            placeholder="Chọn vùng"
            options={[
              { label: 'Hà Nội', value: 'Hà Nội' },
              { label: 'Huế', value: 'Huế' },
              { label: 'Hội An', value: 'Hội An' },
              { label: 'Quảng Nam', value: 'Quảng Nam' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label="Loại"
          rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
        >
          <Select
            placeholder="Chọn loại"
            options={[
              { label: 'Di tích', value: 'monument' },
              { label: 'Đền chùa', value: 'temple' },
              { label: 'Bảo tàng', value: 'museum' },
            ]}
          />
        </Form.Item>

        <Form.Item name="address" label="Địa Chỉ">
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item name="year_established" label="Năm Thành Lập">
          <InputNumber
            placeholder="Nhập năm"
            style={{ width: '100%' }}
            min={0}
            max={new Date().getFullYear()}
          />
        </Form.Item>

        <Form.Item name="entrance_fee" label="Phí Vào Cửa (VNĐ)">
          <InputNumber
            placeholder="Nhập phí vào cửa"
            style={{ width: '100%' }}
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item name="unesco_listed" label="UNESCO">
          <Select
            placeholder="Chọn"
            options={[
              { label: 'Có', value: true },
              { label: 'Không', value: false },
            ]}
          />
        </Form.Item>
      </FormModal>
    </div>
  );
};

export default HeritageList;
