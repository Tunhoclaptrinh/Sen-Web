import {Space, Tag, Tooltip, Popconfirm, Rate, Avatar} from "antd";
import {DeleteOutlined, EyeOutlined, UserOutlined} from "@ant-design/icons";
import {Button} from "@/components/common";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import dayjs from "dayjs";

import ReviewDetailModal from "./components/DetailModal";
import ReviewStats from "./components/Stats";
import {useReviewModel} from "./model";

const ReviewManagement = () => {
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
    deleteItem,
    batchDelete,
    stats,
    statsLoading,
    // UI State & Handlers
    currentRecord,
    detailVisible,
    openDetail,
    closeDetail,
  } = useReviewModel();

  const {user} = useAuth();

  const onFilterChange = (key: string, value: any) => {
    updateFilters({[key]: value});
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Người dùng",
      dataIndex: ["user", "name"],
      key: "userName",
      width: 200,
      render: (name: string, record: any) => (
        <Space>
          <Avatar size="small" src={record.user?.avatar} icon={<UserOutlined />} />
          {name || "Người dùng ẩn danh"}
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      filters: [
        {text: "Heritage", value: "heritage_site"},
        {text: "Artifact", value: "artifact"},
      ],
      render: (type: string) => <Tag color={type === "artifact" ? "purple" : "blue"}>{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 150,
      render: (rating: number) => <Rate disabled defaultValue={rating} style={{fontSize: 12}} />,
    },
    {
      title: "Bình luận",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              variant="ghost"
              buttonSize="small"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
              className="action-btn-standard"
              style={{color: "var(--primary-color)"}}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => deleteItem(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{danger: true}}
          >
            <Tooltip title="Xóa">
              <Button
                variant="ghost"
                buttonSize="small"
                danger
                icon={<DeleteOutlined />}
                className="action-btn-standard"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Đánh giá & Phản hồi"
        user={user}
        headerContent={<ReviewStats stats={stats} loading={statsLoading} />}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onDelete={deleteItem}
        onBatchDelete={batchDelete}
        batchOperations={true}
        onRefresh={refresh}
        filters={[
          {
            key: "type",
            placeholder: "Loại đối tượng",
            options: [
              {label: "Di sản", value: "heritage_site"},
              {label: "Hiện vật", value: "artifact"},
            ],
          },
          {
            key: "rating",
            placeholder: "Số sao",
            options: [
              {label: "5 Sao", value: 5},
              {label: "4 Sao", value: 4},
              {label: "3 Sao", value: 3},
              {label: "2 Sao", value: 2},
              {label: "1 Sao", value: 1},
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <ReviewDetailModal record={currentRecord} open={detailVisible} onCancel={closeDetail} />
    </>
  );
};

export default ReviewManagement;
