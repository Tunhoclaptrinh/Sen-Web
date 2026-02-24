import React, {useEffect, useState} from "react";
import {Tabs, Button, message, Spin, Modal, Typography, Card, Col, Tag, Row} from "antd";
import {ShopOutlined, MinusOutlined, PlusOutlined, DollarOutlined} from "@ant-design/icons";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {fetchShopData, purchaseItem, clearMessages} from "@/store/slices/shopSlice";
import {fetchProgress} from "@/store/slices/gameSlice";
import {ShopItem} from "@/types/game.types";
import {aiService, AICharacter} from "@/services/ai.service";
import "./styles.less";
import {getImageUrl} from "@/utils/image.helper";

const {Title, Text} = Typography;

const ShopPage: React.FC = () => {
  const dispatch = useDispatch();
  const {items = [], inventory = [], loading, purchaseLoading, error, successMessage} = useSelector(
    (state: RootState) => state.shop,
  );
  const {progress} = useSelector((state: RootState) => state.game);

  // Local state
  const [activeTab, setActiveTab] = useState("all");
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);

  // AI Character state
  const [availableCharacters, setAvailableCharacters] = useState<AICharacter[]>([]);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [purchasingCharacterId, setPurchasingCharacterId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchShopData() as any);
    fetchAvailableCharacters();
  }, [dispatch]);

  // Fetch available AI characters for purchase
  const fetchAvailableCharacters = async () => {
    setCharactersLoading(true);
    try {
      const characters = await aiService.getAvailableCharacters();
      setAvailableCharacters(characters);
    } catch (err) {
      console.error("Failed to fetch available characters:", err);
    } finally {
      setCharactersLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearMessages());
      dispatch(fetchShopData() as any);
      fetchAvailableCharacters(); // Refresh characters too
    }
    if (error) {
      message.error(error);
      dispatch(clearMessages());
    }
  }, [successMessage, error, dispatch]);

  const filteredItems = items.filter((item) => {
    const active = item.isActive !== undefined ? item.isActive : item.isAvailable;
    if (!active) return false;

    if (activeTab === "all") return true;
    if (activeTab === "powerups") return ["powerup", "hint", "boost"].includes(item.type);
    if (activeTab === "characters")
      return ["character", "characterSkin", "premiumAi", "character_skin"].includes(item.type);
    if (activeTab === "themes") return ["theme", "decoration", "collectible"].includes(item.type);

    return item.type === activeTab;
  });

  // Create unified list combining shop items and AI characters, sorted by owned status (owned at end)
  const allCards: Array<{type: "shop" | "ai"; data: any; isOwned: boolean}> = [
    // Shop items
    ...filteredItems.map((item) => ({
      type: "shop" as const,
      data: item,
      isOwned: inventory.some((inv) => inv.itemId === item.id) && !item.isConsumable,
    })),
    // AI characters (only in 'all' or 'characters' tab)
    ...(activeTab === "all" || activeTab === "characters" ? availableCharacters : []).map((char) => ({
      type: "ai" as const,
      data: char,
      isOwned: char.isOwned || false,
    })),
  ].sort((a, b) => {
    // Sort: not owned first, owned last
    return a.isOwned === b.isOwned ? 0 : a.isOwned ? 1 : -1;
  });

  const handleOpenModal = (item: ShopItem) => {
    setSelectedItem(item);
    setPurchaseQuantity(1);
    setPurchaseModalVisible(true);
  };

  const handleModalQuantityChange = (delta: number) => {
    setPurchaseQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;

    const totalCost = selectedItem.price * purchaseQuantity;
    const balance = selectedItem.currency === "petals" ? progress?.totalSenPetals || 0 : progress?.coins || 0;

    if (balance < totalCost) {
      message.warning(`Bạn không đủ ${selectedItem.currency === "petals" ? "Cánh Sen" : "Xu"}!`);
      return;
    }

    dispatch(purchaseItem({itemId: selectedItem.id, quantity: purchaseQuantity}) as any)
      .unwrap()
      .then(() => {
        setPurchaseModalVisible(false);
      })
      .catch(() => {});
  };

  const handleBuyItem = (item: ShopItem) => {
    const balance = item.currency === "petals" ? progress?.totalSenPetals || 0 : progress?.coins || 0;
    if (balance < item.price) {
      message.warning(`Bạn không đủ ${item.currency === "petals" ? "Cánh Sen" : "Xu"}!`);
      return;
    }

    if (item.isConsumable) {
      handleOpenModal(item);
    } else {
      Modal.confirm({
        title: "Xác nhận mua",
        content: `Bạn muốn mua ${item.name} với giá ${item.price} ${item.currency === "petals" ? "Sen" : "Xu"}?`,
        okText: "Mua ngay",
        cancelText: "Hủy",
        onOk: () => {
          setLoadingItemId(item.id);
          dispatch(purchaseItem({itemId: item.id, quantity: 1}) as any)
            .unwrap()
            .catch(() => {})
            .finally(() => {
              setLoadingItemId(null);
            });
        },
      });
    }
  };

  const renderShopItem = (item: ShopItem) => {
    const ownedItem = inventory.find((inv) => inv.itemId === item.id);
    const isOwned = !!ownedItem && !item.isConsumable;

    // Fallback image handling: use item.image if available, otherwise fallback to item.icon
    const itemImage = item.image ? getImageUrl(item.image) : null;

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
        <Card
          hoverable
          className="shop-card"
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
                      // Fallback on error
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.querySelector(".fallback-icon")?.classList.remove("hidden");
                      // Also hide blur background on error
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
              {/* Fallback container hidden by default unless image error */}
              <div
                className="fallback-icon hidden"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  background: "#f5f5f5",
                }}
              >
                No image
              </div>

              <div className="item-type-tag">
                {(() => {
                  let color = "gold";
                  let text = "VẬT PHẨM";

                  if (["powerup", "hint", "boost"].includes(item.type)) {
                    color = "blue";
                    text = "HỖ TRỢ";
                  } else if (["decoration", "theme"].includes(item.type)) {
                    color = "purple";
                    text = "TRANG TRÍ";
                  } else if (["character", "character_skin", "premium_ai"].includes(item.type)) {
                    color = "magenta";
                    text = "ĐỒNG HÀNH";
                  } else if ((item.type as string) === "collectible") {
                    color = "cyan";
                    text = "SƯU TẦM";
                  } else {
                    text = item.type.toUpperCase();
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
              {item.description}
            </div>

            {ownedItem && item.isConsumable && (
              <div
                className="owned-quantity"
                style={{
                  fontSize: "0.8rem",
                  color: "#8b1d1d", // @seal-red
                  background: "rgba(139, 29, 29, 0.08)", // Light fade of seal-red
                  border: "1px solid rgba(139, 29, 29, 0.2)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  display: "inline-block",
                  fontWeight: 700,
                  marginBottom: 8,
                  fontFamily: '"Merriweather", serif',
                  width: "fit-content",
                }}
              >
                Đang có: {ownedItem.quantity}
              </div>
            )}

            <div className="price-section">
              <span>Giá bán:</span>
              <span className="price-value">
                {item.currency === "petals" ? (
                  <>
                    <span style={{fontSize: "1.2rem"}}>🌸</span> {item.price}
                  </>
                ) : (
                  <>
                    <DollarOutlined /> {item.price}
                  </>
                )}
              </span>
            </div>

            <div className="buy-btn-wrapper">
              <Button
                type="primary"
                className={`buy-btn ${isOwned ? "owned" : ""}`}
                onClick={() => !isOwned && handleBuyItem(item)}
                loading={loadingItemId === item.id}
                disabled={isOwned || loadingItemId === item.id}
              >
                {isOwned ? "Đã sở hữu" : "Mua ngay"}
              </Button>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  // Handle AI character purchase
  const handlePurchaseCharacter = async (character: AICharacter) => {
    // Use COINS for characters
    const balance = progress?.coins || 0;
    if (balance < (character.price || 0)) {
      message.warning("Bạn không đủ Xu để mua nhân vật này!");
      return;
    }

    Modal.confirm({
      title: "Mua nhân vật đồng hành",
      content: `Bạn muốn mua ${character.name} với giá ${character.price} Xu?`,
      okText: "Mua ngay",
      cancelText: "Hủy",
      onOk: async () => {
        setPurchasingCharacterId(character.id);
        try {
          const result = await aiService.purchaseCharacter(character.id);
          if (result.success) {
            message.success(`Đã mua thành công nhân vật ${character.name}!`);
            fetchAvailableCharacters(); // Refresh list
            dispatch(fetchProgress() as any); // Refresh user coins
          } else {
            message.error(result.message || "Không thể mua nhân vật");
          }
        } catch (err: any) {
          message.error(err.message || "Lỗi khi mua nhân vật");
        } finally {
          setPurchasingCharacterId(null);
        }
      },
    });
  };

  // Render AI Character card
  const renderAICharacter = (character: AICharacter) => {
    const rarityColors: Record<string, string> = {
      common: "default",
      rare: "blue",
      epic: "purple",
      legendary: "gold",
    };
    const rarityLabels: Record<string, string> = {
      common: "Phổ thông",
      rare: "Hiếm",
      epic: "Sử thi",
      legendary: "Huyền thoại",
    };

    const characterImage = character.avatar ? getImageUrl(character.avatar) : null;

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={`char-${character.id}`}>
        <Card
          hoverable
          className="shop-card"
          cover={
            <div className="card-cover">
              {characterImage ? (
                <>
                  <div className="blur-background" style={{backgroundImage: `url(${characterImage})`}} />
                  <img
                    src={characterImage}
                    alt={character.name}
                    className="item-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
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
                  🤖
                </div>
              )}
              <div className="item-type-tag">
                <Tag color="magenta">ĐỒNG HÀNH</Tag>
              </div>
              {character.rarity && (
                <div style={{position: "absolute", top: 8, left: 8}}>
                  <Tag color={rarityColors[character.rarity] || "default"}>
                    {rarityLabels[character.rarity] || character.rarity.toUpperCase()}
                  </Tag>
                </div>
              )}
            </div>
          }
        >
          <div className="item-info">
            <div className="item-name">{character.name}</div>
            <div className="item-desc" title={character.description}>
              {character.description || character.personality}
            </div>

            <div className="price-section">
              <span>Giá bán:</span>
              <span className="price-value">
                <DollarOutlined style={{marginRight: 4, color: "#FFD700", fontSize: "1.2rem"}} /> {character.price || 0}
              </span>
            </div>

            <div className="buy-btn-wrapper">
              <Button
                type="primary"
                className={`buy-btn ${character.isOwned ? "owned" : ""}`}
                onClick={() => !character.isOwned && handlePurchaseCharacter(character)}
                loading={purchasingCharacterId === character.id}
                disabled={character.isOwned || purchasingCharacterId === character.id}
              >
                {character.isOwned ? "Đã sở hữu" : "Mua ngay"}
              </Button>
            </div>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <Title level={1} className="main-title">
          <ShopOutlined className="title-icon" /> Cửa Hàng Sen
        </Title>
        <div className="shop-subtitle">Trao đổi vật phẩm - Nâng tầm trải nghiệm</div>
      </div>

      <div className="tabs-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {label: <span>Tất cả</span>, key: "all"},
            {label: <span>Hỗ trợ</span>, key: "powerups"},
            {label: <span>Nhân vật & AI</span>, key: "characters"},
            {label: <span>Giao diện</span>, key: "themes"},
          ]}
        />
      </div>

      {loading || charactersLoading ? (
        <div style={{textAlign: "center", padding: 50}}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="shop-items-grid">
          <Row gutter={[24, 24]}>
            {/* Unified sorted render - owned items at end */}
            {allCards.map((card) => (card.type === "shop" ? renderShopItem(card.data) : renderAICharacter(card.data)))}
          </Row>
        </div>
      )}

      <Modal
        title={
          <Title level={4} style={{margin: 0}}>
            Mua vật phẩm
          </Title>
        }
        open={purchaseModalVisible}
        onCancel={() => setPurchaseModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPurchaseModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="buy" type="primary" loading={purchaseLoading} onClick={handleConfirmPurchase}>
            Mua ({selectedItem ? selectedItem.price * purchaseQuantity : 0}{" "}
            {selectedItem?.currency === "petals" ? "Sen" : "Xu"})
          </Button>,
        ]}
        centered
      >
        {selectedItem && (
          <div className="purchase-modal-content" style={{textAlign: "center"}}>
            <div style={{marginBottom: 16}}>
              {selectedItem.image ? (
                <img
                  src={getImageUrl(selectedItem.image)}
                  alt={selectedItem.name}
                  style={{width: 80, height: 80, objectFit: "contain", marginBottom: 8}}
                />
              ) : (
                <div style={{fontSize: "3rem"}}>{selectedItem.icon}</div>
              )}
              <Title level={5}>{selectedItem.name}</Title>
              <Text type="secondary">{selectedItem.description}</Text>

              {(() => {
                const owned = inventory.find((i) => i.itemId === selectedItem.id);
                if (owned && selectedItem.isConsumable) {
                  return (
                    <div
                      style={{
                        marginTop: 12,
                        color: "#8b1d1d", // @seal-red
                        background: "rgba(139, 29, 29, 0.08)",
                        padding: "4px 12px",
                        borderRadius: "16px",
                        display: "inline-block",
                        fontWeight: 700,
                        border: "1px solid rgba(139, 29, 29, 0.2)",
                        fontFamily: '"Merriweather", serif',
                      }}
                    >
                      Bạn đang có: {owned.quantity}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div
              className="quantity-control"
              style={{display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 24}}
            >
              <Button
                icon={<MinusOutlined />}
                onClick={() => handleModalQuantityChange(-1)}
                disabled={purchaseQuantity <= 1}
              />
              <span style={{fontSize: 24, fontWeight: "bold", minWidth: 40}}>{purchaseQuantity}</span>
              <Button icon={<PlusOutlined />} onClick={() => handleModalQuantityChange(1)} />
            </div>

            <div className="price-summary" style={{background: "#f5f5f5", padding: 12, borderRadius: 8}}>
              <Text>
                Đơn giá: {selectedItem.price} {selectedItem.currency === "petals" ? "Sen" : "Xu"}
              </Text>
              <div style={{fontSize: 18, fontWeight: "bold", color: "#cf1322", marginTop: 4}}>
                Tổng: {selectedItem.price * purchaseQuantity} {selectedItem.currency === "petals" ? "Sen" : "Xu"}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShopPage;
