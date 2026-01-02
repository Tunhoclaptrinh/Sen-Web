import { Card, Button, Table, Spin, message, Modal } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import {
  fetchHeritageSites,
  deleteHeritageSite,
} from "@store/slices/heritageSlice";

import { useAppDispatch, useAppSelector } from "@store/hooks";
const HeritageManagement = () => {
  const dispatch = useAppDispatch();
  const {
    items: sites,
    loading,
    error,

  } = useAppSelector((state) => state.heritage);

  useEffect(() => {
    dispatch(fetchHeritageSites());
  }, [dispatch]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xóa Di Sản",
      content: "Bạn có chắc chắn muốn xóa?",
      onOk() {
        dispatch(deleteHeritageSite(id));
        message.success("Xóa thành công");
      },
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Vùng", dataIndex: "region", key: "region" },
    { title: "Loại", dataIndex: "type", key: "type" },
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
        title="Quản Lý Di Sản"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Mới
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={sites}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default HeritageManagement;
