import React from "react";
import "./styles.less";

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

// Import mascot assets
import mascotFace from "../../assets/images/SenChibi/face.png";
import mascotHat from "../../assets/images/SenChibi/hat.png";
import mascotHair from "../../assets/images/SenChibi/hair_font.png";
import mascotBody from "../../assets/images/SenChibi/clothers_ao_dai.png";

interface PosterPageProps {
  standalone?: boolean;
}

const PosterPage: React.FC<PosterPageProps> = ({ standalone = false }) => {
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

        <div className="sen-mascot-decor">
          <img src={mascotBody} alt="Sen Ao Dai" className="mascot-body" />
        </div>
        <header className="poster-header">
          <div className="poster-hero-decor" aria-hidden="true">
            <img src={bronzeDrum} alt="" className="hero-drum hero-drum-1" />
            <img src={bronzeDrum} alt="" className="hero-drum hero-drum-2" />
            <img src={smokeRight} alt="" className="hero-smoke hero-smoke-1" />
            <img src={lotus1} alt="" className="hero-lotus hero-lotus-1" />
            <img src={lotus2} alt="" className="hero-lotus hero-lotus-2" />
            <img src={lotus3} alt="" className="hero-lotus hero-lotus-3" />
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
              <div className="poster-problem-item">
                <div className="poster-number-icon">1</div>
                <div className="poster-item-text">
                  <b>Tiếp cận một chiều</b>
                  <p>Việc học chủ yếu dựa trên truyền đạt lý thuyết, thiếu cơ hội tương tác và trải nghiệm thực tế.</p>
                </div>
              </div>
              <div className="poster-problem-item">
                <div className="poster-number-icon">2</div>
                <div className="poster-item-text">
                  <b>Hạn chế chủ động</b>
                  <p>Tìm hiểu di sản ngoài lớp học còn thấp, lịch sử trở thành môn học &quot;để thi &quot; hơn là để khám phá.</p>
                </div>
              </div>
              <div className="poster-problem-item">
                <div className="poster-number-icon">3</div>
                <div className="poster-item-text">
                  <b>Khoảng cách lý thuyết & thực tế</b>
                  <p>Biết tên di tích nhưng chưa hiểu bối cảnh, ý nghĩa và giá trị trong đời sống hiện đại.</p>
                </div>
              </div>
            </div>
          </section>

          {/* VALUE PROPOSITION */}
          <section className="poster-section value-proposition">
            <div className="poster-section-header">
              <h2>Value Proposition</h2>
            </div>
            <div className="poster-value-grid">
              <div className="poster-value-card">
                <h3>Nền tảng chuyên biệt</h3>
                <p>Dành riêng cho văn hóa & du lịch, tích hợp học liệu số + game hóa + AI kiểm soát dữ liệu.</p>
              </div>
              <div className="poster-value-card">
                <h3>AI Nhân vật lịch sử</h3>
                <p>Phản hồi dựa trên dữ liệu nội bộ được kiểm duyệt, tránh sai lệch thông tin lịch sử.</p>
              </div>
              <div className="poster-value-card">
                <h3>Kết nối Thực - Số</h3>
                <p>Liên kết kiến thức lớp học với trải nghiệm trực tiếp tại bảo tàng, di tích qua mã QR & nhiệm vụ.</p>
              </div>
            </div>
          </section>

          {/* SOLUTION */}
          <section className="poster-section solution-section">
            <div className="poster-section-header">
              <h2>Solution (Giải pháp)</h2>
            </div>
            <div className="poster-mockup-placeholder">
              <img src={backgroundFull} alt="SEN Game Mockup" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
              <div className="mockup-text">Nền tảng kiến tạo trải nghiệm</div>
            </div>
            <div className="poster-feature-grid">
              <div className="poster-feature-item">
                <div className="feature-icon">✨</div>
                <div className="feature-content">
                  <h4>Hệ thống Gamification</h4>
                  <p>Thử thách, nhiệm vụ đa phương tiện tăng động lực khám phá.</p>
                </div>
              </div>
              <div className="poster-feature-item">
                <div className="feature-icon">🤖</div>
                <div className="feature-content">
                  <h4>AI Chatbot Trợ lý</h4>
                  <p>Hỏi đáp cùng nhân vật lịch sử để hiểu sâu bối cảnh sự kiện.</p>
                </div>
              </div>
              <div className="poster-feature-item">
                <div className="feature-icon">🏛️</div>
                <div className="feature-content">
                  <h4>Bảo tàng số cá nhân</h4>
                  <p>Sưu tầm hiện vật từ mã QR tại thực địa.</p>
                </div>
              </div>
              <div className="poster-feature-item">
                <div className="feature-icon">⚙️</div>
                <div className="feature-content">
                  <h4>Game CMS Linh hoạt</h4>
                  <p>Quản lý tài nguyên và xây dựng màn chơi dễ dàng.</p>
                </div>
              </div>
            </div>
          </section>

          {/* BUSINESS MODEL */}
          <section className="poster-section business-model">
            <div className="poster-section-header">
              <h2>Business Model</h2>
            </div>
            <div className="poster-biz-grid">
              <div className="poster-biz-box">
                <h4>Khách hàng mục tiêu</h4>
                <ul>
                  <li>Trường học & Phụ huynh</li>
                  <li>Học sinh THCS - THPT</li>
                  <li>Du khách văn hóa</li>
                </ul>
              </div>
              <div className="poster-biz-box">
                <h4>Nguồn doanh thu</h4>
                <ul>
                  <li>Phí triển khai SaaS</li>
                  <li>Bản quyền nội dung</li>
                  <li>Hoa hồng từ dịch vụ</li>
                </ul>
              </div>
              <div className="poster-biz-box">
                <h4>Cấu trúc chi phí</h4>
                <ul>
                  <li>Phát triển nền tảng</li>
                  <li>Sản xuất nội dung</li>
                  <li>Hạ tầng & Marketing</li>
                </ul>
              </div>
              <div className="poster-biz-box">
                <h4>Đối tác then chốt</h4>
                <ul>
                  <li>Bảo tàng, Khu di tích</li>
                  <li>Học viện PTIT</li>
                  <li>Đơn vị lữ hành</li>
                </ul>
              </div>
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
            <div className="poster-roadmap-container">
              <div className="poster-roadmap-line"></div>
              <div className="poster-roadmap-steps">
                <div className="roadmap-step">
                  <div className="step-node"></div>
                  <h5>GĐ 1 (6th)</h5>
                  <p>Kiểm chứng tại PTIT</p>
                </div>
                <div className="roadmap-step">
                  <div className="step-node"></div>
                  <h5>GĐ 2 (6th)</h5>
                  <p>Thí điểm tại THCS</p>
                </div>
                <div className="roadmap-step">
                  <div className="step-node"></div>
                  <h5>GĐ 3 (2n)</h5>
                  <p>Mở rộng B2B trường học</p>
                </div>
                <div className="roadmap-step">
                  <div className="step-node"></div>
                  <h5>GĐ 4 (2n)</h5>
                  <p>B2C & Du lịch văn hóa</p>
                </div>
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section className="poster-section team-section">
            <div className="poster-section-header">
              <h2>Team</h2>
            </div>
            <div className="poster-team-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="poster-member">
                  <div className="member-avatar-placeholder"></div>
                  <h6>Thành viên {i}</h6>
                  <p>Vai trò</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="poster-footer">
          <div className="poster-qr-area">
            <div className="qr-placeholder">
              <img src={logoPng} alt="QR" style={{ width: '80%', opacity: 0.5 }} />
            </div>
            <div className="qr-info">
              <div className="qr-label">PITCH DECK / DEMO</div>
              <div className="scan-me-badge">SCAN ME</div>
            </div>
          </div>
          <div className="poster-impact-text">
            Nơi lịch sử không chỉ được ghi nhớ, mà được sống lại!
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PosterPage;
