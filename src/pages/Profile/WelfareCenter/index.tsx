import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Tabs,
  Card,
  Row,
  Col,
  Space,
  Button,
  Modal,
  Form,
  InputNumber,
  message,
  Tag,
  Spin,
  Empty,
  Table,
  Divider,
  Alert,
} from 'antd';
import {
  GiftOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DollarOutlined,
  BarChartOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Typography } from 'antd';
import { StatisticsCard } from '@/components/common';
import { getImageUrl } from '@/utils/image.helper';
import welfareService from '@/services/welfare.service';
import { Voucher, UserVoucher, CurrencyType } from '@/types/welfare.types';
import { useTranslation } from 'react-i18next';
import './style.less';

const { Text, Title } = Typography;

interface CurrencyBalance {
  coins: number;
  petals: number;
  pcoin: number;
}

interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  minAmount: number;
}

// interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

interface ExchangeHistoryRecord {
  id: number | string;
  type: string;
  details?: {
    fromCurrency?: string;
    toAmount?: number;
    toCurrency?: string;
    fromAmount?: number;
  };
  createdAt: string;
}

const WelfareCenter: React.FC = () => {
  // State
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [_exchangeHistory, _setExchangeHistory] = useState<ExchangeHistoryRecord[]>([]);
  const [balances, setBalances] = useState<CurrencyBalance>({ coins: 0, petals: 0, pcoin: 0 });
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [exchangeForm] = Form.useForm();
  const { t } = useTranslation('translation', { keyPrefix: 'profile' });

  // Fetch user balance
  const fetchUserBalance = useCallback(async () => {
    try {
      // Get balance from any available source or mock
      setBalances({
        coins: Math.floor(Math.random() * 5000),
        petals: Math.floor(Math.random() * 500),
        pcoin: Math.floor(Math.random() * 1000),
      });
    } catch (_error) {
      // Mock data fallback
      setBalances({
        coins: Math.floor(Math.random() * 5000),
        petals: Math.floor(Math.random() * 500),
        pcoin: Math.floor(Math.random() * 1000),
      });
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [vouchersRes, myVouchersRes, historyRes] = await Promise.all([
        welfareService.getAvailableVouchers(),
        welfareService.getMyVouchers(),
        welfareService.getExchangeHistory(),
      ]);

      setVouchers(vouchersRes || []);
      setUserVouchers(myVouchersRes || []);
      _setExchangeHistory((historyRes || []) as unknown[] as ExchangeHistoryRecord[]);

      await fetchUserBalance();
    } catch (_error) {
      message.error(t("welfareCenter.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [fetchUserBalance]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const exchangeRates: ExchangeRate[] = useMemo(
    () => [
      { fromCurrency: 'coins', toCurrency: 'pcoin', rate: 0.1, minAmount: 100 },
      { fromCurrency: 'petals', toCurrency: 'pcoin', rate: 2, minAmount: 10 },
    ],
    []
  );

  const handleExchange = useCallback(
    async (values: { currency: string; amount: number }) => {
      setExchangeLoading(true);
      try {
        const response = await welfareService.exchangeResource({
          fromCurrency: values.currency as CurrencyType,
          amount: values.amount,
        });

        if (response) {
          message.success(t("welfareCenter.exchangeSuccess"));
          setExchangeModalVisible(false);
          exchangeForm.resetFields();
          await fetchAllData();
        } else {
          message.error(t("welfareCenter.exchangeFailed"));
        }
      } catch (_error) {
        message.error(t("welfareCenter.exchangeError"));
      } finally {
        setExchangeLoading(false);
      }
    },
    [exchangeForm, fetchAllData]
  );

  const handleRedeemVoucher = useCallback(async () => {
    if (!selectedVoucher) return;

    setRedeemLoading(true);
    try {
      const response = await welfareService.redeemVoucher(selectedVoucher.id);

      if (response) {
        message.success(t("welfareCenter.redeemSuccess"));
        setRedeemModalVisible(false);
        setSelectedVoucher(null);
        await fetchAllData();
      } else {
        message.error(t("welfareCenter.redeemFailed"));
      }
    } catch (_error) {
      message.error(t("welfareCenter.redeemError"));
    } finally {
      setRedeemLoading(false);
    }
  }, [selectedVoucher, fetchAllData]);

  const handleUseVoucher = useCallback(
    async (_userVoucherId: number) => {
      Modal.confirm({
        title: t("welfareCenter.useVoucherTitle"),
        icon: <ExclamationCircleOutlined />,
        content: t("welfareCenter.useVoucherConfirm"),
        okText: t("welfareCenter.useVoucherBtn"),
        cancelText: t("welfareCenter.cancelBtn"),
        onOk: async () => {
          try {
            message.info(t("welfareCenter.useVoucherInfo"));
            // ... API call disabled ...
          } catch (_error) {
            message.error(t("welfareCenter.useVoucherError"));
          }
        },
      });
    },
    []
  );

  const renderBalancePanel = () => (
    <StatisticsCard
      loading={loading}
      containerStyle={{ marginBottom: 24 }}
      colSpan={{ span: 24, sm: 12, md: 12, lg: 6 }}
      rowGutter={24}
      data={[
        {
          title: t("welfareCenter.balanceCoins"),
          value: balances.coins,
          icon: <DollarOutlined />,
          valueColor: '#faad14',
        },
        {
          title: t("welfareCenter.balancePetals"),
          value: balances.petals,
          icon: <GiftOutlined />,
          valueColor: '#eb2f96',
        },
        {
          title: t("welfareCenter.balancePCoin"),
          value: balances.pcoin,
          icon: <BarChartOutlined />,
          valueColor: '#c5a065',
        },
        {
          title: t("welfareCenter.balanceAvailableVouchers"),
          value: (vouchers || []).filter((v: Voucher) => v.isActive).length,
          icon: <TeamOutlined />,
          valueColor: '#52c41a',
        },
      ]}
    />
  );

  // Available Vouchers Tab
  const renderAvailableVouchersTab = () => (
    <Spin spinning={loading}>
      {(!vouchers || vouchers.length === 0) ? (
        <Empty description={t("welfareCenter.emptyAvailableVouchers")} />
      ) : (
        <Row gutter={[16, 16]}>
          {vouchers.map((v) => {
            const currencyBalance = balances[v.currencyType as keyof CurrencyBalance];
            const canRedeem = currencyBalance >= v.price && (v.remainingQuantity ?? 0) > 0;

            return (
              <Col key={v.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="voucher-card"
                  cover={
                    <img
                      alt="voucher"
                      src={getImageUrl(v.image)}
                      style={{ height: 200, objectFit: 'cover' }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://via.placeholder.com/300x200?text=Voucher';
                      }}
                    />
                  }
                  style={{ height: '100%' }}
                  bodyStyle={{ display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ flex: 1 }}>
                    <Title level={5} style={{ marginBottom: 4 }}>
                      {v.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {v.provider}
                    </Text>
                    <Tag
                      color={
                        String(v.type) === 'external'
                          ? 'blue'
                          : String(v.type) === 'shop'
                            ? 'green'
                            : 'orange'
                      }
                      style={{ marginTop: 8, display: 'block' }}
                    >
                      {String(v.type) === 'external' ? t("welfareCenter.typeExternal") : String(v.type) === 'shop' ? t("welfareCenter.typeShop") : t("welfareCenter.typeItem")}
                    </Tag>
                    <div style={{ marginTop: 12, minHeight: 40 }}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {v.description}
                      </Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ marginBottom: 8 }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong style={{ fontSize: 14 }}>
                          {t("welfareCenter.price")} {v.price}{' '}
                          {v.currencyType === 'coins'
                            ? '💰'
                            : v.currencyType === 'petals'
                              ? '🌸'
                              : '👑'}
                        </Text>
                      </Col>
                    </Row>
                    <Row justify="space-between" align="middle" style={{ marginTop: 4 }}>
                      <Col>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {t("welfareCenter.remaining")} {v.remainingQuantity ?? 0}/{v.totalQuantity ?? 0}
                        </Text>
                      </Col>
                    </Row>
                  </div>

                  <Button
                    type="primary"
                    block
                    onClick={() => {
                      setSelectedVoucher(v);
                      setRedeemModalVisible(true);
                    }}
                    disabled={!canRedeem}
                  >
                    {t("welfareCenter.redeemNowBtn")}
                  </Button>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Spin>
  );

  // My Vouchers Tab
  const renderMyVouchersTab = () => {
    const columns = [
      {
        title: t("welfareCenter.colVoucherName"),
        dataIndex: ['voucher', 'title'],
        key: 'title',
        render: (text: string, _record: UserVoucher) => (
          <Space>
            <img
              src={getImageUrl(_record.voucher?.image)}
              alt="voucher"
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                objectFit: 'cover',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/40?text=V';
              }}
            />
            <Text>{text}</Text>
          </Space>
        ),
      },
      {
        title: t("welfareCenter.colVoucherCode"),
        dataIndex: 'code',
        key: 'code',
        render: (code: string) => <Tag color="blue">{code}</Tag>,
      },
      {
        title: t("welfareCenter.colStatus"),
        dataIndex: 'isUsed',
        key: 'isUsed',
        render: (isUsed: boolean) => (
          <Tag color={isUsed ? 'red' : 'green'}>
            {isUsed ? `❌ ${t("welfareCenter.statusUsed")}` : `✅ ${t("welfareCenter.statusAvailable")}`}
          </Tag>
        ),
      },
      {
        title: t("welfareCenter.colRedeemedAt"),
        dataIndex: 'redeemedAt',
        key: 'redeemedAt',
        render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      },
      {
        title: t("welfareCenter.colAction"),
        key: 'action',
        render: (_: unknown, record: UserVoucher) => (
          <Button
            type="primary"
            size="small"
            disabled={record.isUsed}
            onClick={() => handleUseVoucher(record.id)}
          >
            {record.isUsed ? t("welfareCenter.btnUsed") : t("welfareCenter.useVoucherBtn")}
          </Button>
        ),
      },
    ];

    return (
      <Spin spinning={loading}>
        {(!userVouchers || userVouchers.length === 0) ? (
          <Empty description={t("welfareCenter.emptyMyVouchers")} />
        ) : (
          <Table
            columns={columns}
            dataSource={userVouchers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        )}
      </Spin>
    );
  };

  // Exchange History Tab
  const renderExchangeHistoryTab = () => {
    const columns = [
      {
        title: t("welfareCenter.colTransactionType"),
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color={type === 'exchange' ? 'blue' : 'green'}>
            {type === 'exchange' ? t("welfareCenter.txExchange") : t("welfareCenter.txReceive")}
          </Tag>
        ),
      },
      {
        title: t("welfareCenter.colDetails"),
        dataIndex: 'details',
        key: 'details',
        render: (details: ExchangeHistoryRecord['details']) => (
          <Space direction="vertical" size={0}>
            <Text>
              {details?.fromAmount} {details?.fromCurrency}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              → {details?.toAmount} {details?.toCurrency}
            </Text>
          </Space>
        ),
      },
      {
        title: t("welfareCenter.colTransactionDate"),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      },
    ];

    return (
      <Spin spinning={loading}>
        {(!_exchangeHistory || _exchangeHistory.length === 0) ? (
          <Empty description={t("welfareCenter.emptyHistory")} />
        ) : (
          <Table
            columns={columns}
            dataSource={_exchangeHistory}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        )}
      </Spin>
    );
  };

  return (
    <div className="welfare-center" style={{ padding: '0 0 24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            <GiftOutlined /> {t("welfareCenter.title")}
          </Title>
          <Text type="secondary">{t("welfareCenter.subtitle")}</Text>
        </div>

        <Alert
          message={<span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t("welfareCenter.importantNoteTitle")}</span>}
          description={
            <span style={{ fontSize: '16px' }}>
              {t("welfareCenter.importantNoteDesc")}
            </span>
          }
          type="warning"
          showIcon
        />

        {renderBalancePanel()}

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => setExchangeModalVisible(true)}
            >
              {t("welfareCenter.exchangeBtn")}
            </Button>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchAllData()}
              loading={loading}
            >
              {t("welfareCenter.refreshBtn")}
            </Button>
          </Col>
        </Row>

        <Tabs
          items={[
            {
              key: 'available',
              label: `📦 ${t("welfareCenter.tabAvailableVouchers")} (${vouchers?.length || 0})`,
              children: renderAvailableVouchersTab(),
            },
            {
              key: 'my-vouchers',
              label: `🎁 ${t("welfareCenter.tabMyVouchers")} (${userVouchers?.length || 0})`,
              children: renderMyVouchersTab(),
            },
            {
              key: 'history',
              label: `📋 ${t("welfareCenter.tabExchangeHistory")}`,
              children: renderExchangeHistoryTab(),
            },
          ]}
        />
      </Space>

      {/* Exchange Currency Modal */}
      <Modal
        title={t("welfareCenter.modalExchangeTitle")}
        open={exchangeModalVisible}
        onCancel={() => setExchangeModalVisible(false)}
        onOk={() => exchangeForm.submit()}
        confirmLoading={exchangeLoading}
        width={500}
      >
        <Form form={exchangeForm} layout="vertical" onFinish={handleExchange}>
          <Form.Item
            name="currency"
            label={t("welfareCenter.modalSelectCurrency")}
            rules={[{ required: true, message: t("welfareCenter.modalCurrencyRequired") }]}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <Card
                hoverable
                style={{ flex: 1, cursor: 'pointer' }}
                onClick={() => exchangeForm.setFieldValue('currency', 'coins')}
              >
                <Text>💰 {t("welfareCenter.balanceCoins")}</Text>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                  {balances.coins}/100
                </div>
              </Card>
              <Card
                hoverable
                style={{ flex: 1, cursor: 'pointer' }}
                onClick={() => exchangeForm.setFieldValue('currency', 'petals')}
              >
                <Text>🌸 {t("welfareCenter.balancePetals")}</Text>
                <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
                  {balances.petals}/10
                </div>
              </Card>
            </div>
          </Form.Item>

          <Form.Item
            name="amount"
            label={t("welfareCenter.modalAmount")}
            rules={[
              { required: true, message: t("welfareCenter.modalAmountRequired") },
              { type: 'number', min: 1, message: t("welfareCenter.modalAmountMin") },
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng" />
          </Form.Item>

          <Form.Item noStyle>
            {() => {
              const currency = exchangeForm.getFieldValue('currency');
              const amount = exchangeForm.getFieldValue('amount') || 0;
              const rate = exchangeRates.find((r) => r.fromCurrency === currency);
              const resultAmount = rate ? Math.floor(amount * rate.rate) : 0;

              return (
                <Card size="small" style={{ background: '#f5f5f5' }}>
                  <Row justify="space-between">
                    <Text>{t("welfareCenter.modalReceiveAmount")}</Text>
                    <Text strong>{resultAmount} P-Coin</Text>
                  </Row>
                </Card>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* Redeem Voucher Confirmation Modal */}
      <Modal
        title={t("welfareCenter.modalRedeemTitle")}
        open={redeemModalVisible}
        onCancel={() => setRedeemModalVisible(false)}
        onOk={handleRedeemVoucher}
        confirmLoading={redeemLoading}
        width={500}
      >
        {selectedVoucher && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <img
              src={getImageUrl(selectedVoucher.image)}
              alt="voucher"
              style={{
                width: '100%',
                height: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/500x200?text=Voucher';
              }}
            />

            <div>
              <Title level={4}>{selectedVoucher.title}</Title>
              <Text type="secondary">{selectedVoucher.provider}</Text>
            </div>

            <Card size="small" style={{ background: '#f5f5f5' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">{t("welfareCenter.price")}</Text>
                  <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {selectedVoucher.price}{' '}
                    {selectedVoucher.currencyType === 'coins'
                      ? '💰'
                      : selectedVoucher.currencyType === 'petals'
                        ? '🌸'
                        : '👑'}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">{t("welfareCenter.modalYouHave")}</Text>
                  <div style={{ fontSize: 16, fontWeight: 'bold', color: '#52c41a' }}>
                    {balances[selectedVoucher.currencyType as keyof CurrencyBalance]}{' '}
                    {selectedVoucher.currencyType === 'coins'
                      ? '💰'
                      : selectedVoucher.currencyType === 'petals'
                        ? '🌸'
                        : '👑'}
                  </div>
                </Col>
              </Row>
            </Card>

            <Text>{selectedVoucher.description}</Text>
          </Space>
        )}
      </Modal>

      <style>{`
        .welfare-center .voucher-card {
          border-radius: 12px;
          transition: all 0.3s;
        }
        .welfare-center .voucher-card:hover {
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
};

export default WelfareCenter;
