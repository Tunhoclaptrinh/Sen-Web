import React, {useEffect, useState, useRef} from "react";
import {Typography, Spin, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {EnvironmentOutlined, BankOutlined, SketchOutlined} from "@ant-design/icons";
import {ITEM_TYPES} from "@/config/constants";
import heritageServiceReal from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import SimpleMap from "@/components/Map/SimpleMap";
import "./HomeGame.less";
import vnMapDataUrl from "/mapdata/vn-all.geo.json?url";

const {Title, Paragraph} = Typography;

const HomeMapSection: React.FC = () => {
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const fetchWithTimeout = async (url: string, timeoutMs: number) => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

        try {
          return await fetch(url, {signal: controller.signal});
        } finally {
          window.clearTimeout(timeoutId);
        }
      };

      // Fetch Vietnam Map Data FIRST to ensure core functionality
      let mapRes: Response | null = null;
      try {
        mapRes = await fetchWithTimeout(
          "https://code.highcharts.com/mapdata/countries/vn/vn-all.geo.json",
          5000,
        );
      } catch (error) {
        console.warn("CDN map fetch failed, fallback to local", error);
      }

      let mapJson: any = null;
      if (mapRes && mapRes.ok) {
        mapJson = await mapRes.json();
      }

      if (!mapJson || !Array.isArray(mapJson.features) || mapJson.features.length === 0) {
        mapJson = await fetch(vnMapDataUrl).then((res) => res.json());
      }
      setMapData(mapJson);

      // Fetch World Data for background (Custom filtered for SEA)
      try {
        const worldRes = await fetch("https://code.highcharts.com/mapdata/custom/world.geo.json");
        const worldJson = await worldRes.json();

          // Filter for SEA and neighbors: China, Laos, Cambodia, Thailand, Philippines, Malaysia, Indonesia, etc.
        const neighborCodes = ["CN", "LA", "KH", "TH", "MM", "MY", "SG", "ID", "PH", "BN", "TW", "HK", "JP", "IN"];
        const filteredFeatures = worldJson.features.filter(
          (f: any) =>
            neighborCodes.includes(f.properties["iso-a2"]) || neighborCodes.includes(f.properties["iso-a2-nice"]),
        );

        setWorldData({
          ...worldJson,
          features: filteredFeatures,
        });
      } catch (e) {
        console.warn("Failed to load background map", e);
      }

      // Fetch Heritage Locations
      const locRes = await heritageServiceReal.getLocations();
      let locs: any[] = [];
      if (locRes.success && locRes.data) {
        locs = locRes.data;
        setLocations(locs);
      }

      // Fetch Artifacts
      const artRes = await artifactService.getAll();
      if (artRes.success && artRes.data) {
          // Map artifacts to locations
        const mappedArtifacts = artRes.data
          .map((art: any) => {
            const site = locs.find((s: any) => s.id === art.heritageSiteId);
            if (site && site.lat && site.lng) {
              return {
                ...art,
                lat: site.lat + (Math.random() - 0.5) * 0.05,
                lng: site.lng + (Math.random() - 0.5) * 0.05,
                siteName: site.name,
                itemType: ITEM_TYPES.ARTIFACT,
              };
            }
            return null;
          })
          .filter((item: any) => item !== null);
        setArtifacts(mappedArtifacts);
      }
      } catch (error) {
        console.error("Error loading map data:", error);
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, []);

  // Fullscreen handlers
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle map click to enter fullscreen
  const handleMapClick = () => {
    if (!isFullscreen) {
      handleFullscreenToggle();
    }
  };

  return (
    <section className="home-game-section">
      {/* Custom Styles for Blurred Background */}
      <style>{`
        .faded-world-map {
            filter: blur(2px);
            opacity: 0.5;
            pointer-events: none;
        }
      `}</style>

      {/* Full width container for "To hẳn ra" effect */}
      <div style={{maxWidth: 1400, margin: "0 auto", padding: "100px 80px 80px"}}>
        <div style={{marginBottom: 80, textAlign: "center"}}>
          <span
            className="home-game-sub-header"
            style={{color: "var(--gold-color)", fontFamily: "var(--font-serif)", fontWeight: 700, marginBottom: 20}}
          >
            Bản đồ Văn hóa
          </span>
          <Title
            level={2}
            className="home-game-section-title"
            style={{
              color: "#ffffff",
              fontFamily: "var(--font-serif)",
              textTransform: "uppercase",
              fontSize: 56,
              marginBottom: 24,
              lineHeight: 1.25,
            }}
          >
            Khám phá <span style={{color: "var(--gold-color)"}}>Di sản</span> &{" "}
            <span style={{color: "var(--gold-color)"}}>Hiện vật</span>
          </Title>
          <Paragraph
            className="home-game-section-subtitle"
            style={{color: "rgba(255, 255, 255, 0.7)", margin: "0 auto", maxWidth: 740, lineHeight: 1.8, fontSize: 17}}
          >
            Hành trình trực quan dọc theo chiều dài đất nước. Tìm kiếm các địa danh lịch sử và bảo vật quốc gia ngay
            trên bản đồ.
          </Paragraph>
        </div>

        <div
          ref={containerRef}
          style={{
            height: isFullscreen ? "100vh" : 800,
            width: isFullscreen ? "100vw" : "100%",
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 0 : "auto",
            left: isFullscreen ? 0 : "auto",
            zIndex: isFullscreen ? 9999 : 1,
            borderRadius: isFullscreen ? 0 : 8,
            overflow: "hidden",
            boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
            border: "1px solid #e0c097",
            background: "#fff",
            cursor: isFullscreen ? "default" : "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {/* Corner Decorations */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              width: 40,
              height: 40,
              borderTop: "2px solid var(--gold-color)",
              borderLeft: "2px solid var(--gold-color)",
              borderTopLeftRadius: 8,
              zIndex: 1000,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              borderTop: "2px solid var(--gold-color)",
              borderRight: "2px solid var(--gold-color)",
              borderTopRightRadius: 8,
              zIndex: 1000,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              width: 40,
              height: 40,
              borderBottom: "2px solid var(--gold-color)",
              borderLeft: "2px solid var(--gold-color)",
              borderBottomLeftRadius: 8,
              zIndex: 1000,
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              width: 40,
              height: 40,
              borderBottom: "2px solid var(--gold-color)",
              borderRight: "2px solid var(--gold-color)",
              borderBottomRightRadius: 8,
              zIndex: 1000,
            }}
          ></div>

          {loading || !mapData ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                background: "#fdf6e3",
              }}
            >
              <Spin size="large" tip="Đang tải bản đồ..." />
            </div>
          ) : (
            <SimpleMap
              mapData={mapData}
              worldData={worldData}
              locations={locations}
              artifacts={artifacts}
              isFullscreen={isFullscreen}
              allowZoom={isFullscreen}
              height={isFullscreen ? "100vh" : 800}
              onMapClick={handleMapClick}
            />
          )}

          {/* Hint text when not fullscreen */}
          {!isFullscreen && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: 120,
                zIndex: 100,
                background: "rgba(217, 54, 62, 0.15)",
                color: "#8b1d1d",
                padding: "10px 20px",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid rgba(217, 54, 62, 0.3)",
                backdropFilter: "blur(4px)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              👆 Click vào bản đồ để xem toàn màn hình và zoom
            </div>
          )}

          {!isFullscreen && (
            <div style={{position: "absolute", top: 32, right: 80, zIndex: 100}}>
              <Button className="home-game-btn" onClick={() => navigate("/map")} icon={<EnvironmentOutlined />}>
                Khám phá toàn màn hình
              </Button>
            </div>
          )}

          {/* Exit fullscreen button */}
          {isFullscreen && (
            <div style={{position: "absolute", top: 32, right: 32, zIndex: 100}}>
              <Button
                className="home-game-btn"
                onClick={handleFullscreenToggle}
                icon={<EnvironmentOutlined />}
                style={{background: "#8b1d1d"}}
              >
                Thoát toàn màn hình (ESC)
              </Button>
            </div>
          )}

          {/* Game Style Stats Floating Card */}
          <div className="home-game-card home-map-stats-card" style={{top: 80, left: 60, zIndex: 1001}}>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--text-color-secondary)",
                fontSize: 18,
                fontWeight: 600,
                fontStyle: "italic",
                padding: "20px 0",
                letterSpacing: 0.5,
                textAlign: "center",
                background: "linear-gradient(to bottom, #fff9eb, #fffcf5)",
                borderBottom: "2px solid #c5a065",
              }}
            >
              Dữ liệu Văn hóa
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 0, padding: "32px 32px 36px 32px"}}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px 0",
                  borderBottom: "1px solid rgba(197, 160, 101, 0.25)",
                  gap: 24,
                }}
              >
                <div style={{display: "flex", alignItems: "center", gap: 14}}>
                  <span style={{fontSize: 26, color: "#d9363e", lineHeight: 1}}>
                    <BankOutlined />
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-color-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    DI TÍCH
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 42,
                    fontWeight: 700,
                    color: "var(--text-color-primary)",
                    lineHeight: 1,
                  }}
                >
                  {locations.filter((l) => l.itemType === ITEM_TYPES.HERITAGE || !l.itemType).length}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px 0",
                  borderBottom: "1px solid rgba(197, 160, 101, 0.25)",
                  gap: 24,
                }}
              >
                <div style={{display: "flex", alignItems: "center", gap: 14}}>
                  <span style={{fontSize: 26, color: "#faad14", lineHeight: 1}}>
                    <SketchOutlined />
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-color-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    HIỆN VẬT
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 42,
                    fontWeight: 700,
                    color: "var(--text-color-primary)",
                    lineHeight: 1,
                  }}
                >
                  {artifacts.length}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "24px 0 4px 0",
                  gap: 24,
                }}
              >
                <div style={{display: "flex", alignItems: "center", gap: 14}}>
                  <span style={{fontSize: 26, color: "#1890ff", lineHeight: 1}}>
                    <EnvironmentOutlined />
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--text-color-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    TỈNH THÀNH
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 42,
                    fontWeight: 700,
                    color: "var(--text-color-primary)",
                    lineHeight: 1,
                  }}
                >
                  63
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeMapSection;
