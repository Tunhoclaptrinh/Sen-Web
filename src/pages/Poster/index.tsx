import React from "react";
import { Stage } from "@pixi/react";
import { Image, Modal, Select } from "antd";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import "./styles.less";
import {
  AimOutlined,
  CommentOutlined,
  AppstoreAddOutlined,
  RocketOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import SenChibi from "@/components/SenChibi";

// Import brand assets
const logoPng = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo.png";
import PINNOVATION_LOGO from "./PITCHING_DAY.png";
const smokeLeft = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356055/sen_web/static/src/assets/images/background/smoke-left.png";
const smokeRight = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356059/sen_web/static/src/assets/images/background/smoke-right.png";
const lotus1 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356040/sen_web/static/src/assets/images/background/lotus-1.png";
const lotus2 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356043/sen_web/static/src/assets/images/background/lotus-2.png";
const lotus3 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356045/sen_web/static/src/assets/images/background/lotus-3.png";
const bronzeDrum = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356033/sen_web/static/src/assets/images/background/bronze-drum.png";

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
  icon?: string;
  details?: string[];
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
  defaultUrl: string;
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

type TeamDisplayMode = "sv-startup" | "p-innovation";

const toTranslatedArray = <T,>(value: unknown, fallback: T[]): T[] => {
  return Array.isArray(value) ? (value as T[]) : fallback;
};

const QR_FALLBACK_VALUE = "https://sen.vn";
const defaultPosterAppUrl = import.meta.env.VITE_POSTER_ANDROID_URL || "https://example.com/sen-android-app";
const defaultPosterWebsiteUrl = import.meta.env.VITE_POSTER_WEBSITE_URL || import.meta.env.VITE_SITE_URL || QR_FALLBACK_VALUE;
const imageProdModules = import.meta.glob("./ImageProd/**/*.{png,jpg,jpeg,webp,avif,gif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;
const defaultMockupImage = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774359072/sen_web/static/src/pages/Poster/ImageProd/Mockup.jpg";

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Nguyễn Văn Hiếu",
    role: "AI Engineer",
    avatar: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774357030/sen_web/static/src/pages/Poster/Photo/Hieu.jpg",
    department: "Công nghệ",
    specialization: "AI, tích hợp mô hình và tối ưu hội thoại",
    contact: "0917579522 | nguyenhieu32005@gmail.com",
  },
  {
    id: 2,
    name: "Nguyễn Tiến Tuấn",
    role: "Lead/Tech/Product",
    avatar: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774357064/sen_web/static/src/pages/Poster/Photo/Tuan.jpg",
    department: "Sản phẩm",
    specialization: "Dẫn dắt đội nhóm, định hướng sản phẩm, phát giao diện, kiến trúc hệ thống,...",
    contact: "0945650883 | tuannguyentien16@gmail.com",
  },
  {
    id: 3,
    name: "Trần Thành Duy",
    role: "Developer/Presenter",
    avatar: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356936/sen_web/static/src/pages/Poster/Photo/Duy.jpg",
    department: "Phát triển",
    specialization: "Vận hành, giao diện, demo sản phẩm và trình bày",
    contact: "0866028877 | dandythenubit@gmail.com",
  },
  {
    id: 4,
    name: "Phan Thị Thu Nguyệt",
    role: "Designer/Communications",
    avatar: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774357034/sen_web/static/src/pages/Poster/Photo/Nguyet.jpg",
    department: "Thiết kế",
    specialization: "UI/UX và truyền thông nội dung",
    contact: "0389829196 | phanthithunguyet628@gmail.com",
  },
  {
    id: 5,
    name: "Bùi Thị Yến",
    role: "Business/Marketing",
    department: "Kinh doanh",
    specialization: "Nghiệp vụ doanh nghiệp, phát triển đối tác và marketing",
    contact: "0389829196 | buiyen2004yen@gmail.com",
    avatar: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774357068/sen_web/static/src/pages/Poster/Photo/Yen.jpg",
  },
];

const problemItems: ProblemItem[] = [
  {
    id: 1,
    title: "Việc tìm hiểu văn hóa, lịch sử thiếu tương tác, trải nghiệm",
    summary:
      "Nội dung lịch sử trong trường học chủ yếu được truyền đạt qua lý thuyết, khiến học sinh khó hứng thú và ít chủ động khám phá.",
    details: [
      "Phương pháp học còn thiên về ghi nhớ, thiếu hoạt động trải nghiệm thực tế.",
      "Học sinh khó hình dung bối cảnh lịch sử khi chỉ tiếp cận qua sách và bài giảng.",
      "Động lực tự học giảm khi thiếu cơ chế tương tác và phản hồi liên tục.",
    ],
  },
  {
    id: 2,
    title: "Tiếp cận một chiều, hạn chế chủ động",
    summary: "Nội dung chủ yếu đi theo hình thức đọc - chép, khó tạo hứng thú lâu dài, Mức độ ghi nhớ giảm khi thiếu hoạt động tương tác và phản hồi trực tiếp.",
    details: [
      "Nội dung chủ yếu đi theo hình thức đọc - chép, khó tạo hứng thú lâu dài.",
      "Người học ít cơ hội gắn kiến thức với bối cảnh thực tế tại di tích, bảo tàng.",
      "Mức độ ghi nhớ giảm khi thiếu hoạt động tương tác và phản hồi trực tiếp.",
    ],
  },
  {
    id: 3,
    title: "Khoảng cách lý thuyết & thực tế",
    summary: "Học sinh ít có cơ hội kết nối kiến thức trong sách với các địa điểm lịch sử và văn hóa ngoài đời.",
    details: [
      "Hạn chế chủ động, Tìm hiểu di sản ngoài lớp học còn thấp, lịch sử trở thành môn học để thi hơn là để khám phá.",
      "Hoạt động học tập gắn với di sản ngoài lớp học còn chưa thường xuyên.",
      "Người học khó liên hệ bài học lịch sử với bối cảnh văn hóa tại địa phương.",
      "Kiến thức dễ rời rạc nếu thiếu trải nghiệm theo ngữ cảnh thực tế.",
    ],
  },
  {
    id: 4,
    title: "Chiêm ngưỡng thụ động tại bảo tàng, di tích",
    summary:
      "Nhiều bảo tàng và di tích vẫn chủ yếu trưng bày tĩnh, thiếu công nghệ tương tác để thu hút người trẻ.",
    details: [
      "Nhiều điểm tham quan chưa có cơ chế tương tác số để tăng mức độ nhập vai.",
      "Thiếu nhiệm vụ học tập tại chỗ để dẫn dắt người học khám phá có mục tiêu.",
      "Người trẻ khó duy trì hứng thú nếu trải nghiệm chỉ dừng ở quan sát thụ động.",
    ],
  },
];

const roadmapStages: RoadmapStage[] = [
  {
    id: 1,
    phase: "Q1/2026",
    milestone: "MVP & Thử nghiệm (PTIT)",
    icon: "target",
    details: [
      "Phát triển Minimum Viable Product với các tính năng cốt lõi.",
      "Tích hợp hệ sinh thái P-Coin tại PTIT (~1.000 người dùng).",
      "Đánh giá tính ổn định hệ thống và cơ chế game hóa ban đầu.",
    ],
  },
  {
    id: 2,
    phase: "Q2-Q3/2026",
    milestone: "Thí điểm & Phản hồi",
    icon: "feedback",
    details: [
      "Triển khai thí điểm tại THCS Lê Lợi và nhóm thanh niên.",
      "Quy mô thử nghiệm ~250 học sinh khối 6.",
      "Tối ưu hóa học liệu số dựa trên phản hồi thực tế.",
    ],
  },
  {
    id: 3,
    phase: "Q4/2026",
    milestone: "Mở rộng tính năng",
    icon: "expansion",
    details: [
      "Tích hợp xem hiện vật 3D tương tác.",
      "Hệ thống AI Q&A phản hồi theo ngữ cảnh lịch sử.",
      "Tính năng dịch đa ngôn ngữ và hệ thống thưởng P-Coin mở rộng.",
    ],
  },
  {
    id: 4,
    phase: "2027",
    milestone: "Ra mắt chính thức",
    icon: "launch",
    details: [
      "Phát hành ứng dụng chính thức trên đa nền tảng.",
      "Triển khai chiến dịch Marketing và truyền thông diện rộng.",
      "Thiết lập quan hệ đối tác B2B chiến lược với hệ thống trường học.",
    ],
  },
  {
    id: 5,
    phase: "2028+",
    milestone: "Quy mô B2C & Di sản",
    icon: "scaling",
    details: [
      "Mở rộng thị trường B2C cho người dùng tự do.",
      "Tích hợp sâu trải nghiệm số tại các bảo tàng và khu di tích.",
      "Cho phép người dùng đồng sáng tạo nội dung có kiểm duyệt.",
    ],
  },
];

const roadmapIconMap: Record<string, React.ReactNode> = {
  target: <AimOutlined />,
  feedback: <CommentOutlined />,
  expansion: <AppstoreAddOutlined />,
  launch: <RocketOutlined />,
  scaling: <GlobalOutlined />,
};

const valuePropositionItems: ValuePropositionItem[] = [
  {
    id: 1,
    title: "Nền tảng chuyên biệt tìm hiểu văn hóa",
    summary: "Dành riêng cho văn hóa, du lịch và giáo dục; tích hợp học liệu số + game hóa + AI hướng dẫn.",
    details: [
      "Chuyển từ học thuộc lòng sang học qua nhiệm vụ và thử thách.",
      "AI hỗ trợ đặt câu hỏi và phản hồi theo ngữ cảnh lịch sử.",
      "Nội dung số giúp học sinh chủ động khám phá theo tốc độ cá nhân.",
    ],
  },
  {
    id: 2,
    title: "Kết nối Thực - Số",
    summary: "Liên kết kiến thức (Qua mã QR + nhiệm vụ) với trải nghiệm tại bảo tàng và di tích, giúp hiểu lịch sử trong bối cảnh thực.",
    details: [
      "Kết nối bài học trên lớp với hoạt động tại bảo tàng và di tích.",
      "QR và nhiệm vụ tương tác tạo cầu nối giữa lý thuyết và thực hành.",
      "Giáo viên có thể tổ chức học tập theo dự án gắn với không gian di sản.",
    ],
  },
  {
    id: 3,
    title: "AI Nhân vật lịch sử",
    summary: "Phản hồi dựa trên dữ liệu nội bộ được kiểm duyệt, phản hồi dựa trên ngữ cảnh hiện tại có giới hạn phạm vi, tránh sai lệch thông tin lịch sử.",
    details: [
      "Dữ liệu trả lời được xây từ kho tri thức đã duyệt theo từng chủ điểm.",
      "Giữ phong cách đối thoại gần gũi nhưng vẫn đảm bảo chính xác nội dung.",
      "Có thể mở rộng thêm nhân vật theo các giai đoạn lịch sử khác nhau.",
    ],
  },
];

const businessModelItems: BusinessModelItem[] = [
  {
    id: 1,
    title: "Khách hàng mục tiêu",
    points: ["Trường học / Tổ chức giáo dục", "Bảo tàng, khu di tích, khu du lịch", "Du khách, cá nhân yêu thích văn hóa"],
    details: [
      "Sản phẩm phục vụ cả bối cảnh học tập trong trường và ngoài không gian di sản.",
      "Có thể triển khai theo lớp học, theo trường hoặc theo chương trình trải nghiệm.",
      "Mở rộng dần sang nhóm người học lịch sử tự nguyện ngoài nhà trường.",
    ],
  },
  {
    id: 2,
    title: "Nguồn doanh thu",
    points: ["Phí triển khai SaaS", "Bản quyền nội dung (game, học liệu, đánh giá,...)", "Hoa hồng từ cung cấp dịch vụ và tiếp thị"],
    details: [
      "Thu phí theo gói sử dụng nền tảng và số lượng người dùng.",
      "Khai thác doanh thu từ bản quyền học liệu và kịch bản lịch sử số.",
      "Kết hợp doanh thu chia sẻ từ các dịch vụ và trải nghiệm tại điểm đến.",
    ],
  },
  {
    id: 3,
    title: "Cấu trúc chi phí",
    points: [
      "Phát triển, vận hành nền tảng",
      "Xây dựng và kiểm duyệt nội dung (Game hóa và học liệu số)",
      "Marketing, Triển khai tại trường học, bảo tàng",
    ],
    details: [
      "Ưu tiên đầu tư cho công nghệ lõi, vận hành ổn định và bảo mật dữ liệu.",
      "Ngân sách nội dung tập trung vào chất lượng học liệu và kiểm duyệt lịch sử.",
      "Chi phí mở rộng thị trường gắn với thử nghiệm thực địa và tăng trưởng người dùng.",
    ],
  },
  {
    id: 4,
    title: "Đối tác then chốt",
    points: [
      "Trường học, tổ chức giáo dục",
      "Giáo viên, chuyên gia lịch sử - giáo dục",
      "Bảo tàng, di tích và địa điểm văn hóa",
      "Đơn vị lữ hành"
    ],
    details: [
      "Đối tác công nghệ hỗ trợ triển khai hạ tầng và tích hợp hệ thống.",
      "Đối tác giáo dục đảm bảo sản phẩm phù hợp chương trình học thực tế.",
      "Đối tác văn hóa tạo điểm chạm trải nghiệm lịch sử ngoài lớp học.",
    ],
  },
];

const solutionFeatureItems: SolutionFeatureItem[] = [
  {
    id: 1,
    icon: "✨",
    title: "Gamified Learning",
    summary: "Thử thách, nhiệm vụ đa phương tiện tăng động lực khám phá văn hóa chủ động.",
    details: [
      "Thiết kế hành trình học theo cấp độ để duy trì động lực khám phá.",
      "Kết hợp điểm thưởng, huy hiệu và thử thách theo bối cảnh lịch sử.",
      "Tăng chủ động học tập nhờ cơ chế phản hồi tức thời sau mỗi nhiệm vụ.",
    ],
  },
  {
    id: 2,
    icon: "🤖",
    title: "AI Chatbot trợ lý",
    summary: "Hỏi đáp cùng AI/nhân vật lịch sử theo ngữ cảnh kiến thức để hiểu sâu bối cảnh sự kiện.",
    details: [
      "Người học có thể đặt câu hỏi tự nhiên theo từng mốc sự kiện.",
      "Câu trả lời dựa trên dữ liệu đã kiểm duyệt để đảm bảo độ tin cậy.",
      "Hỗ trợ đào sâu kiến thức thay vì chỉ ghi nhớ thông tin rời rạc.",
    ],
  },
  {
    id: 3,
    icon: "🏛️",
    title: "Bảo tàng số cá nhân",
    summary: "Sưu tầm hiện vật, checkin địa điểm từ mã QR tại thực địa.",
    details: [
      "Mỗi lượt quét QR mở ra hiện vật số, câu chuyện và nhiệm vụ tại chỗ.",
      "Dữ liệu trải nghiệm được lưu thành hồ sơ học tập cá nhân.",
      "Giúp học sinh kết nối kiến thức trong sách với bối cảnh lịch sử ngoài đời.",
    ],
  },
  {
    id: 4,
    icon: "⚙️",
    title: "CMS xây dựng nội dung",
    summary: "Quản lý tài nguyên và xây dựng màn chơi dễ dàng, có kiểm duyệt.",
    details: [
      "Cho phép tạo và cập nhật bài học, kịch bản nhiệm vụ theo từng chủ đề.",
      "Tích hợp quy trình kiểm duyệt để đảm bảo chất lượng học liệu.",
      "Giúp mở rộng nội dung nhanh khi triển khai tại nhiều trường và di tích.",
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
    defaultUrl: defaultPosterAppUrl,
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
    defaultUrl: defaultPosterWebsiteUrl,
    details: [
      "Phù hợp khi trình bày nhanh trên màn hình hoặc poster in.",
      "Cho phép người xem truy cập ngay nội dung giới thiệu và demo.",
      "Có thể chia sẻ rộng rãi trong sự kiện hoặc pitching day.",
    ],
  },
  {
    id: 3,
    label: "FANPAGE",
    badge: "SCAN FB",
    title: "QR Fanpage SEN",
    summary: "QR này dẫn tới fanpage chính thức của SEN trên Facebook.",
    destination: "Fanpage SEN trên Facebook",
    defaultUrl: "https://www.facebook.com/profile.php?id=61586454543352",
    details: [
      "Quét QR để mở fanpage trực tiếp trên trình duyệt hoặc ứng dụng Facebook.",
      "Phù hợp để người xem theo dõi thông tin cập nhật của dự án.",
      "Có thể dùng trong poster, slide và tài liệu truyền thông.",
    ],
  },
];

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
  const { t } = useTranslation();

  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [selectedInsight, setSelectedInsight] = React.useState<InsightDetail | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = React.useState<RoadmapStage | null>(null);
  const [selectedQr, setSelectedQr] = React.useState<QrItem | null>(null);
  const [teamDisplayMode, setTeamDisplayMode] = React.useState<TeamDisplayMode>("sv-startup");
  const [isMockupPreviewOpen, setIsMockupPreviewOpen] = React.useState(false);
  const [mockupPreviewIndex, setMockupPreviewIndex] = React.useState(0);

  const localizedProblemItems = React.useMemo(
    () => toTranslatedArray<ProblemItem>(t("poster.problemItems", { returnObjects: true }), problemItems),
    [t]
  );

  const localizedRoadmapStages = React.useMemo(
    () => toTranslatedArray<RoadmapStage>(t("poster.roadmapStages", { returnObjects: true }), roadmapStages),
    [t]
  );

  const localizedValuePropositionItems = React.useMemo(
    () =>
      toTranslatedArray<ValuePropositionItem>(
        t("poster.valuePropositionItems", { returnObjects: true }),
        valuePropositionItems
      ),
    [t]
  );

  const localizedBusinessModelItems = React.useMemo(
    () =>
      toTranslatedArray<BusinessModelItem>(
        t("poster.businessModelItems", { returnObjects: true }),
        businessModelItems
      ),
    [t]
  );

  const localizedSolutionFeatureItems = React.useMemo(
    () =>
      toTranslatedArray<SolutionFeatureItem>(
        t("poster.solutionFeatureItems", { returnObjects: true }),
        solutionFeatureItems
      ),
    [t]
  );

  const translatedQrItems = React.useMemo(
    () => toTranslatedArray<Partial<QrItem>>(t("poster.qrItems", { returnObjects: true }), []),
    [t]
  );

  const localizedQrItems = React.useMemo(
    () =>
      qrItems.map((item, index) => ({
        ...item,
        ...(translatedQrItems[index] || {}),
        defaultUrl: item.defaultUrl,
      })),
    [translatedQrItems]
  );

  const visibleTeamMembers = React.useMemo(
    () => (teamDisplayMode === "p-innovation" ? teamMembers.filter((member) => member.id !== 5) : teamMembers),
    [teamDisplayMode]
  );

  const topRowCount = visibleTeamMembers.length > 4 ? 3 : Math.ceil(visibleTeamMembers.length / 2);
  const topRowTeamMembers = visibleTeamMembers.slice(0, topRowCount);
  const bottomRowTeamMembers = visibleTeamMembers.slice(topRowCount);
  const isTopRowThreeMembers = topRowTeamMembers.length === 3;
  const isTopRowTwoMembers = topRowTeamMembers.length === 2;
  const shouldShowPinovationLogo = teamDisplayMode === "p-innovation";

  const mockupGalleryEntries = React.useMemo(() => {
    const sortedEntries = Object.entries(imageProdModules).sort(([pathA], [pathB]) => pathA.localeCompare(pathB));

    if (sortedEntries.length === 0) {
      return [{ path: "./ImageProd/Mockup.webp", url: defaultMockupImage }];
    }

    return sortedEntries.map(([path, url]) => ({ path, url }));
  }, []);

  const mockupDefaultIndex = React.useMemo(() => {
    const exactRootMockupIndex = mockupGalleryEntries.findIndex(({ path }) => path === "./ImageProd/Mockup.webp");
    if (exactRootMockupIndex >= 0) {
      return exactRootMockupIndex;
    }

    const mockupByNameIndex = mockupGalleryEntries.findIndex(({ path }) =>
      /\/mockup\.(png|jpe?g|webp|avif|gif)$/i.test(path.replace(/\\/g, "/"))
    );

    return mockupByNameIndex >= 0 ? mockupByNameIndex : 0;
  }, [mockupGalleryEntries]);

  const mockupGalleryImages = React.useMemo(
    () => mockupGalleryEntries.map(({ url }) => url),
    [mockupGalleryEntries]
  );

  const mockupCoverImage = mockupGalleryEntries[mockupDefaultIndex]?.url || defaultMockupImage;

  const roadmapStageCount = Math.max(localizedRoadmapStages.length, 1);
  const roadmapContainerClassName = `poster-roadmap-container${
    roadmapStageCount <= 3 ? " poster-roadmap-container--few" : ""
  }${roadmapStageCount >= 6 ? " poster-roadmap-container--many" : ""}`;
  const roadmapContainerStyle = {
    ["--roadmap-columns" as string]: roadmapStageCount,
  } as React.CSSProperties;

  React.useEffect(() => {
    if (!selectedQr) {
      return;
    }

    const matchedItem = localizedQrItems.find((item) => item.id === selectedQr.id);
    if (matchedItem) {
      setSelectedQr(matchedItem);
    }
  }, [localizedQrItems, selectedQr]);

  const normalizeQrLink = (rawValue: string) => {
    const trimmedValue = rawValue.trim();

    if (!trimmedValue) {
      return "";
    }

    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmedValue)) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  };

  const getQrCodeValue = (item: QrItem) => normalizeQrLink(item.defaultUrl) || QR_FALLBACK_VALUE;

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
      sectionLabel: t("poster.labels.sectionValueProposition", { defaultValue: "Value Proposition" }),
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const openProblemDetail = (item: ProblemItem) => {
    setSelectedInsight({
      sectionLabel: t("poster.labels.sectionProblem", { defaultValue: "Problem" }),
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const openBusinessDetail = (item: BusinessModelItem) => {
    setSelectedInsight({
      sectionLabel: t("poster.labels.sectionBusinessModel", { defaultValue: "Business Model" }),
      title: item.title,
      summary: item.points.join(" • "),
      details: item.details,
    });
  };

  const openRoadmapDetail = (item: RoadmapStage) => {
    setSelectedRoadmap(item);
  };

  const openSolutionOverviewDetail = () => {
    setMockupPreviewIndex(mockupDefaultIndex);
    setIsMockupPreviewOpen(true);
  };

  const openSolutionFeatureDetail = (item: SolutionFeatureItem) => {
    setSelectedInsight({
      sectionLabel: t("poster.labels.sectionSolution", { defaultValue: "Solution" }),
      title: item.title,
      summary: item.summary,
      details: item.details,
    });
  };

  const closeInsightModal = () => {
    setSelectedInsight(null);
  };

  const closeRoadmapModal = () => {
    setSelectedRoadmap(null);
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
            {shouldShowPinovationLogo && <img src={PINNOVATION_LOGO} alt="P-INNOVATION" className="pitching-logo-img" />}
            <img src={logoPng} alt="SEN Logo" className="sen-logo-img" />
          </div>
          <div className="poster-tagline">{t("poster.tagline", { defaultValue: "Kiến tạo trải nghiệm văn hóa, lịch sử bằng công nghệ" })}</div>
        </header>

        <div className="poster-content-grid">
          {/* PROBLEM */}
          <section className="poster-section problem-section">
            <div className="poster-section-header">
              <h2>{t("poster.sections.problem", { defaultValue: "Problem" })}</h2>
            </div>
            <div className="poster-problem-list">
              {localizedProblemItems.map((item, index) => (
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
              <h2>{t("poster.sections.valueProposition", { defaultValue: "Value Proposition" })}</h2>
            </div>
            <div className="poster-value-grid">
              {localizedValuePropositionItems.map((item) => (
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
              <h2>{t("poster.sections.solution", { defaultValue: "Solution" })}</h2>
            </div>
            <div
              className="poster-mockup-placeholder poster-mockup-placeholder--interactive"
              role="button"
              tabIndex={0}
              aria-label="Xem bo anh mockup"
              onClick={openSolutionOverviewDetail}
              onKeyDown={(event) => handleInsightKeyDown(event, openSolutionOverviewDetail)}
            >
              <img src={mockupCoverImage} alt="SEN Game Mockup" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* <div className="mockup-text">Nền tảng kiến tạo trải nghiệm</div> */}
            </div>
            <div className="poster-feature-grid">
              {localizedSolutionFeatureItems.map((item) => (
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
              <h2>{t("poster.sections.businessModel", { defaultValue: "Business Model" })}</h2>
            </div>
            <div className="poster-biz-grid">
              {localizedBusinessModelItems.map((item) => (
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
              {t("poster.revenueTarget", { defaultValue: "Hòa vốn năm thứ 3, doanh thu 7 tỷ đồng năm thứ 5." })}
            </div>
          </section>

          {/* ROADMAP */}
          <section className="poster-section roadmap-section">
            <div className="poster-section-header">
              <h2>{t("poster.sections.roadmap", { defaultValue: "Traction / Roadmap" })}</h2>
            </div>
            <div className={roadmapContainerClassName} style={roadmapContainerStyle}>
              <div className="poster-roadmap-line"></div>
              <div className="poster-roadmap-steps">
                {localizedRoadmapStages.map((stage, index) => {
                  const isBottom = index % 2 !== 0; // Odd index means Phase+Icon is on the bottom
                  return (
                    <div
                      key={stage.id}
                      className={`roadmap-step roadmap-step--interactive ${isBottom ? "roadmap-step--bottom" : "roadmap-step--top"}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Xem chi tiet lo trinh ${stage.phase}`}
                      onClick={() => openRoadmapDetail(stage)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openRoadmapDetail(stage);
                        }
                      }}
                    >
                      {/* TOP TIER */}
                      <div className="step-content-above">
                        {!isBottom ? (
                          <div className="step-content-inner">
                            <div className="roadmap-icon-box">{stage.icon ? roadmapIconMap[stage.icon] : null}</div>
                            <div className="step-phase-text">{stage.phase}</div>
                          </div>
                        ) : (
                          <div className="step-content-inner step-text-container">
                            {stage.details && stage.details.length > 0 && (
                              <p className="step-milestone-desc">{stage.details[0]}</p>
                            )}
                            <h5 className="step-milestone-title">{stage.milestone}</h5>
                          </div>
                        )}
                      </div>

                      {/* MIDDLE TIER */}
                      <div className="step-node-wrapper">
                        <div className="step-node"></div>
                      </div>

                      {/* BOTTOM TIER */}
                      <div className="step-content-below">
                        {!isBottom ? (
                          <div className="step-content-inner step-text-container">
                            <h5 className="step-milestone-title">{stage.milestone}</h5>
                            {stage.details && stage.details.length > 0 && (
                              <p className="step-milestone-desc">{stage.details[0]}</p>
                            )}
                          </div>
                        ) : (
                          <div className="step-content-inner">
                            <div className="step-phase-text">{stage.phase}</div>
                            <div className="roadmap-icon-box">{stage.icon ? roadmapIconMap[stage.icon] : null}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section className="poster-section team-section">
            <div className="poster-section-header poster-section-header--team">
              <h2>{t("poster.sections.team", { defaultValue: "Team" })}</h2>
              <Select
                size="small"
                className="poster-team-mode-select"
                value={teamDisplayMode}
                onChange={(value: TeamDisplayMode) => setTeamDisplayMode(value)}
                options={[
                  { value: "sv-startup", label: "SV Startup" },
                  { value: "p-innovation", label: "P-Innovation" },
                ]}
                style={{ width: 93 }}
              />
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
            <div className="qr-group-label">{t("poster.footer.qrGroupLabel", { defaultValue: "PITCH DECK / DEMO" })}</div>

            <div className="qr-grid">
              {localizedQrItems.map((item) => (
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
                    <QRCodeSVG
                      value={getQrCodeValue(item)}
                      size={56}
                      level="M"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#111111"
                      className="qr-code-svg"
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
            {t("poster.footer.impactText", { defaultValue: "Nơi lịch sử không chỉ được ghi nhớ, mà được sống lại!" })}
          </div>
        </footer>

        <div style={{ width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
          <Image.PreviewGroup
            preview={{
              visible: isMockupPreviewOpen,
              current: mockupPreviewIndex,
              onVisibleChange: (visible) => setIsMockupPreviewOpen(visible),
              onChange: (current) => setMockupPreviewIndex(current),
            }}
          >
            {mockupGalleryImages.map((imageSrc, index) => (
              <Image key={imageSrc} src={imageSrc} alt={`mockup-${index + 1}`} />
            ))}
          </Image.PreviewGroup>
        </div>
      </div>

      <Modal
        title={
          selectedQr
            ? `${t("poster.modal.qrTitlePrefix", { defaultValue: "QR Chi tiết" })} - ${selectedQr.label}`
            : t("poster.modal.qrTitle", { defaultValue: "QR Chi tiết" })
        }
        open={Boolean(selectedQr)}
        onCancel={closeQrModal}
        footer={null}
        centered
        width={720}
      >
        {selectedQr && (
          <div style={{ display: "grid", rowGap: 14 }}>
            <div style={{ display: "grid", justifyItems: "center", rowGap: 12 }}>
              <div
                style={{
                  width: 320,
                  height: 320,
                  border: "2px solid #c5a065",
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#fff",
                  boxShadow: "2px 2px 0 rgba(197, 160, 101, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <QRCodeSVG
                  value={getQrCodeValue(selectedQr)}
                  size={288}
                  level="M"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#111111"
                  className="qr-code-svg"
                />
              </div>
              <div style={{ minWidth: 0, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#3f1e1e", marginBottom: 6 }}>{selectedQr.title}</div>
                <div style={{ fontSize: 14, color: "#6b4b3b", lineHeight: 1.45 }}>{selectedQr.summary}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#4b3a2a" }}>
                  <strong>{t("poster.modal.destinationLabel", { defaultValue: "Đích đến" })}:</strong> {getQrCodeValue(selectedQr)}
                </div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #f0e0c0", paddingTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8b1d1d", marginBottom: 8 }}>
                {t("poster.modal.usageTitle", { defaultValue: "Thông tin sử dụng" })}
              </div>
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
        title={
          selectedInsight
            ? `${selectedInsight.sectionLabel} - ${t("poster.modal.detailTitle", { defaultValue: "Chi tiết" })}`
            : t("poster.modal.detailTitle", { defaultValue: "Chi tiết" })
        }
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
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8b1d1d", marginBottom: 8 }}>
                {t("poster.modal.detailInfoTitle", { defaultValue: "Thông tin chi tiết" })}
              </div>
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
        title={t("poster.modal.memberTitle", { defaultValue: "Thông tin thành viên" })}
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
                    preview={{ mask: t("poster.modal.avatarPreviewMask", { defaultValue: "Xem ảnh lớn" }) }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  selectedMember.name.trim().charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#3f1e1e" }}>{selectedMember.name}</div>
                <div style={{ fontSize: 15, color: "#8b1d1d", fontWeight: 600 }}>
                  {selectedMember.role || t("poster.modal.memberFallbackRole", { defaultValue: "Thành viên dự án" })}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", rowGap: 8, fontSize: 14, color: "#4b3a2a" }}>
              <div>
                <strong>{t("poster.modal.specializationLabel", { defaultValue: "Chuyên môn" })}:</strong> {selectedMember.specialization}
              </div>
              <div>
                <strong>{t("poster.modal.contactLabel", { defaultValue: "Liên hệ" })}:</strong> {selectedMember.contact}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={`${t("poster.sections.roadmap", { defaultValue: "Traction / Roadmap" })} - ${t("poster.modal.detailTitle", {
          defaultValue: "Chi tiết",
        })}`}
        open={Boolean(selectedRoadmap)}
        onCancel={closeRoadmapModal}
        footer={null}
        centered
        width={620}
      >
        {selectedRoadmap && (
          <div style={{ display: "grid", rowGap: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#3f1e1e", marginBottom: 6 }}>
                {selectedRoadmap.milestone}
              </div>
              <div style={{ fontSize: 14, color: "#8b1d1d", fontWeight: 700, textTransform: "uppercase" }}>
                {selectedRoadmap.phase}
              </div>
            </div>
            {selectedRoadmap.details && selectedRoadmap.details.length > 0 && (
              <div style={{ borderTop: "1px solid #f0e0c0", paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#8b1d1d", marginBottom: 8 }}>
                  {t("poster.modal.detailInfoTitle", { defaultValue: "Thông tin chi tiết" })}
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", rowGap: 8, color: "#4b3a2a", fontSize: 14 }}>
                  {selectedRoadmap.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PosterPage;
