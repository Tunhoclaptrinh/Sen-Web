import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks/useRedux";
import {fetchMuseum, collectMuseumIncome, useItem} from "@/store/slices/gameSlice";
import {fetchShopData} from "@/store/slices/shopSlice";
import {Row, Col, Button, Spin, Typography, Empty, Tabs, Tag, Card, Modal} from "antd";
import {CloudUploadOutlined, TrophyOutlined, RiseOutlined, GoldOutlined} from "@ant-design/icons";
import {getImageUrl} from "@/utils/image.helper";
import {StatisticsCard} from "@/components/common";
import {aiService, AICharacter} from "@/services/ai.service";
import {ITEM_TYPES} from "@/config/constants";
import "./styles.less";

const {Title, Text} = Typography;

const MuseumPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {museum, museumLoading} = useAppSelector((state) => state.game);
  const {inventory = [], items: shopItems = [], loading: shopLoading} = useAppSelector((state) => state.shop);
  const [activeTab, setActiveTab] = useState("all");

  // Modal state
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // AI Characters state
  const [ownedCharacters, setOwnedCharacters] = useState<AICharacter[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMuseum());
    dispatch(fetchShopData());
    fetchOwnedCharacters();
  }, [dispatch]);

  // Fetch owned AI characters
  const fetchOwnedCharacters = async () => {
    setCharactersLoading(true);
    try {
      const characters = await aiService.getCharacters();
      setOwnedCharacters(characters);
    } catch (err) {
      console.error("Failed to fetch owned characters:", err);
    } finally {
      setCharactersLoading(false);
    }
  };

  const handleCollectIncome = () => {
    dispatch(collectMuseumIncome());
  };

  const handleUseItem = (itemId: number) => {
    dispatch(useItem({itemId}));
    setDetailModalVisible(false);
  };

  // Enrich inventory items with shop data
  const enrichedInventory = inventory.map((invItem) => {
    const itemDetail = shopItems.find((s) => s.id === invItem.itemId);
    return {...invItem, ...itemDetail};
  });

  // Combine all items into a unified list
  const allItems = [
    ...enrichedInventory.map((item) => ({
      type: "inventory",
      id: `inv-${item.itemId}`,
      name: item.name,
      description: item.description,
      image: item.image,
      original: item,
      quantity: item.quantity,
    })),
    ...(museum?.artifacts || []).map((art) => ({
      type: ITEM_TYPES.ARTIFACT,
      id: `art-${art.artifactId}`,
      name: art.name,
      description: `Thu thập ngày ${new Date(art.acquiredAt).toLocaleDateString()}`,
      image: art.image,
      original: art,
      quantity: 1,
    })),
    // Use owned AI characters with full data instead of basic museum.characters
    ...ownedCharacters.map((char) => ({
      type: "character",
      id: `char-${char.id}`,
      name: char.name,
      description: char.description || char.personality || "Nhân vật đồng hành cùng bạn",
      image: char.avatar,
      original: char,
      quantity: 1,
      rarity: char.rarity,
    })),
  ];

  const filteredItems = activeTab === "all" ? allItems : allItems.filter((i) => i.type === activeTab);

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const renderMuseumItem = (item: any) => {
    // Resolve image URL based on type
    let itemImage: string | null = null;
    if (item.type === "character") {
      // Use actual avatar if available, otherwise fallback to dicebear
      itemImage = item.image ? getImageUrl(item.image) : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${item.name}`;
    } else {
      itemImage = item.image ? getImageUrl(item.image) : null;
    }

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
        <Card
          hoverable
          className="museum-card"
          onClick={() => handleItemClick(item)}
          cover={
            <div className="card-cover">
              {itemImage ? (
                <>
                  <div className="blur-background" style={{backgroundImage: `url(${itemImage})`}} />
                  <img
                    src={itemImage}
                    alt={item.name}
                    className="item-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden");
                      e.currentTarget.parentElement
                        ?.querySelector(".blur-background")
                        ?.setAttribute("style", "display: none");
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                    background: "#f5f5f5",
                  }}
                >
                  No image
                </div>
              )}
              {/* Tags - Always show Type Tag at top right */}
              <div className="item-type-tag">
                {(() => {
                  let color = "gold";
                  let text = "Vật phẩm";

                  if (item.type === ITEM_TYPES.ARTIFACT) {
                    color = "gold";
                    text = "HIỆN VẬT";
                  } else if (item.type === "character") {
                    color = "magenta";
                    text = "ĐỒNG HÀNH";
                  } else if (item.type === "inventory") {
                    // Map shop types
                    const shopType = item.original?.type;
                    if (["powerup", "hint", "boost"].includes(shopType)) {
                      color = "blue";
                      text = "HỖ TRỢ";
                    } else if (["decoration", "theme"].includes(shopType)) {
                      color = "purple";
                      text = "TRANG TRÍ";
                    } else {
                      color = "cyan";
                      text = "SƯU TẦM";
                    }
                  }

                  return <Tag color={color}>{text}</Tag>;
                })()}
              </div>
            </div>
          }
        >
          <div className="item-info">
            <div className="item-name">{item.name}</div>
            <div className="item-desc" title={item.description}>
              {item.description || "Vật phẩm sưu tầm"}
            </div>

            {/* Quantity Badge in Body - Strictly matching Shop style */}
            {item.quantity > 0 && item.type === "inventory" && item.original?.isConsumable && (
              <div
                className="owned-quantity"
                style={{
                  fontSize: "0.8rem",
                  color: "#8b1d1d",
                  background: "rgba(139, 29, 29, 0.08)",
                  border: "1px solid rgba(139, 29, 29, 0.2)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  display: "inline-block",
                  fontWeight: 700,
                  marginBottom: 0,
                  marginTop: "auto",
                  fontFamily: '"Merriweather", serif',
                  width: "fit-content",
                }}
              >
                Đang có: {item.quantity}
              </div>
            )}
          </div>
        </Card>
      </Col>
    );
  };

  if (museumLoading || shopLoading || charactersLoading) {
    return (
      <div style={{textAlign: "center", padding: "100px 0"}}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="museum-page">
      <div className="page-header">
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> Bảo Tàng
        </Title>
        <div className="subtitle">Lưu giữ báu vật - Thu thập tinh hoa</div>
      </div>

      <div className="stats-container">
        <StatisticsCard
          data={[
            {
              title: "Cấp độ",
              value: museum?.level || 1,
              valueColor: "#1890ff",
              icon: <TrophyOutlined />,
            },
            {
              title: "Thu nhập trong 1 giờ",
              value: `${museum?.incomePerHour || 0}`,
              valueColor: "#52c41a",
              icon: <RiseOutlined />,
            },
            {
              title: "Chờ thu",
              value: (
                <div style={{display: "flex", alignItems: "center", gap: 8}}>
                  <span>{museum?.pendingIncome || 0}</span>
                  {museum?.pendingIncome && museum.pendingIncome > 0 ? (
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleCollectIncome}
                      className="collect-btn"
                      style={{fontSize: "0.8rem", height: 24, padding: "0 8px"}}
                    >
                      Thu hoạch
                    </Button>
                  ) : null}
                </div>
              ),
              valueColor: "#faad14",
              icon: <GoldOutlined />,
            },
          ]}
          hideCard
          colSpan={{xs: 24, sm: 8, md: 8}}
        />
      </div>

      <div className="tabs-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          className="museum-tabs"
          items={[
            {label: <span>Nhân vật</span>, key: "character"},
            {label: <span>Hiện vật</span>, key: ITEM_TYPES.ARTIFACT},
          ]}
        />
      </div>

      <div className="museum-content">
        {filteredItems.length > 0 ? (
          <Row gutter={[24, 24]}>{filteredItems.map(renderMuseumItem)}</Row>
        ) : (
          <Empty description="Trống trơn" />
        )}
      </div>

      <Modal
        title={
          <Title level={4} style={{margin: 0}}>
            {selectedItem?.name}
          </Title>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedItem?.type === "inventory" && selectedItem?.original.isConsumable && (
            <Button key="use" type="primary" onClick={() => handleUseItem(selectedItem.original.itemId)}>
              Sử dụng
            </Button>
          ),
        ]}
        centered
      >
        {selectedItem && (
          <div style={{textAlign: "center"}}>
            <div
              style={{
                marginBottom: 16,
                height: 150,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9f9f9",
                borderRadius: 8,
              }}
            >
              {(() => {
                let img = null;
                if (selectedItem.type === "character") {
                  img = selectedItem.original.avatar
                    ? getImageUrl(selectedItem.original.avatar)
                    : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${selectedItem.name}`;
                } else if (selectedItem.type === ITEM_TYPES.ARTIFACT || selectedItem.type === "inventory") {
                  img = selectedItem.image ? getImageUrl(selectedItem.image) : null;
                }
                return img ? (
                  <img
                    src={img}
                    alt={selectedItem.name}
                    style={{maxHeight: "100%", maxWidth: "100%", objectFit: "contain"}}
                  />
                ) : (
                  <div style={{color: "#bfbfbf", fontSize: 40}}>
                    <CloudUploadOutlined />
                  </div>
                );
              })()}
            </div>
            <Title level={4} style={{marginBottom: 8}}>
              {selectedItem.name}
            </Title>
            <Text type="secondary">{selectedItem.description || "Không có mô tả"}</Text>

            <div style={{marginTop: 24, textAlign: "left", background: "#f5f5f5", padding: 16, borderRadius: 8}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: 8}}>
                <Text strong>Loại:</Text>
                <Tag color={selectedItem.type === "character" ? "blue" : "green"}>
                  {selectedItem.type === "character" ? "Nhân vật" : "Cổ vật"}
                </Tag>
              </div>
              <div style={{display: "flex", justifyContent: "space-between"}}>
                <Text strong>Số lượng:</Text>
                <Text>{selectedItem.quantity}</Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MuseumPage;
