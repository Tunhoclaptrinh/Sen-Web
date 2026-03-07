import React from "react";
import { Stage } from "@pixi/react";
import { Image, Modal } from "antd";
import "./styles.less";
import SenChibi from "@/components/SenChibi";
import androidAppQr from "./QR/Android_App_QR.png";
import websiteQr from "./QR/Website_QR.png";

// Import brand assets
import logoPng from "../../assets/images/logo.png";
import PINNOVATION_LOGO from "./PITCHING_DAY.png";
import smokeLeft from "../../assets/images/background/smoke-left.png";
import smokeRight from "../../assets/images/background/smoke-right.png";
import lotus1 from "../../assets/images/background/lotus-1.png";
import lotus2 from "../../assets/images/background/lotus-2.png";
import lotus3 from "../../assets/images/background/lotus-3.png";
import bronzeDrum from "../../assets/images/background/bronze-drum.png";
import backgroundFull from "../../assets/images/background/background-full.png";

interface PosterPageProps {
  standalone?: boolean;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  department: string;
  specialization: string;
  contact: string;
}

interface RoadmapStage {
  id: number;
  phase: string;
  milestone: string;
}

interface ValuePropositionItem {
  id: number;
  title: string;
  summary: string;
  details: string[];
}

interface BusinessModelItem {
  id: number;
  title: string;
  points: string[];
  details: string[];
}

interface SolutionFeatureItem {
  id: number;
  icon: string;
  title: string;
  summary: string;
  details: string[];
}

interface QrItem {
  id: number;
  label: string;
  badge: string;
  title: string;
  summary: string;
  destination: string;
  image: string;
  details: string[];
}

interface ProblemItem {
  id: number;
  title: string;
  summary: string;
  details: string[];
}

interface InsightDetail {
  sectionLabel: string;
  title: string;
  summary?: string;
  details: string[];
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Nguyễn Văn Hiếu",
    role: "AI Engineer",
    avatar: new URL("./Photo/Hieu.JPG", import.meta.url).href,
    department: "Công nghệ",
    specialization: "AI, tích hợp mô hình và tối ưu hội thoại",
    contact: "hieu@sengame.vn",
  },
  {
    id: 2,
    name: "Nguyễn Tiến Tuấn",
    role: "Lead/Tech/Product",
    avatar: new URL("./Photo/Tuan.jpg", import.meta.url).href,
    department: "Sản phẩm",
    specialization: "Định hướng sản phẩm, giao diện, kiến trúc hệ thống",
    contact: "tuan@sengame.vn",
  },
  {
    id: 3,
    name: "Trần Thành Duy",
    role: "Developer/Presenter",
    avatar: new URL("./Photo/Duy.JPG", import.meta.url).href,
    department: "Phát triển",
    specialization: "Vận hành, giao diện, demo sản phẩm và trình bày",
    contact: "duy@sengame.vn",
  },
  {
    id: 4,
    name: "Phan Thị Thu Nguyệt",
    role: "Designer/Communications",
    avatar: new URL("./Photo/Nguyet.jpg", import.meta.url).href,
    department: "Thiết kế",
    specialization: "UI/UX và truyền thông nội dung",
    contact: "nguyet@sengame.vn",
  },
  {
    id: 5,
    name: "Bùi Thị Yến",
    role: "Business/Marketing",
    department: "Kinh doanh",
    specialization: "Nghiệp vụ doanh nghiệp, phát triển đối tác và marketing",
    contact: "yen@sengame.vn",
  },
];

const problemItems: ProblemItem[] = [
  {
    id: 1,
    title: "Tiếp cận một chiều",
    summary: "Việc học chủ yếu dựa trên truyền đạt lý thuyết, thiếu cơ hội tương tác và trải nghiệm thực tế.",
    details: [
      "Nội dung chủ yếu đi theo hình thức đọc - chép, khó tạo hứng thú lâu dài.",
      "Người học ít cơ hội gắn kiến thức với bối cảnh thực tế tại di tích, bảo tàng.",
      "Mức độ ghi nhớ giảm khi thiếu hoạt động tương tác và phản hồi trực tiếp.",
    ],
  },
  {
    id: 2,
    title: "Hạn chế chủ động",
    summary: "Tìm hiểu di sản ngoài lớp học còn thấp, lịch sử trở thành môn học để thi hơn là để khám phá.",
    details: [
      "Thói quen tự tìm hiểu ngoài giờ học chưa hình thành rõ ở phần lớn học sinh.",
      "Di sản văn hóa thường bị xem là kiến thức khô, không gắn với trải nghiệm cá nhân.",
      "Động lực học tập giảm khi thiếu cơ chế khuyến khích khám phá.",
    ],
  },
  {
    id: 3,
    title: "Khoảng cách lý thuyết & thực tế",
    summary: "Biết tên di tích nhưng chưa hiểu bối cảnh, ý nghĩa và giá trị trong đời sống hiện đại.",
    details: [
      "Kiến thức rời rạc khiến người học khó liên kết các sự kiện lịch sử.",
      "Nội dung học thiếu cầu nối giữa bài giảng và không gian văn hóa ngoài đời thực.",
      "Giá trị ứng dụng của lịch sử trong tư duy hiện đại chưa được làm nổi bật.",
    ],
  },
];

const roadmapStages: RoadmapStage[] = [
  { id: 1, phase: "GĐ 1 (6th)", milestone: "Chạy thử nghiệm tại PTIT" },
  { id: 2, phase: "GĐ 2 (6th)", milestone: "Thí điểm tại THCS" },
  { id: 3, phase: "GĐ 3 (2n)", milestone: "Mở rộng B2B trường học" },
  { id: 4, phase: "GĐ 4 (2n)", milestone: "B2C & Du lịch văn hóa" },
];

const valuePropositionItems: ValuePropositionItem[] = [
  {
    id: 1,
    title: "Nền tảng chuyên biệt",
    summary: "Dành riêng cho văn hóa & du lịch, tích hợp học liệu số + game hóa + AI kiểm soát dữ liệu.",
    details: [
      "Thiết kế theo ngữ cảnh giáo dục, bảo tàng và du lịch trải nghiệm.",
      "Cho phép triển khai học liệu theo chủ đề, tuyến tham quan và nhiệm vụ.",
      "Cơ chế quản trị nội dung tập trung giúp chuẩn hóa thông tin.",
    ],
  },
  {
    id: 2,
    title: "AI Nhân vật lịch sử",
    summary: "Phản hồi dựa trên dữ liệu nội bộ được kiểm duyệt, tránh sai lệch thông tin lịch sử.",
    details: [
      "Dữ liệu trả lời được xây từ kho tri thức đã duyệt theo từng chủ điểm.",
      "Giữ phong cách đối thoại gần gũi nhưng vẫn đảm bảo chính xác nội dung.",
      "Có thể mở rộng thêm nhân vật theo các giai đoạn lịch sử khác nhau.",
    ],
  },
  {
    id: 3,
    title: "Kết nối Thực - Số",
    summary: "Liên kết kiến thức lớp học với trải nghiệm trực tiếp tại bảo tàng, di tích qua mã QR & nhiệm vụ.",
    details: [
      "Mỗi điểm chạm thực tế có thể gắn QR để mở bài học, nhiệm vụ và hiện vật.",
      "Học sinh ghi nhận tiến trình khám phá theo thời gian thực.",
      "Giúp chuyển từ học thụ động sang học qua trải nghiệm có dẫn dắt.",
    ],
  },
];

const businessModelItems: BusinessModelItem[] = [
  {
    id: 1,
    title: "Khách hàng mục tiêu",
    points: ["Trường học & Phụ huynh", "Học sinh THCS - THPT", "Du khách văn hóa"],
    details: [
      "Tập trung nhóm người dùng có nhu cầu học lịch sử qua trải nghiệm.",
      "Mô hình có thể triển khai theo lớp, theo trường hoặc theo tour.",
      "Có khả năng mở rộng sang các đối tượng khách quốc tế quan tâm văn hóa Việt.",
    ],
  },
  {
    id: 2,
    title: "Nguồn doanh thu",
    points: ["Phí triển khai SaaS", "Bản quyền nội dung", "Hoa hồng từ dịch vụ"],
    details: [
      "Thu phí theo gói sử dụng nền tảng và số lượng người dùng.",
      "Khai thác bản quyền học liệu và kịch bản trải nghiệm số.",
      "Kết hợp doanh thu chia sẻ từ đối tác du lịch và sự kiện văn hóa.",
    ],
  },
  {
    id: 3,
    title: "Cấu trúc chi phí",
    points: ["Phát triển nền tảng", "Sản xuất nội dung", "Hạ tầng & Marketing"],
    details: [
      "Chi phí công nghệ tập trung vào sản phẩm lõi và tích hợp AI.",
      "Ngân sách nội dung dành cho chuẩn hóa dữ liệu và biên tập học liệu.",
      "Chi phí vận hành ưu tiên hạ tầng ổn định và tăng trưởng người dùng bền vững.",
    ],
  },
  {
    id: 4,
    title: "Đối tác then chốt",
    points: ["Bảo tàng, Khu di tích", "Học viện PTIT", "Đơn vị lữ hành"],
    details: [
      "Đối tác học thuật giúp đảm bảo tính chính xác và chiều sâu nội dung.",
      "Đối tác văn hóa giúp mở rộng điểm chạm thực tế ngoài lớp học.",
      "Đối tác lữ hành tạo kênh thương mại hóa các gói trải nghiệm.",
    ],
  },
];

const solutionFeatureItems: SolutionFeatureItem[] = [
  {
    id: 1,
    icon: "✨",
    title: "Hệ thống Gamification",
    summary: "Thử thách, nhiệm vụ đa phương tiện tăng động lực khám phá.",
    details: [
      "Xây dựng chuỗi nhiệm vụ theo cấp độ để tạo động lực tiến bộ.",
      "Áp dụng điểm thưởng và huy hiệu cho hành vi học tập tích cực.",
      "Tăng mức độ gắn kết nhờ trải nghiệm học tập có phản hồi ngay.",
    ],
  },
  {
    id: 2,
    icon: "🤖",
    title: "AI Chatbot Trợ lý",
    summary: "Hỏi đáp cùng nhân vật lịch sử để hiểu sâu bối cảnh sự kiện.",
    details: [
      "Trợ lý đối thoại giúp người học đặt câu hỏi theo ngữ cảnh bài học.",
      "Câu trả lời được chuẩn hóa theo nguồn dữ liệu đã kiểm duyệt.",
      "Hỗ trợ mở rộng thảo luận và củng cố kiến thức sau trải nghiệm.",
    ],
  },
  {
    id: 3,
    icon: "🏛️",
    title: "Bảo tàng số cá nhân",
    summary: "Sưu tầm hiện vật từ mã QR tại thực địa.",
    details: [
      "Mỗi hiện vật số được lưu theo hồ sơ học tập của từng người dùng.",
      "Tạo động lực khám phá thực tế thông qua cơ chế sưu tầm có mục tiêu.",
      "Dữ liệu sưu tầm hỗ trợ giáo viên theo dõi tiến trình học sinh.",
    ],
  },
  {
    id: 4,
    icon: "⚙️",
    title: "Game CMS Linh hoạt",
    summary: "Quản lý tài nguyên và xây dựng màn chơi dễ dàng.",
    details: [
      "Cho phép tạo và chỉnh sửa kịch bản học tập theo từng chủ đề.",
      "Quản trị tập trung giúp cập nhật nội dung nhanh và nhất quán.",
      "Mở rộng dễ dàng khi thêm tuyến trải nghiệm hoặc bộ nội dung mới.",
    ],
  },
];

const qrItems: QrItem[] = [
  {
    id: 1,
    label: "APP(Android)",
    badge: "SCAN APP",
    title: "QR Ứng dụng Android",
    summary: "QR này dẫn tới bản trải nghiệm ứng dụng SEN trên thiết bị Android.",
    destination: "Trang tải và demo bản app Android",
    image: androidAppQr,
    details: [
      "Dùng camera hoặc ứng dụng quét mã QR để mở liên kết.",
      "Khuyến nghị quét bằng điện thoại Android để cài đặt nhanh.",
      "Có thể dùng để demo trực tiếp các tính năng chính của SEN.",
    ],
  },
  {
    id: 2,
    label: "WEBSITE",
    badge: "SCAN WEB",
    title: "QR Website Trải nghiệm",
    summary: "QR này dẫn đến website trải nghiệm của dự án SEN.",
    destination: "Landing page / website demo SEN",
    image: websiteQr,
    details: [
      "Phù hợp khi trình bày nhanh trên màn hình hoặc poster in.",
      "Cho phép người xem truy cập ngay nội dung giới thiệu và demo.",
      "Có thể chia sẻ rộng rãi trong sự kiện hoặc pitching day.",
    ],
  },
];

const roadmapStageCount = Math.max(roadmapStages.length, 1);
const roadmapContainerClassName = `poster-roadmap-container${
  roadmapStageCount <= 3 ? " poster-roadmap-container--few" : ""
}${roadmapStageCount >= 6 ? " poster-roadmap-container--many" : ""}`;
const roadmapContainerStyle = {
  ["--roadmap-columns" as string]: roadmapStageCount,
} as React.CSSProperties;

const topRowCount = teamMembers.length > 4 ? 3 : Math.ceil(teamMembers.length / 2);
const topRowTeamMembers = teamMembers.slice(0, topRowCount);
const bottomRowTeamMembers = teamMembers.slice(topRowCount);
const isTopRowThreeMembers = topRowTeamMembers.length === 3;
const isTopRowTwoMembers = topRowTeamMembers.length === 2;

const getMemberNameClass = (name: string) => {
  const compactNameLength = name.replace(/\s+/g, "").length;

  if (compactNameLength >= 16) {
    return "member-name member-name--xlong";
  }

  if (compactNameLength >= 12) {
    return "member-name member-name--long";
  }

  return "member-name";
};

const PosterPage: React.FC<PosterPageProps> = ({ standalone = false }) => {
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [selectedInsight, setSelectedInsight] = React.useState<InsightDetail | null>(null);
  const [selectedQr, setSelectedQr] = React.useState<QrItem | null>(null);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleMemberKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, member: TeamMember) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleMemberClick(member);
    }
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
  };

  const openQrDetail = (item: QrItem) => {
    setSelectedQr(item);
  };

  const closeQrModal = () => {
    setSelectedQr(null);
  };

  const openValueDetail = (item: ValuePropositionItem) => {
    setSelectedInsight({
      sectionLabel: "Value Proposition",
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const openProblemDetail = (item: ProblemItem) => {
    setSelectedInsight({
      sectionLabel: "Problem",
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const openBusinessDetail = (item: BusinessModelItem) => {
    setSelectedInsight({
      sectionLabel: "Business Model",
      title: item.title,
      summary: item.points.join(" • "),
      details: item.details,
    });
  };

  const openSolutionOverviewDetail = () => {
    setSelectedInsight({
      sectionLabel: "Solution",
      title: "Nền tảng kiến tạo trải nghiệm",
      summary: "Kết hợp game, AI và dữ liệu học liệu để biến kiến thức lịch sử thành trải nghiệm tương tác.",
      details: [
        "Trải nghiệm học tập kết hợp giữa nội dung lý thuyết và hoạt động tương tác.",
        "Liên thông giữa lớp học, bảo tàng số và điểm chạm thực địa.",
        "Tạo hệ sinh thái học tập có thể đo lường, mở rộng và cá nhân hóa.",
      ],
    });
  };

  const openSolutionFeatureDetail = (item: SolutionFeatureItem) => {
    setSelectedInsight({
      sectionLabel: "Solution",
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const closeInsightModal = () => {
    setSelectedInsight(null);
  };

  const handleInsightKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, openDetail: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail();
    }
  };

  const handleQrKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, item: QrItem) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openQrDetail(item);
    }
  };

  return (
    <div className={`poster-page-wrapper${standalone ? " poster-page-wrapper--standalone" : ""}`}>
      {!standalone && (
        <div className="heritage-decor-layer">
          <div className="bronze-drum-rotating"></div>
          <div className="lac-bird-drifting"></div>
          <div className="lotus-floating-1"></div>
          <div className="lotus-floating-2"></div>
        </div>
      )}

      <div className="poster-container-inner">
        {/* Internal Card Decorations */}
        <div className="poster-internal-bg">
          <div className="dot-pattern-overlay"></div>
          <div className="internal-drum">
            <img src={bronzeDrum} alt="" />
          </div>
          <div className="smoke-layer smoke-left">
            <img src={smokeLeft} alt="" />
          </div>
          <div className="smoke-layer smoke-right">
            <img src={smokeRight} alt="" />
          </div>
          <div className="flower-layer flower-1">
            <img src={lotus1} alt="" />
          </div>
          <div className="flower-layer flower-2">
            <img src={lotus2} alt="" />
          </div>
          <div className="flower-layer flower-3">
            <img src={lotus3} alt="" />
          </div>
        </div>

        <div className="sen-mascot-decor" aria-hidden="true">
          <div className="sen-mascot-stage">
            <Stage width={280} height={400} options={{ backgroundAlpha: 0 }} style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
              <SenChibi
                x={140}
                y={200}
                scale={0.16}
                visible={true}
                mouthState="smile"
                isTalking={false}
                eyeState="normal"
                gesture="normal"
                showCoat={true}
                showHat={true}
              />
            </Stage>
          </div>
        </div>
        <header className="poster-header">
          <div className="poster-hero-decor" aria-hidden="true">
            <img src={bronzeDrum} alt="" className="hero-drum hero-drum-1" />
            <img src={bronzeDrum} alt="" className="hero-drum hero-drum-2" />
            <img src={smokeLeft} alt="" className="hero-smoke hero-smoke-1" />
            <img src={lotus1} alt="" className="hero-lotus hero-lotus-1" />
            <img src={lotus2} alt="" className="hero-lotus hero-lotus-2" />
          </div>

          <div className="p-innovation-logo">
            <img src={PINNOVATION_LOGO} alt="P-INNOVATION" className="pitching-logo-img" />
            <img src={logoPng} alt="SEN Logo" className="sen-logo-img" />
          </div>
          <div className="poster-tagline">Kiến tạo trải nghiệm văn hóa, lịch sử bằng công nghệ</div>
        </header>

        <div className="poster-content-grid">
          {/* PROBLEM */}
          <section className="poster-section problem-section">
            <div className="poster-section-header">
              <h2>Problem (Vấn đề)</h2>
            </div>
            <div className="poster-problem-list">
              {problemItems.map((item, index) => (
                <div
                  key={item.id}
                  className="poster-problem-item poster-problem-item--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiet van de ${item.title}`}
                  onClick={() => openProblemDetail(item)}
                  onKeyDown={(event) => handleInsightKeyDown(event, () => openProblemDetail(item))}
                >
                  <div className="poster-number-icon">{index + 1}</div>
                  <div className="poster-item-text">
                    <b>{item.title}</b>
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* VALUE PROPOSITION */}
          <section className="poster-section value-proposition">
            <div className="poster-section-header">
              <h2>Value Proposition</h2>
            </div>
            <div className="poster-value-grid">
              {valuePropositionItems.map((item) => (
                <div
                  key={item.id}
                  className="poster-value-card poster-value-card--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiet ${item.title}`}
                  onClick={() => openValueDetail(item)}
                  onKeyDown={(event) => handleInsightKeyDown(event, () => openValueDetail(item))}
                >
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SOLUTION */}
          <section className="poster-section solution-section">
            <div className="poster-section-header">
              <h2>Solution (Giải pháp)</h2>
            </div>
            <div
              className="poster-mockup-placeholder poster-mockup-placeholder--interactive"
              role="button"
              tabIndex={0}
              aria-label="Xem chi tiet tong quan giai phap"
              onClick={openSolutionOverviewDetail}
              onKeyDown={(event) => handleInsightKeyDown(event, openSolutionOverviewDetail)}
            >
              <img src={backgroundFull} alt="SEN Game Mockup" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div className="mockup-text">Nền tảng kiến tạo trải nghiệm</div>
            </div>
            <div className="poster-feature-grid">
              {solutionFeatureItems.map((item) => (
                <div
                  key={item.id}
                  className="poster-feature-item poster-feature-item--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiet ${item.title}`}
                  onClick={() => openSolutionFeatureDetail(item)}
                  onKeyDown={(event) => handleInsightKeyDown(event, () => openSolutionFeatureDetail(item))}
                >
                  <div className="feature-icon">{item.icon}</div>
                  <div className="feature-content">
                    <h4>{item.title}</h4>
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BUSINESS MODEL */}
          <section className="poster-section business-model">
            <div className="poster-section-header">
              <h2>Business Model</h2>
            </div>
            <div className="poster-biz-grid">
              {businessModelItems.map((item) => (
                <div
                  key={item.id}
                  className="poster-biz-box poster-biz-box--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiet ${item.title}`}
                  onClick={() => openBusinessDetail(item)}
                  onKeyDown={(event) => handleInsightKeyDown(event, () => openBusinessDetail(item))}
                >
                  <h4>{item.title}</h4>
                  <ul>
                    {item.points.map((point, index) => (
                      <li key={`${item.id}-${index}`}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="poster-revenue-target">
              Mục tiêu 7 tỷ doanh thu sau 5 năm
            </div>
          </section>

          {/* ROADMAP */}
          <section className="poster-section roadmap-section">
            <div className="poster-section-header">
              <h2>Traction / Roadmap</h2>
            </div>
            <div className={roadmapContainerClassName} style={roadmapContainerStyle}>
              <div className="poster-roadmap-line"></div>
              <div className="poster-roadmap-steps">
                {roadmapStages.map((stage) => (
                  <div key={stage.id} className="roadmap-step">
                    <div className="step-node"></div>
                    <h5>{stage.phase}</h5>
                    <p>{stage.milestone}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section className="poster-section team-section">
            <div className="poster-section-header">
              <h2>Team</h2>
            </div>
            <div className="poster-team-grid">
              <div
                className={`poster-team-row${isTopRowThreeMembers ? " poster-team-row--raise-middle" : ""}${
                  isTopRowTwoMembers ? " poster-team-row--spread-two" : ""
                }`}
              >
                {topRowTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="poster-member"
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem thong tin thanh vien ${member.name}`}
                    onClick={() => handleMemberClick(member)}
                    onKeyDown={(event) => handleMemberKeyDown(event, member)}
                  >
                    <div className="member-avatar-placeholder">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="member-avatar-img" />
                      ) : (
                        <span className="member-avatar-initial">{member.name.trim().charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <h6 className={getMemberNameClass(member.name)}>{member.name}</h6>
                    <p>{member.role}</p>
                  </div>
                ))}
              </div>

              {bottomRowTeamMembers.length > 0 && (
                <div className="poster-team-row poster-team-row--bottom">
                  {bottomRowTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="poster-member"
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem thong tin thanh vien ${member.name}`}
                      onClick={() => handleMemberClick(member)}
                      onKeyDown={(event) => handleMemberKeyDown(event, member)}
                    >
                      <div className="member-avatar-placeholder">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="member-avatar-img" />
                        ) : (
                          <span className="member-avatar-initial">{member.name.trim().charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <h6 className={getMemberNameClass(member.name)}>{member.name}</h6>
                      <p>{member.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <footer className="poster-footer">
          <div className="poster-qr-area">
            <div className="qr-group-label">PITCH DECK / DEMO</div>

            <div className="qr-grid">
              {qrItems.map((item) => (
                <div
                  key={item.id}
                  className="qr-item qr-item--interactive"
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiet ma QR ${item.label}`}
                  onClick={() => openQrDetail(item)}
                  onKeyDown={(event) => handleQrKeyDown(event, item)}
                >
                  <div className="qr-placeholder">
                    <Image
                      src={item.image}
                      alt={item.title}
                      preview={false}
                      className="qr-placeholder-image"
                      width="100%"
                      height="100%"
                    />
                  </div>
                  <div className="qr-info">
                    <div className="qr-label">{item.label}</div>
                    <div className="scan-me-badge">{item.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="poster-impact-text">
            Nơi lịch sử không chỉ được ghi nhớ, mà được sống lại!
          </div>
        </footer>
      </div>

      <Modal
        title={selectedQr ? `QR Chi tiết - ${selectedQr.label}` : "QR Chi tiết"}
        open={Boolean(selectedQr)}
        onCancel={closeQrModal}
        footer={null}
        centered
        width={560}
      >
        {selectedQr && (
          <div style={{ display: "grid", rowGap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 180,
                  height: 180,
                  border: "2px solid #c5a065",
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#fff",
                  boxShadow: "2px 2px 0 rgba(197, 160, 101, 0.35)",
                }}
              >
                <Image
                  src={selectedQr.image}
                  alt={selectedQr.title}
                  width={180}
                  height={180}
                  preview={{ mask: "Xem QR lớn" }}
                  style={{ display: "block" }}
                />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#3f1e1e", marginBottom: 6 }}>{selectedQr.title}</div>
                <div style={{ fontSize: 14, color: "#6b4b3b", lineHeight: 1.45 }}>{selectedQr.summary}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#4b3a2a" }}>
                  <strong>Đích đến:</strong> {selectedQr.destination}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #f0e0c0", paddingTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8b1d1d", marginBottom: 8 }}>Thông tin sử dụng</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", rowGap: 6, color: "#4b3a2a", fontSize: 14 }}>
                {selectedQr.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={selectedInsight ? `${selectedInsight.sectionLabel} - Chi tiet` : "Chi tiet"}
        open={Boolean(selectedInsight)}
        onCancel={closeInsightModal}
        footer={null}
        centered
        width={620}
      >
        {selectedInsight && (
          <div style={{ display: "grid", rowGap: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#3f1e1e", marginBottom: 6 }}>{selectedInsight.title}</div>
              {selectedInsight.summary && (
                <div style={{ fontSize: 14, color: "#6b4b3b", lineHeight: 1.45 }}>{selectedInsight.summary}</div>
              )}
            </div>
            <div style={{ borderTop: "1px solid #f0e0c0", paddingTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8b1d1d", marginBottom: 8 }}>Thông tin chi tiết</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", rowGap: 6, color: "#4b3a2a", fontSize: 14 }}>
                {selectedInsight.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Thong tin thanh vien"
        open={Boolean(selectedMember)}
        onCancel={closeMemberModal}
        footer={null}
        centered
        width={560}
      >
        {selectedMember && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #c5a065",
                  flexShrink: 0,
                  background: "#f7f1e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#8b1d1d",
                  fontWeight: 700,
                  fontSize: 42,
                }}
              >
                {selectedMember.avatar ? (
                  <Image
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    width={136}
                    height={136}
                    preview={{ mask: "Xem anh lon" }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  selectedMember.name.trim().charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#3f1e1e" }}>{selectedMember.name}</div>
                <div style={{ fontSize: 15, color: "#8b1d1d", fontWeight: 600 }}>
                  {selectedMember.role || "Thanh vien du an"}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", rowGap: 8, fontSize: 14, color: "#4b3a2a" }}>
              <div>
                <strong>Bo phan:</strong> {selectedMember.department}
              </div>
              <div>
                <strong>Chuyen mon:</strong> {selectedMember.specialization}
              </div>
              <div>
                <strong>Lien he:</strong> {selectedMember.contact}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PosterPage;
