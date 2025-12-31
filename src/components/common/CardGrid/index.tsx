// ============================================
// src/components/common/CardGrid/index.jsx
// ============================================
import { Row, Col, Empty, Spin } from 'antd';

const CardGrid = ({
  data = [],
  loading = false,
  renderCard,
  emptyText = 'Không có dữ liệu',
  emptyDescription,
  colProps = {
    xs: 24,
    sm: 12,
    md: 8,
    lg: 6,
  },
  gutter = [24, 24] as [number, number],
}: {
  data?: any[];
  loading?: boolean;
  renderCard: (item: any) => React.ReactNode;
  emptyText?: string;
  emptyDescription?: string;
  colProps?: any;
  gutter?: [number, number];
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <Empty description={emptyDescription || emptyText} />;
  }

  return (
    <Row gutter={gutter}>
      {data.map((item) => (
        <Col key={item.id || item._id} {...colProps}>
          {renderCard(item)}
        </Col>
      ))}
    </Row>
  );
};

export default CardGrid;
