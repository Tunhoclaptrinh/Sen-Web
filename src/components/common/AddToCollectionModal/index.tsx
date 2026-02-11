import React, {useState, useEffect} from "react";
import {Modal, List, Button, message, Empty, Spin, Input} from "antd";
import {PlusOutlined, CheckOutlined, FolderAddOutlined} from "@ant-design/icons";
import collectionService from "@/services/collection.service";
import {Collection} from "@/types/collection.types";

interface AddToCollectionModalProps {
  visible: boolean;
  onCancel: () => void;
  item: {
    id: number | string;
    type: "heritage" | "artifact" | "article" | "exhibition";
    name?: string;
  };
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({visible, onCancel, item}) => {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await collectionService.getAll();
      if (res.success) {
        // Check if item is in collection
        const cols = res.data || [];
        // We might need to check manually or backend provides it.
        // For now, let's trust we can check client side if we have items populated,
        // BUT getAll usually returns light objects without items.
        // We will rely on user clicking "Add" and handling logic.
        // Or we can fetch 'checkItem' for each collection? Too heavy.
        // Let's just list them. If backend prevents duplicates, handle error.
        setCollections(cols);
      }
    } catch (error) {
      message.error("Không thể tải danh sách bộ sưu tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchCollections();
    }
  }, [visible]);

  const handleAddToCollection = async (collectionId: number) => {
    setProcessingId(collectionId);
    try {
      const res = await collectionService.addItem(collectionId, {
        id: item.id,
        type: item.type,
      });

      if (res.success) {
        message.success("Đã thêm vào bộ sưu tập");
        // Opt: update local state to show "Added"
        // But simplified: just close or show success
      } else {
        message.warning(res.message || "Không thể thêm");
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateCollection = async () => {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      const res = await collectionService.create({name: newItemName, isPublic: false});
      if (res.success && res.data) {
        message.success("Đã tạo bộ sưu tập");
        setNewItemName("");
        setIsCreating(false);
        // Refresh list
        fetchCollections();
      }
    } catch (error) {
      message.error("Tạo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Lưu vào Bộ sưu tập" open={visible} onCancel={onCancel} footer={null} bodyStyle={{padding: 0}}>
      <div style={{maxHeight: 400, overflowY: "auto", padding: "16px 24px"}}>
        {loading && !collections.length ? (
          <div style={{textAlign: "center", padding: 20}}>
            <Spin />
          </div>
        ) : (
          <>
            {collections.length === 0 && !isCreating && (
              <Empty description="Bạn chưa có bộ sưu tập nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <List
              dataSource={collections}
              renderItem={(col: Collection) => {
                // Check if items contains this item?
                // Assuming 'items' is populated or we rely on logic
                const isAdded = col.items?.some((i) => i.id == item.id && i.type === item.type);

                return (
                  <List.Item
                    actions={[
                      <Button
                        key="add"
                        size="small"
                        type={isAdded ? "text" : "default"}
                        icon={isAdded ? <CheckOutlined /> : <PlusOutlined />}
                        disabled={isAdded}
                        loading={processingId === col.id}
                        onClick={() => handleAddToCollection(col.id)}
                      >
                        {isAdded ? "Đã lưu" : "Thêm"}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FolderAddOutlined style={{fontSize: 24, color: "#1890ff"}} />}
                      title={col.name}
                      description={`${col.totalItems || 0} mục`}
                    />
                  </List.Item>
                );
              }}
            />
          </>
        )}
      </div>

      <div style={{borderTop: "1px solid #f0f0f0", padding: "12px 24px", backgroundColor: "#fafafa"}}>
        {isCreating ? (
          <div style={{display: "flex", gap: 8}}>
            <Input
              placeholder="Tên bộ sưu tập mới..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onPressEnter={handleCreateCollection}
              autoFocus
            />
            <Button type="primary" onClick={handleCreateCollection} loading={loading}>
              Tạo
            </Button>
            <Button onClick={() => setIsCreating(false)}>Hủy</Button>
          </div>
        ) : (
          <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsCreating(true)}>
            Tạo bộ sưu tập mới
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default AddToCollectionModal;
