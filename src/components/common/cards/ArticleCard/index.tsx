import React from "react";
import {useNavigate} from "react-router-dom";
import {Typography} from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  UserOutlined,
  CommentOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {resolveImage, getImageUrl} from "@/utils/image.helper";
import {normalizeVietnamese} from "@/utils/helpers";
import "./styles.less";

const {Paragraph} = Typography;

export interface ArticleCardProps {
  data: any;
  type: "artifact" | "heritage" | "history" | "article" | "collection" | "exhibition";
  variant?: "default" | "horizontal";
  actions?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  showReadMore?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  data,
  type,
  variant = "default",
  actions,
  secondaryAction,
  showReadMore = true,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    let path = "";
    if (type === "artifact") path = `/artifacts/${data.id}`;
    else if (type === "heritage") path = `/heritage-sites/${data.id}`;
    else if (type === "history" || type === "article") path = `/history/${data.id}`;
    else if (type === "collection") path = `/profile/collections/${data.id}`;
    else if (type === "exhibition") path = `/exhibitions/${data.id}`;

    if (path) navigate(path);
  };

  const rawImage =
    resolveImage(data.image) || resolveImage(data.main_image) || resolveImage(data.images) || data.thumbnail;
  const imageUrl = getImageUrl(
    rawImage,
    type === "collection" ? "/images/collection-placeholder.jpg" : "https://via.placeholder.com/800x600",
  );

  const normalizedTitle = normalizeVietnamese(data.name || data.title);
  const normalizedDesc = normalizeVietnamese(
    data.short_description || data.shortDescription || data.description || "Chưa có mô tả ngắn.",
  );
  const normalizedAuthor = normalizeVietnamese(data.author_name || data.author || "Hệ thống");

  return (
    <div className={`article-card ${type} ${variant}`} onClick={handleNavigate} style={{cursor: "pointer"}}>
      {type !== "collection" && (
        <div className="card-image-wrapper">
          <div className="card-image" style={{backgroundImage: `url('${imageUrl}')`}} />
          {/* Optional: Add Region/Location badge if Heritage */}
          {type === "heritage" && data.region && (
            <div className="location-badge">
              <EnvironmentOutlined /> {data.region}
            </div>
          )}
        </div>
      )}

      <div className="card-content">
        {/* Meta Row: Date | Author | Comments */}
        <div className="card-meta">
          <span className="meta-item">
            <CalendarOutlined /> {dayjs(data.publishDate || data.createdAt || data.created_at).format("DD/MM/YYYY")}
          </span>
          {type === "collection" && (
            <span className="meta-item">
              <AppstoreOutlined /> {data.totalItems ?? data.total_items ?? 0} mục
            </span>
          )}
          {type !== "collection" && (
            <span className="meta-item">
              <UserOutlined /> {normalizedAuthor}
            </span>
          )}
          {data.commentCount !== undefined && type !== "collection" && (
            <span className="meta-item">
              <CommentOutlined /> {data.commentCount > 0 ? `${data.commentCount}` : "0"}
            </span>
          )}
        </div>

        <h3 className="card-title" title={normalizedTitle}>
          {normalizedTitle}
        </h3>

        {/* Short Description or Truncated Description */}
        <Paragraph className="card-desc" ellipsis={{rows: 3}}>
          {normalizedDesc}
        </Paragraph>

        <div className="card-footer">
          <div className="footer-left" onClick={(e) => e.stopPropagation()}>
            {secondaryAction}
          </div>
          <div className="footer-right" onClick={(e) => actions && e.stopPropagation()}>
            {actions
              ? actions
              : showReadMore && (
                  <button className="read-more-btn">
                    {data.short_description || data.shortDescription ? "Đọc thêm" : "Khám phá"} <ArrowRightOutlined />
                  </button>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
