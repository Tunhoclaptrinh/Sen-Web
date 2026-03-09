import React, { useEffect, useState } from "react";
import { Tabs, message, Spin, Modal, Typography, Card, Col, Tag, Row } from "antd";
import { useTranslation } from "react-i18next";
import Button from "@/components/common/Button";
import { useGameSounds } from "@/hooks/useSound";
import { ShopOutlined, DollarOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchShopData, purchaseItem, clearMessages } from "@/store/slices/shopSlice";
import { fetchProgress } from "@/store/slices/gameSlice";
import { ShopItem } from "@/types/game.types";
import { aiService, AICharacter } from "@/services/ai.service";
import "./styles.less";
import { getImageUrl } from "@/utils/image.helper";
import ShopDetailModal from "./components/ShopDetailModal";
import { trackBeginCheckout, trackPurchase } from "@/utils/analytics";

const { Title } = Typography;

const ShopPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items = [], inventory = [], loading, purchaseLoading, error, successMessage } = useSelector(
    (state: RootState) => state.shop,
  );
  const { progress } = useSelector((state: RootState) => state.game);
  const { playClick } = useGameSounds();

  // Local state
  const [activeTab, setActiveTab] = useState("all");
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

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
  const allCards: Array<{ type: "shop" | "ai"; data: any; isOwned: boolean }> = [
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
      message.warning(t('gameShop.messages.insufficientBalance', { currency: selectedItem.currency === "petals" ? t('gameShop.currencies.petals') : t('gameShop.currencies.coins') }));
      return;
    }

    trackBeginCheckout({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemType: selectedItem.type || "shop_item",
      value: totalCost,
      currency: selectedItem.currency,
      checkoutType: "shop_item_purchase",
    });

    dispatch(purchaseItem({ itemId: selectedItem.id, quantity: purchaseQuantity }) as any)
      .unwrap()
      .then(() => {
        trackPurchase({
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          itemType: selectedItem.type || "shop_item",
          transactionId: `shop_${selectedItem.id}_${Date.now()}`,
          value: totalCost,
          currency: selectedItem.currency,
        });
        setPurchaseModalVisible(false);
      })
      .catch(() => { });
  };

  const handleBuyItem = (item: ShopItem) => {
    handleOpenModal(item);
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
          onClick={() => { playClick(); handleOpenModal(item); }}
          cover={
            <div className="card-cover">
              {itemImage ? (
                <>
                  <div className="blur-background" style={{ backgroundImage: `url(${itemImage})` }} />
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
                  {t('gameShop.card.noImage')}
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
                {t('gameShop.card.noImage')}
              </div>

              <div className="item-type-tag">
                {(() => {
                  let color = "gold";
                  let text = t('gameShop.types.item');

                  if (["powerup", "hint", "boost"].includes(item.type)) {
                    color = "blue";
                    text = t('gameShop.types.support');
                  } else if (["decoration", "theme"].includes(item.type)) {
                    color = "purple";
                    text = t('gameShop.types.decoration');
                  } else if (["character", "character_skin", "premium_ai"].includes(item.type)) {
                    color = "magenta";
                    text = t('gameShop.types.companion');
                  } else if ((item.type as string) === "collectible") {
                    color = "cyan";
                    text = t('gameShop.types.collectible');
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
                {t('gameShop.card.ownedCount', { count: ownedItem.quantity })}
              </div>
            )}

            <div className="price-section">
              <span>Giá bán:</span>
              <span className="price-value">
                {item.currency === "petals" ? (
                  <>
                    <span style={{ fontSize: "1.2rem" }}>🌸</span> {item.price}
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
                variant="gold"
                fullWidth
                className={`buy-btn ${isOwned ? "owned" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isOwned) handleBuyItem(item);
                }}
                disabled={isOwned}
              >
                {isOwned ? t('gameShop.card.owned') : t('gameShop.card.buyNow')}
              </Button>
            </div>
          </div>
        </Card>
      </Col >
    );
  };

  // Handle AI character purchase
  const handlePurchaseCharacter = async (character: AICharacter) => {
    // Use COINS for characters
    const balance = progress?.coins || 0;
    if (balance < (character.price || 0)) {
      message.warning(t('gameShop.messages.insufficientCoinsForChar'));
      return;
    }

    trackBeginCheckout({
      itemId: character.id,
      itemName: character.name,
      itemType: "ai_character",
      value: character.price || 0,
      currency: "coins",
      checkoutType: "ai_character_purchase",
    });

    Modal.confirm({
      title: t('gameShop.messages.purchaseCharConfirm.title'),
      content: t('gameShop.messages.purchaseCharConfirm.content', { name: character.name, price: character.price }),
      okText: t('gameShop.messages.purchaseCharConfirm.ok'),
      cancelText: t('gameShop.messages.purchaseCharConfirm.cancel'),
      onOk: async () => {
        playClick();
        setPurchasingCharacterId(character.id);
        try {
          const result = await aiService.purchaseCharacter(character.id);
          if (result.success) {
            trackPurchase({
              itemId: character.id,
              itemName: character.name,
              itemType: "ai_character",
              transactionId: `ai_char_${character.id}_${Date.now()}`,
              value: character.price || 0,
              currency: "coins",
            });
            message.success(t('gameShop.messages.purchaseCharSuccess', { name: character.name }));
            fetchAvailableCharacters(); // Refresh list
            dispatch(fetchProgress() as any); // Refresh user coins
          } else {
            message.error(result.message || t('gameShop.messages.purchaseCharError'));
          }
        } catch (err: any) {
          message.error(err.message || t('gameShop.messages.purchaseCharError'));
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
      common: t('gameShop.rarity.common'),
      rare: t('gameShop.rarity.rare'),
      epic: t('gameShop.rarity.epic'),
      legendary: t('gameShop.rarity.legendary'),
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
                  <div className="blur-background" style={{ backgroundImage: `url(${characterImage})` }} />
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
                <Tag color="magenta">{t('gameShop.types.companion')}</Tag>
              </div>
              {character.rarity && (
                <div style={{ position: "absolute", top: 8, left: 8 }}>
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
                <DollarOutlined style={{ marginRight: 4, color: "#FFD700", fontSize: "1.2rem" }} /> {character.price || 0}
              </span>
            </div>

            <div className="buy-btn-wrapper">
              <Button
                variant="gold"
                fullWidth
                className={`buy-btn ${character.isOwned ? "owned" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!character.isOwned) handlePurchaseCharacter(character);
                }}
                loading={purchasingCharacterId === character.id}
                disabled={character.isOwned || purchasingCharacterId === character.id}
              >
                {character.isOwned ? t('gameShop.card.owned') : t('gameShop.card.buyNow')}
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
          <ShopOutlined className="title-icon" /> {t('gameShop.header.title')}
        </Title>
        <div className="shop-subtitle">{t('gameShop.header.subtitle')}</div>
      </div>

      <div className="tabs-container">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { playClick(); setActiveTab(key); }}
          centered
          items={[
            { label: <span>{t('gameShop.tabs.all')}</span>, key: "all" },
            { label: <span>{t('gameShop.tabs.powerups')}</span>, key: "powerups" },
            { label: <span>{t('gameShop.tabs.characters')}</span>, key: "characters" },
            { label: <span>{t('gameShop.tabs.themes')}</span>, key: "themes" },
          ]}
        />
      </div>

      {loading || charactersLoading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
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

      <ShopDetailModal
        visible={purchaseModalVisible}
        onClose={() => setPurchaseModalVisible(false)}
        item={selectedItem}
        quantity={purchaseQuantity}
        onQuantityChange={handleModalQuantityChange}
        onConfirmPurchase={handleConfirmPurchase}
        purchaseLoading={purchaseLoading}
        isOwned={inventory.some((inv) => inv.itemId === selectedItem?.id) && !selectedItem?.isConsumable}
        inventoryQuantity={inventory.find((inv) => inv.itemId === selectedItem?.id)?.quantity}
        userBalance={selectedItem?.currency === "petals" ? progress?.totalSenPetals || 0 : progress?.coins || 0}
      />
    </div>
  );
};

export default ShopPage;
