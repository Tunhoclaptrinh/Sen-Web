import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Statistic,
  Modal,
  message,
  Divider,
  List,
  Avatar,
  Image,
  Flex,
  Alert
} from 'antd';
import { useTranslation } from "react-i18next";
import Button from '@/components/common/Button';
import { useGameSounds } from '@/hooks/useSound';
import {
  GiftOutlined,
  HistoryOutlined,
  SwapOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { getImageUrl } from '@/utils/image.helper';
import './styles.less';

const P_COIN_IMAGE = "/uploads/general/file-1772099811318.jpeg";

const { Title, Text, Paragraph } = Typography;

// Mock data and types based on backend service
interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'discount' | 'item' | 'external';
  price: number;
  currencyType: 'coins' | 'petals' | 'pcoin';
  stock: number;
  image?: string;
  expiryDate?: string;
}

interface WelfareStats {
  pCoins: number;
  totalExchanged: number;
  vouchersClaimed: number;
}

const WelfarePage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('exchange');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats] = useState<WelfareStats>({
    pCoins: 1250, // Mocked for now
    totalExchanged: 5000,
    vouchersClaimed: 3
  });
  const { playClick } = useGameSounds();

  // Load data - Mocking for now to show UI
  useEffect(() => {
    // In real app, call welfare service
    setTimeout(() => {
      setVouchers([
        {
          id: 1,
          code: 'PCOFFEE20',
          name: 'P-Coffee Discount 20%',
          description: 'Giảm giá 20% cho tất cả menu tại P-Coffee.',
          type: 'external',
          price: 10,
          currencyType: 'pcoin',
          stock: 50,
        },
        {
          id: 2,
          code: 'PSHOP50K',
          name: 'P-Shop Voucher 50K',
          description: 'Phiếu mua hàng trị giá 50,000đ tại P-Shop.',
          type: 'external',
          price: 25,
          currencyType: 'pcoin',
          stock: 20,
        },
        {
          id: 3,
          code: 'TRAVELLUSH',
          name: 'Voucher Du lịch 1Tr',
          description: 'Giảm ngay 1,000,000đ khi đặt tour tại TravelLush.',
          type: 'external',
          price: 1000,
          currencyType: 'coins',
          stock: 5,
        },
        {
          id: 4,
          code: 'PETAL_GIFT',
          name: 'Quà tặng Cánh Sen',
          description: 'Nhận ngay bộ sưu tập vật phẩm trang trí.',
          type: 'item',
          price: 50,
          currencyType: 'petals',
          stock: 10,
        }
      ]);
    }, 800);
  }, []);

  const handleExchangePCoin = (amount: number, resource: string) => {
    Modal.confirm({
      title: t('gameWelfare.modal.confirmExchange.title'),
      content: t('gameWelfare.modal.confirmExchange.content', { amount, resource }),
      okText: t('gameWelfare.modal.confirmExchange.ok'),
      cancelText: t('gameWelfare.modal.confirmExchange.cancel'),
      onOk: () => {
        playClick();
        message.success(t('gameWelfare.messages.exchangeSuccess'));
        // Trigger refresh
      }
    });
  };

  const handleRedeemVoucher = (voucher: Voucher) => {
    Modal.confirm({
      title: t('gameWelfare.modal.confirmRedeem.title'),
      content: t('gameWelfare.modal.confirmRedeem.content', {
        price: voucher.price,
        currency: voucher.currencyType === 'pcoin' ? t('gameWelfare.currencies.pcoin') : voucher.currencyType === 'coins' ? t('gameWelfare.currencies.coins') : t('gameWelfare.currencies.petals'),
        name: voucher.name
      }),
      okText: t('gameWelfare.modal.confirmRedeem.ok'),
      cancelText: t('gameWelfare.modal.confirmRedeem.cancel'),
      onOk: () => {
        playClick();
        message.success(t('gameWelfare.messages.redeemSuccess'));
      }
    });
  };

  const renderExchangeTab = () => (
    <div className="exchange-tab">
      <div className="hero-stats">
        <Row gutter={24}>
          <Col span={8}>
            <Card className="stat-card pcoin-stat-premium" bodyStyle={{ padding: 0 }}>
              <Flex align="center">
                <div className="pcoin-sidebar-image">
                  <Image
                    src={getImageUrl(P_COIN_IMAGE)}
                    height={140}
                    style={{ objectFit: 'contain', padding: '12px' }}
                    preview={{
                      mask: <div className="pcoin-preview-mask">{t('gameWelfare.stats.previewMask')}</div>
                    }}
                  />
                </div>
                <div className="pcoin-stat-content" style={{ padding: '24px 16px' }}>
                  <Statistic
                    title={<span style={{ fontWeight: 700, fontSize: '16px' }}>{t('gameWelfare.stats.available')}</span>}
                    value={stats.pCoins}
                    suffix="P"
                    valueStyle={{ color: '#c5a065', fontWeight: 800, fontSize: '28px' }}
                  />
                  <div className="stat-label">{t('gameWelfare.stats.viewDetail')}</div>
                </div>
              </Flex>
            </Card>
          </Col>
          <Col span={16}>
            <Card className="exchange-info-card">
              <div className="exchange-header">
                <SwapOutlined className="header-icon" />
                <div>
                  <Title level={4}>{t('gameWelfare.exchange.title')}</Title>
                  <Text type="secondary">{t('gameWelfare.exchange.subtitle')}</Text>
                </div>
              </div>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <div className="exchange-item">
                    <div className="item-meta">
                      <Avatar size="large" src="https://api.dicebear.com/7.x/icons/svg?seed=coins" />
                      <div className="item-text">
                        <Text strong>{t('gameWelfare.exchange.coins')}</Text>
                        <Text type="secondary">{t('gameWelfare.exchange.rate', { rate: '10:1' })}</Text>
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => handleExchangePCoin(1000, t('gameWelfare.currencies.coins'))}>{t('gameWelfare.exchange.action')}</Button>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="exchange-item">
                    <div className="item-meta">
                      <Avatar size="large" src="https://api.dicebear.com/7.x/icons/svg?seed=petals" />
                      <div className="item-text">
                        <Text strong>{t('gameWelfare.exchange.petals')}</Text>
                        <Text type="secondary">{t('gameWelfare.exchange.rate', { rate: '1:2' })}</Text>
                      </div>
                    </div>
                    <Button variant="primary" onClick={() => handleExchangePCoin(100, t('gameWelfare.currencies.petals'))}>{t('gameWelfare.exchange.action')}</Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );

  const renderStoreTab = () => (
    <div className="store-tab">
      <Row gutter={[24, 24]}>
        {vouchers.map(v => (
          <Col xs={24} sm={12} md={8} key={v.id}>
            <Card
              hoverable
              className={`voucher-card ${v.name.startsWith('P-') ? 'pcoin-eco-card' : ''}`}
              cover={
                <div className="voucher-preview">
                  <GiftOutlined className="preview-icon" />
                  <Tag color={v.currencyType === 'pcoin' ? "gold" : v.currencyType === 'coins' ? "orange" : "magenta"} className="price-tag">
                    {v.currencyType === 'pcoin' ? (
                      <img src={getImageUrl(P_COIN_IMAGE)} alt="p-coin" style={{ width: 18, marginRight: 6 }} />
                    ) : v.currencyType === 'coins' ? (
                      <Avatar size={18} src="https://api.dicebear.com/7.x/icons/svg?seed=coins" style={{ marginRight: 6 }} />
                    ) : (
                      <Avatar size={18} src="https://api.dicebear.com/7.x/icons/svg?seed=petals" style={{ marginRight: 6 }} />
                    )}
                    {v.price} {v.currencyType === 'pcoin' ? 'P' : v.currencyType === 'coins' ? 'Coins' : 'Petals'}
                  </Tag>
                </div>
              }
            >
              <Title level={5}>{v.name}</Title>
              <Paragraph ellipsis={{ rows: 2 }}>{v.description}</Paragraph>
              <div className="voucher-footer">
                <Text type="secondary"><ClockCircleOutlined /> {t('gameWelfare.store.stock', { count: v.stock })}</Text>
                <Button
                  variant="primary"
                  shape="round"
                  disabled={stats.pCoins < v.price}
                  onClick={() => handleRedeemVoucher(v)}
                >
                  {t('gameWelfare.store.action')}
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="history-tab">
      <Card className="history-container">
        <List
          itemLayout="horizontal"
          dataSource={[
            { title: t('gameWelfare.history.items.voucher', { name: 'P-Coffee Voucher' }), date: '2024-02-26 14:00', amount: '-100 P', status: 'success' },
            { title: t('gameWelfare.history.items.fromCoins'), date: '2024-02-25 09:30', amount: '+500 P', status: 'success' },
            { title: t('gameWelfare.history.items.fromPetals'), date: '2024-02-24 16:45', amount: '+200 P', status: 'success' },
          ]}
          renderItem={(item) => (
            <List.Item actions={[<Tag color="green">{t('gameWelfare.history.status')}</Tag>]}>
              <List.Item.Meta
                avatar={<Avatar icon={<HistoryOutlined />} />}
                title={item.title}
                description={item.date}
              />
              <div className={`history-amount ${item.amount.startsWith('+') ? 'positive' : 'negative'}`}>
                {item.amount}
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  return (
    <div className="welfare-page-container">
      <div className="dots-decoration top-right" />
      <div className="dots-decoration bottom-left" />

      <div className="welfare-header">
        <div className="header-content">
          <GiftOutlined className="main-icon" />
          <div className="title-area">
            <Title level={2}>{t('gameWelfare.header.title')}</Title>
            <Text>{t('gameWelfare.header.subtitle')}</Text>
          </div>
        </div>
      </div>

      <div className="welfare-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Alert
          message={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('gameWelfare.alert.title')}</span>}
          description={
            <span style={{ fontSize: '16px' }}>
              {t('gameWelfare.alert.description')}
            </span>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { playClick(); setActiveTab(key); }}
          centered
          className="welfare-tabs"
          items={[
            {
              key: 'exchange',
              label: (
                <span>
                  <SwapOutlined /> {t('gameWelfare.tabs.exchange')}
                </span>
              ),
              children: renderExchangeTab(),
            },
            {
              key: 'store',
              label: (
                <span>
                  <GiftOutlined /> {t('gameWelfare.tabs.store')}
                </span>
              ),
              children: renderStoreTab(),
            },
            {
              key: 'history',
              label: (
                <span>
                  <HistoryOutlined /> {t('gameWelfare.tabs.history')}
                </span>
              ),
              children: renderHistoryTab(),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default WelfarePage;
