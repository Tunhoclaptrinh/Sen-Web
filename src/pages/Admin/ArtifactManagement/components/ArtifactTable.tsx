import React from "react";
import {Tag, Space, Tooltip, Popconfirm} from "antd";
import {EyeOutlined, EditOutlined, DeleteOutlined, DisconnectOutlined} from "@ant-design/icons";
import {Button} from "@/components/common";
import {Artifact} from "@/types";
import DataTable from "@/components/common/DataTable";

interface ArtifactTableProps {
  data: Artifact[];
  loading?: boolean;
  pagination?: any;
  onChange?: (pagination: any, filters: any, sorter: any) => void;
  onView?: (record: Artifact) => void;
  onEdit?: (record: Artifact) => void;
  onDelete?: (id: number | string) => void;
  /**
   * Mode "unlink" changes the delete button to an unlink button (broken link icon).
   * Default is "delete".
   */
  deleteMode?: "delete" | "unlink";
  /**
   * If provided, allows customization of selected rows.
   */
  rowSelection?: any;
  user?: any;
}

const ArtifactTable: React.FC<ArtifactTableProps> = ({
  data,
  loading,
  pagination,
  onChange,
  onView,
  onEdit,
  onDelete,
  deleteMode = "delete",
  rowSelection,
  user,
}) => {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên Hiện vật",
      dataIndex: "name",
      key: "name",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Loại hình",
      dataIndex: "artifactType",
      key: "artifactType",
      width: 150,
      render: (type: string) => <Tag color="purple">{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (cond: string) => {
        let color = "blue";
        if (cond === "excellent") color = "green";
        if (cond === "poor") color = "red";
        return <Tag color={color}>{cond?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Trưng bày",
      dataIndex: "is_on_display",
      key: "isOnDisplay",
      width: 100,
      render: (onDisplay: boolean) => (onDisplay ? <Tag color="green">YES</Tag> : <Tag>NO</Tag>),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: Artifact) => (
        <Space size="middle">
          {onView && (
            <Tooltip title="Xem chi tiết">
              <Button
                variant="ghost"
                buttonSize="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
                className="action-btn-standard"
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button
                variant="ghost"
                buttonSize="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                className="action-btn-standard"
                style={{color: "orange"}}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Popconfirm
              title={deleteMode === "unlink" ? "Gỡ bỏ hiện vật khỏi di sản này?" : "Bạn có chắc chắn muốn xóa?"}
              onConfirm={() => onDelete(record.id)}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{danger: true}}
            >
              <Tooltip title={deleteMode === "unlink" ? "Gỡ bỏ" : "Xóa"}>
                <Button
                  variant="ghost"
                  buttonSize="small"
                  danger
                  icon={deleteMode === "unlink" ? <DisconnectOutlined /> : <DeleteOutlined />}
                  className="action-btn-standard"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <DataTable
      loading={loading}
      user={user}
      columns={columns}
      dataSource={data}
      pagination={pagination}
      onChange={onChange}
      rowSelection={rowSelection}
      showActions={false} // We defined custom actions column
    />
  );
};

export default ArtifactTable;
