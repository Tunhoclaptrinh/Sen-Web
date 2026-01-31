import { Space, Tag, Avatar, Switch } from "antd";
import {
  UserOutlined,
} from "@ant-design/icons";
import { getImageUrl } from "@/utils/image.helper";
import { User } from "@/types";
import DataTable from "@/components/common/DataTable";
import dayjs from "dayjs";

import UserDetailModal from "./components/DetailModal";
import UserForm from "./components/Form";

import { useUserModel } from "./model";
import UserStatsCard from "./components/Stats";

// Force HMR update

const UserManagement = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    selectedIds,
    setSelectedIds,
    refresh,
    updateFilters,
    filters,
    clearFilters,
    stats,
    statsLoading,
    toggleStatus,
    deleteUser,
    batchDeleteUsers,
    exportData,
    importData,
    downloadTemplate,
    importLoading,
    loading: exportLoading, // Aliasing loading as exportLoading since useCRUD uses shared loading
    handleSubmit,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  } = useUserModel();

  // Filter handlers
  const onFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  // Columns definition (must be after handlers)
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name_like",
      width: 250,
      searchable: true,
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={getImageUrl(record.avatar)} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
          </div>
        </Space>
      ),
      align: "left" as const,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone: string) => phone || "---",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Customer", value: "customer" },
        { text: "Researcher", value: "researcher" },
        { text: "Curator", value: "curator" },
      ],
      filteredValue: filters.role
        ? Array.isArray(filters.role)
          ? filters.role
          : [filters.role]
        : null,
      render: (role: string) => {
        let color = "geekblue";
        if (role === "admin") color = "red";
        if (role === "editor") color = "green"; // Leaving existing logic, though 'editor' isn't in filter
        return (
          <Tag color={color} key={role}>
            {role ? role.toUpperCase() : "UNKNOWN"}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Bị khóa", value: false },
      ],
      filteredValue: filters.isActive
        ? Array.isArray(filters.isActive)
          ? filters.isActive
          : [filters.isActive]
        : null,
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={() => toggleStatus(record)}
          size="small"
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Người Dùng"
        headerContent={<UserStatsCard stats={stats} loading={statsLoading} />}
        loading={loading}
        permissionResource="users"
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        hideGlobalSearch={true} // Hide global search as we have column search
        onSearch={search}
        onAdd={openCreate}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onView={openDetail}
        onEdit={openEdit}
        onDelete={deleteUser}
        onBatchDelete={batchDeleteUsers}
        batchOperations={true}
        // Import/Export integration
        importable={true}
        importLoading={importLoading}
        exportable={true}
        exportLoading={exportLoading}
        onImport={importData as any}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
        onRefresh={refresh}
        filters={[
          {
            key: "role",
            placeholder: "Vai trò",
            options: [
              { label: "Admin", value: "admin" },
              { label: "Customer", value: "customer" },
              { label: "Researcher", value: "researcher" },
            ],
            operators: ["eq", "in", "ne"], // Support Equals, In, Not Equals
            defaultOperator: "in",
          },
          {
            key: "isActive",
            placeholder: "Trạng thái",
            options: [
              { label: "Hoạt động", value: true },
              { label: "Bị khóa", value: false },
            ],
            operators: ["eq"],
            defaultOperator: "eq",
          },
          {
            key: "name",
            placeholder: "Tên người dùng",
            type: "input",
            operators: ["like", "ilike", "eq", "ne", "in", "not_like"],
            defaultOperator: "ilike",
          },
          {
            key: "email",
            placeholder: "Email",
            type: "input",
            operators: ["like", "ilike", "eq"],
            defaultOperator: "ilike",
          },
          {
             key: "phone",
             placeholder: "Số điện thoại",
             type: "input",
             operators: ["like", "ilike", "eq"],
             defaultOperator: "like"
          },
          {
              key: "created_at",
              placeholder: "Ngày tham gia",
              type: "date",
              operators: ["eq", "gte", "lte"],
              defaultOperator: "eq"
          }
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <UserForm
        key={currentRecord?.id || 'create'}
        visible={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <UserDetailModal
        userId={currentRecord?.id || null}
        visible={detailVisible}
        onCancel={closeDetail}
      />
    </>
  );
};

export default UserManagement;
