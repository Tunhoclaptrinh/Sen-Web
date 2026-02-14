import React, {useEffect, useState, useRef} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import {Typography, Spin, Button} from "antd";
import {useNavigate} from "react-router-dom";
import {EnvironmentOutlined, BankOutlined, SketchOutlined} from "@ant-design/icons";
import heritageServiceReal from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import proj4 from "proj4";
import "./HomeGame.less";

// Initialize proj4 for Highcharts
if (typeof window !== "undefined") {
  (window as any).proj4 = proj4;
}

// Initialize the map module
// Highcharts map module needs to be initialized with Highcharts
try {
  (highchartsMap as any)(Highcharts);
} catch (e) {
  console.error("Failed to initialize Highcharts Map module", e);
}

const {Title, Paragraph} = Typography;

const HomeMapSection: React.FC = () => {
  const navigate = useNavigate();
  const [mapData, setMapData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Vietnam Map Data FIRST to ensure core functionality
        const mapRes = await fetch("https://code.highcharts.com/mapdata/countries/vn/vn-all.geo.json");
        const mapJson = await mapRes.json();
        setMapData(mapJson);

        // Fetch World Data for background (Custom filtered for SEA)
        try {
          const worldRes = await fetch("https://code.highcharts.com/mapdata/custom/world.geo.json");
          const worldJson = await worldRes.json();

          // Filter for SEA and neighbors: China, Laos, Cambodia, Thailand, Philippines, Malaysia, Indonesia, etc.
          const neighborCodes = ["CN", "LA", "KH", "TH", "MM", "MY", "SG", "ID", "PH", "BN", "TW", "HK", "JP", "IN"];
          const filteredFeatures = worldJson.features.filter(
            (f: any) =>
              neighborCodes.includes(f.properties["iso-a2"]) || neighborCodes.includes(f.properties["iso-a2-nice"]), // Handle different property names
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
                  lat: site.lat + (Math.random() - 0.5) * 0.05, // Slight offset to not overlap perfectly
                  lng: site.lng + (Math.random() - 0.5) * 0.05,
                  siteName: site.name,
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
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
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

  // Reflow chart when fullscreen state changes
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        const chart = chartRef.current?.chart as any;
        if (chart) {
          chart.reflow();
          // Don't reset view - let the map maintain proper fit with padding
        }
      }, 100);
    }
  }, [isFullscreen]);

  const chartOptions: Highcharts.Options = {
    chart: {
      map: mapData,
      backgroundColor: "transparent",
      height: isFullscreen ? window.innerHeight : 800, // Use actual viewport height in fullscreen
      style: {
        fontFamily: "var(--font-sans)",
      },
    },
    title: {
      text: undefined,
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: "bottom",
        align: "right",
      },
      enableDoubleClickZoomTo: true,
      enableMouseWheelZoom: isFullscreen, // Only enable mouse wheel zoom in fullscreen
    },
    mapView: {
      padding: [80, 80, 80, 80], // Generous padding to ensure all territories (including archipelagos) are visible
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#d9363e",
      borderRadius: 8,
      borderWidth: 1,
      shadow: true,
      useHTML: true,
      padding: 0,
      formatter: function (this: any) {
        const p = this.point;
        const image = p.image || "";
        const hasImage = image && !image.includes("placeholder");

        // Default placeholder if needed, or just hide image area
        const imgHtml = hasImage
          ? `<div style="height: 160px; width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 12px; background: #f0f0f0;">
                <img src="${image}" style="width: 100%; height: 100%; object-fit: cover;"/>
               </div>`
          : "";

        return `
        <div style="width: 280px; padding: 16px;">
            ${imgHtml}
            <div style="font-family: var(--font-sans);">
                <b style="font-size: 16px; color: var(--text-color-primary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; line-height: 1.4;">${p.name}</b>
                <span style="font-size: 13px; color: var(--text-color-secondary); display: block; margin-bottom: 4px;">${p.province || p.siteName || ""}</span>
                <br/>
                <i style="font-size: 12px; color: var(--seal-red);">${p.series.name}</i>
            </div>
        </div>
        `;
      },
    },
    series: [
      {
        type: "map",
        name: "World",
        data: worldData,
        className: "faded-world-map", // Apply blur effect
        affectsMapView: false, // Don't let background dictate zoom
        borderColor: "#d0d0d0",
        nullColor: "#f0f0f0",
        color: "#f0f0f0",
        enableMouseTracking: false,
        borderWidth: 1,
        dataLabels: {enabled: false},
        states: {
          inactive: {opacity: 0.6}, // Prevent fading when hovering Vietnam
        },
      },
      {
        type: "map",
        name: "Vietnam",
        data: mapData,
        borderColor: "#d9363e",
        borderWidth: 1,
        color: "#fdf6e3", // Vintage paper color
        nullColor: "#fdf6e3",
        states: {
          hover: {
            color: "#ffe58f",
          },
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: "rgba(139, 69, 19, 0.5)", // Subtle brown for provinces
            fontWeight: "normal",
            textOutline: "none",
          },
        },
        tooltip: {
          headerFormat: "",
          pointFormat: "<b>{point.name}</b>",
        },
      },
      {
        type: "mappoint",
        name: "Di sản",
        color: "#d9363e",
        data: locations.map((loc) => ({
          name: loc.name,
          lat: loc.lat,
          lon: loc.lng,
          province: loc.province,
          id: loc.id,
          type: loc.type,
          image: loc.thumbnail || "/images/placeholder-heritage.jpg",
        })),
        marker: {
          symbol: "diamond",
          radius: 9,
          fillColor: "#d9363e",
          lineWidth: 2,
          lineColor: "#fff",
        },
        events: {
          click: function (e: any) {
            navigate(`/heritage-sites/${e.point.id}`);
          },
        },
      },
      {
        type: "mappoint",
        name: "Hiện vật",
        color: "#faad14", // Gold for artifacts
        data: artifacts.map((art) => ({
          name: art.name,
          lat: art.lat,
          lon: art.lng,
          siteName: art.siteName,
          id: art.id,
          type: "artifact",
          image: art.image || art.images?.[0] || "/images/placeholder-artifact.jpg",
        })),
        marker: {
          symbol: "diamond",
          radius: 9,
          fillColor: "#faad14",
          lineWidth: 2,
          lineColor: "#fff",
        },
        events: {
          click: function (e: any) {
            navigate(`/artifacts/${e.point.id}`);
          },
        },
      },
      {
        type: "mappoint",
        name: "Quần đảo Trường Sa",
        color: "#d9363e",
        data: [
          // Spratly Islands (Truong Sa) - Key features from North to South
          {name: "Song Tử Tây", lat: 11.43, lon: 114.33},
          {name: "Nam Yết", lat: 10.18, lon: 114.36},
          {name: "Sinh Tồn", lat: 9.88, lon: 114.32},
          {name: "Trường Sa Lớn", lat: 8.64, lon: 111.92},
          {name: "Đá Tây", lat: 8.85, lon: 112.25},
          {name: "An Bang", lat: 7.89, lon: 112.91},

          // Label Point for the whole group
          {name: "Quần đảo Trường Sa (Việt Nam)", lat: 9.5, lon: 113.5, isLabel: true},
        ],
        marker: {
          symbol: "circle",
          radius: 3, // Small islands
          fillColor: "#d9363e",
        },
        dataLabels: {
          enabled: true,
          formatter: function (this: any) {
            const p = this.point;
            return p.isLabel ? p.name : "";
          },
          style: {
            color: "#d9363e",
            fontWeight: "bold",
            fontSize: "12px",
            textOutline: "2px white",
          },
          y: -15,
        },
      },
      {
        type: "mappoint",
        name: "Quần đảo Hoàng Sa",
        color: "#d9363e",
        data: [
          // Paracel Islands (Hoang Sa)
          {name: "Đảo Hoàng Sa", lat: 16.53, lon: 111.6},
          {name: "Đảo Phú Lâm", lat: 16.83, lon: 112.33},
          {name: "Đảo Linh Côn", lat: 16.06, lon: 112.98},
          {name: "Đảo Tri Tôn", lat: 15.78, lon: 111.2},

          // Label Point
          {name: "Quần đảo Hoàng Sa (Việt Nam)", lat: 16.3, lon: 112.0, isLabel: true},
        ],
        marker: {
          symbol: "circle",
          radius: 3,
          fillColor: "#d9363e",
        },
        dataLabels: {
          enabled: true,
          formatter: function (this: any) {
            const p = this.point;
            return p.isLabel ? p.name : "";
          },
          style: {
            color: "#d9363e",
            fontWeight: "bold",
            fontSize: "12px",
            textOutline: "2px white",
          },
          y: -5,
        },
      },
      {
        type: "mapline",
        name: "Ranh giới Quần đảo",
        color: "#d9363e",
        accessibility: {enabled: false},
        className: "archipelago-boundary",
        data: [
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [111.0, 17.0], // Hoang Sa Box
                [113.2, 17.0],
                [113.2, 15.5],
                [111.0, 15.5],
                [111.0, 17.0],
              ],
            },
            color: "#d9363e",
            dashStyle: "ShortDot",
            lineWidth: 1.5,
          },
          {
            geometry: {
              type: "LineString",
              coordinates: [
                [113.0, 12.0], // Truong Sa Polgyon (approx)
                [115.0, 12.0],
                [115.0, 7.5],
                [111.5, 7.5],
                [111.5, 9.0],
                [113.0, 12.0],
              ],
            },
            color: "#d9363e",
            dashStyle: "ShortDot",
            lineWidth: 1.5,
          },
        ],
      },
    ] as any,
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
          onClick={handleMapClick}
          style={{
            height: isFullscreen ? "100vh" : 800,
            width: isFullscreen ? "100vw" : "100%",
            position: isFullscreen ? "fixed" : "relative",
            top: isFullscreen ? 0 : "auto",
            left: isFullscreen ? 0 : "auto",
            zIndex: isFullscreen ? 9999 : 1,
            borderRadius: isFullscreen ? 0 : 8,
            overflow: isFullscreen ? "auto" : "hidden", // Allow scroll in fullscreen to see all content
            boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
            border: "1px solid #e0c097",
            background: "#fff",
            cursor: isFullscreen ? "default" : "pointer",
            transition: "all 0.3s ease",
            // Decorative frame
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
              zIndex: 10,
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
              zIndex: 10,
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
              zIndex: 10,
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
              zIndex: 10,
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
            <HighchartsReact
              highcharts={Highcharts}
              constructorType={"mapChart"}
              options={chartOptions}
              ref={chartRef}
            />
          )}

          {/* Hint text when not fullscreen - subtle and positioned to avoid center */}
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
              <Button className="home-game-btn" onClick={() => navigate("/game/map")} icon={<EnvironmentOutlined />}>
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
          <div
            className="home-game-card home-map-stats-card"
            style={{
              top: 80,
              left: 60,
              // Use inline for positioning only, rest from class
            }}
          >
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
                  {locations.length}
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
