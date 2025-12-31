import { Card, Button, Table, Spin, message, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchArtifacts, deleteArtifact } from "@store/slices/artifactSlice";

const ArtifactManagement = () => {
  const dispatch = useAppDispatch();
  const {
    items: artifacts,
    loading,
    error,

  } = useAppSelector((state) => state.artifact);

  useEffect(() => {
    dispatch(fetchArtifacts());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xóa Hiện Vật",
      content: "Bạn có chắc chắn muốn xóa?",
      onOk() {
        dispatch(deleteArtifact(id));
        message.success("Xóa thành công");
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Loại", dataIndex: "artifact_type", key: "artifact_type" },
    { title: "Tình Trạng", dataIndex: "condition", key: "condition" },
    { title: "Đánh Giá", dataIndex: "rating", key: "rating", width: 80 },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
      render: (_: any, record: any) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản Lý Hiện Vật"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Mới
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={artifacts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ArtifactManagement;
