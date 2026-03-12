import { Result, Button } from "antd";
import { Link } from "react-router-dom";
import SeoHead from "@/components/common/SeoHead";

const NotFound = () => {
  return (
    <>
      <SeoHead title="404 - Không tìm thấy trang" noindex />
      <Result
        status="404"
        title="404"
        subTitle="Trang bạn tìm không tồn tại"
        extra={
          <Link to="/">
            <Button type="primary">Quay Về Trang Chủ</Button>
          </Link>
        }
      />
    </>
  );
};

export default NotFound;
