import React, {useEffect, useState, useRef} from "react";
import {Typography, Row, Col, Avatar, Button, Spin, Card, Space, Tag} from "antd";
import {UserOutlined, ArrowRightOutlined, CrownFilled} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import gameService from "@/services/game.service";
import {LeaderboardEntry} from "@/types/game.types";
import "./HomeGame.less";

const {Title, Text, Paragraph} = Typography;

const HomeLeaderboardSection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<"points" | "checkins" | "level">("points");
  const intervalRef = useRef<any>(null);

  const startAutoRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveCategory((prev) => {
        if (prev === "points") return "checkins";
        if (prev === "checkins") return "level";
        return "points";
      });
    }, 6000);
  };

  useEffect(() => {
    fetchData();
    startAutoRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await gameService.getLeaderboard(activeCategory, 5);
      if (res) {
        setTopPlayers(res);
      }
    } catch (error) {
      console.error("Failed to load top players", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: "points" | "checkins" | "level") => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    startAutoRotation(); // Reset timer on manual click
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#E0E0E0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#f0f0f0";
    }
  };

  const getCategoryInfo = () => {
    if (activeCategory === "points") {
      return {label: "Điểm số", unit: "điểm"};
    }
    if (activeCategory === "checkins") {
      return {label: "Check-in", unit: "lượt"};
    }
    return {label: "Cấp độ", unit: "Cấp"};
  };

  return (
    <section className="home-game-section">
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes slideUpFade {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-list {
            animation: slideUpFade 0.6s ease-out forwards;
          }
        `}
      </style>

      <div style={{maxWidth: 1400, margin: "0 auto", padding: "100px 80px 140px", position: "relative", zIndex: 1}}>
        {/* Heritage Corner Decorations (Double Line Style) */}
        {/* Top Left */}
        <div style={{position: "absolute", top: 40, left: 80, width: 60, height: 60, zIndex: 5}}>
          <div style={{position: "absolute", top: 0, left: 0, width: 40, height: 2, background: "var(--gold-color)"}} />
          <div style={{position: "absolute", top: 0, left: 0, width: 2, height: 40, background: "var(--gold-color)"}} />
          <div
            style={{position: "absolute", top: 6, left: 6, width: 24, height: 1, background: "rgba(250, 173, 20, 0.4)"}}
          />
          <div
            style={{position: "absolute", top: 6, left: 6, width: 1, height: 24, background: "rgba(250, 173, 20, 0.4)"}}
          />
        </div>
        {/* Top Right */}
        <div style={{position: "absolute", top: 40, right: 80, width: 60, height: 60, zIndex: 5}}>
          <div
            style={{position: "absolute", top: 0, right: 0, width: 40, height: 2, background: "var(--gold-color)"}}
          />
          <div
            style={{position: "absolute", top: 0, right: 0, width: 2, height: 40, background: "var(--gold-color)"}}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 24,
              height: 1,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 1,
              height: 24,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
        </div>
        {/* Bottom Left */}
        <div style={{position: "absolute", bottom: 80, left: 80, width: 60, height: 60, zIndex: 5}}>
          <div
            style={{position: "absolute", bottom: 0, left: 0, width: 40, height: 2, background: "var(--gold-color)"}}
          />
          <div
            style={{position: "absolute", bottom: 0, left: 0, width: 2, height: 40, background: "var(--gold-color)"}}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 6,
              width: 24,
              height: 1,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 6,
              width: 1,
              height: 24,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
        </div>
        {/* Bottom Right */}
        <div style={{position: "absolute", bottom: 80, right: 80, width: 60, height: 60, zIndex: 5}}>
          <div
            style={{position: "absolute", bottom: 0, right: 0, width: 40, height: 2, background: "var(--gold-color)"}}
          />
          <div
            style={{position: "absolute", bottom: 0, right: 0, width: 2, height: 40, background: "var(--gold-color)"}}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              width: 24,
              height: 1,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              width: 1,
              height: 24,
              background: "rgba(250, 173, 20, 0.4)",
            }}
          />
        </div>

        <Row align="middle" style={{width: "100%", position: "relative", zIndex: 2, margin: 0}}>
          <Col xs={24} lg={12} style={{paddingRight: 40}}>
            <div className="section-header" style={{textAlign: "left"}}>
              <div style={{display: "flex", alignItems: "center", gap: 14, marginBottom: 32}}>
                <CrownFilled style={{color: "var(--gold-color)", fontSize: 22}} />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: "uppercase",
                    letterSpacing: 4,
                    color: "var(--gold-color)",
                  }}
                >
                  Bảng vàng danh dự
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  textAlign: "left",
                  color: "#ffffff",
                  fontSize: 56,
                  fontWeight: 900,
                  marginBottom: 32,
                  lineHeight: 1.25,
                  textTransform: "uppercase",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  maxWidth: "100%",
                }}
              >
                Vinh danh <br />
                <span style={{color: "var(--gold-color)", textShadow: "0 2px 10px rgba(0,0,0,0.2)"}}>
                  Nhà thám hiểm
                </span>{" "}
                <br />
                xuất sắc
              </h2>

              <Paragraph
                style={{
                  textAlign: "left",
                  margin: "0 0 56px 0",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 17,
                  maxWidth: "100%",
                  fontWeight: 400,
                  lineHeight: 1.9,
                }}
              >
                Cùng chiêm ngưỡng những người chơi dẫn đầu trong hành trình khám phá di sản. Bạn có muốn tên mình được
                xướng lên tại đây? Tham gia ngay để tích điểm và leo hạng!
              </Paragraph>

              <Button
                className="home-game-btn"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/game/leaderboard")}
                style={{
                  height: 54,
                  padding: "0 34px",
                  fontWeight: 800,
                  background: "var(--gold-color)",
                  color: "var(--seal-red)",
                  border: "none",
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  boxShadow: "0 8px 0 rgba(197, 160, 101, 0.25)",
                }}
              >
                Khám phá Bảng xếp hạng
              </Button>
            </div>
          </Col>

          <Col xs={24} lg={12} style={{paddingLeft: 40, paddingTop: 48}}>
            <Card
              bordered={false}
              className="home-game-leaderboard-card"
              styles={{body: {padding: 0}}}
              style={{
                borderRadius: 12,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                overflow: "hidden",
                border: "none",
              }}
            >
              <div
                style={{
                  padding: "24px 32px",
                  background: "#fffcf5",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                  <Title level={4} style={{margin: 0, color: "var(--seal-red)", fontFamily: "var(--font-serif)"}}>
                    Top 5 Nhà Thám Hiểm
                  </Title>
                  <Tag
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontWeight: 700,
                      border: "none",
                      background: "var(--gold-color)",
                      padding: "4px 12px",
                      borderRadius: 4,
                    }}
                  >
                    THÁNG {new Date().getMonth() + 1}
                  </Tag>
                </div>

                {/* INTERACTIVE TABS */}
                <div style={{display: "flex", gap: 12}}>
                  <div
                    onClick={() => handleCategoryChange("points")}
                    style={{
                      cursor: "pointer",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.3s",
                      fontFamily: "var(--font-serif)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      background: activeCategory === "points" ? "var(--seal-red)" : "rgba(0,0,0,0.04)",
                      color: activeCategory === "points" ? "#fff" : "var(--text-color-secondary)",
                      boxShadow: activeCategory === "points" ? "0 4px 12px rgba(139, 29, 29, 0.2)" : "none",
                    }}
                  >
                    Điểm số
                  </div>
                  <div
                    onClick={() => handleCategoryChange("checkins")}
                    style={{
                      cursor: "pointer",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.3s",
                      fontFamily: "var(--font-serif)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      background: activeCategory === "checkins" ? "var(--seal-red)" : "rgba(0,0,0,0.04)",
                      color: activeCategory === "checkins" ? "#fff" : "var(--text-color-secondary)",
                      boxShadow: activeCategory === "checkins" ? "0 4px 12px rgba(139, 29, 29, 0.2)" : "none",
                    }}
                  >
                    Check-in
                  </div>
                  <div
                    onClick={() => handleCategoryChange("level")}
                    style={{
                      cursor: "pointer",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: 13,
                      fontWeight: 700,
                      transition: "all 0.3s",
                      fontFamily: "var(--font-serif)",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      background: activeCategory === "level" ? "var(--seal-red)" : "rgba(0,0,0,0.04)",
                      color: activeCategory === "level" ? "#fff" : "var(--text-color-secondary)",
                      boxShadow: activeCategory === "level" ? "0 4px 12px rgba(139, 29, 29, 0.2)" : "none",
                    }}
                  >
                    Cấp độ
                  </div>
                </div>
              </div>

              <div style={{minHeight: 440, background: "#fffcf5", position: "relative"}}>
                {loading ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 10,
                      background: "rgba(255, 252, 245, 0.6)",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    <Spin size="large" tip="Đang cập nhật..." style={{color: "#8c3b3b"}} />
                  </div>
                ) : null}

                <div className={`leaderboard-list ${!loading ? "animate-list" : ""}`}>
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.userId + activeCategory}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 32px",
                        borderBottom: index < topPlayers.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none",
                        transition: "all 0.3s",
                        background: "#fffcf5",
                      }}
                      className="leaderboard-item"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: getRankColor(index + 1),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: "800",
                          color: index + 1 <= 3 ? "#fff" : "#999",
                          marginRight: 20,
                          fontSize: 16,
                          boxShadow: index < 3 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                        }}
                      >
                        {index + 1}
                      </div>

                      <Avatar
                        src={player.userAvatar}
                        icon={<UserOutlined />}
                        size={48}
                        style={{
                          border: index === 0 ? "2px solid #FFD700" : "1px solid #ddd",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      />

                      <div style={{flex: 1, marginLeft: 16}}>
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                          <Text
                            strong
                            style={{fontSize: 16, color: "var(--text-color-primary)", fontFamily: "var(--font-sans)"}}
                          >
                            {player.userName}
                          </Text>
                          {index === 0 && <CrownFilled style={{color: "#FFD700", fontSize: 14}} />}
                        </div>
                        <Space size={4} style={{marginTop: 2}}>
                          <Tag
                            style={{
                              borderRadius: 4,
                              fontSize: 10,
                              margin: 0,
                              background: "rgba(0,0,0,0.04)",
                              border: "none",
                              color: "var(--text-color-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            LV.{player.level}
                          </Tag>
                        </Space>
                      </div>

                      <div style={{textAlign: "right"}}>
                        <Text
                          strong
                          style={{
                            fontSize: 18,
                            color: "var(--seal-red)",
                            display: "block",
                            lineHeight: 1,
                            fontWeight: 700,
                          }}
                        >
                          {(activeCategory === "points"
                            ? player.totalPoints
                            : activeCategory === "checkins"
                              ? player.checkinCount || 0
                              : player.level
                          ).toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{fontSize: 11, textTransform: "uppercase"}}>
                          {getCategoryInfo().unit}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeLeaderboardSection;
