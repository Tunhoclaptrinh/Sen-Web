import { Row, Col, Empty } from 'antd';
import Loading from '../Loading';

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
    return <Loading />;
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
