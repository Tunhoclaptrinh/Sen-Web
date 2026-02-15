import React, {useState, useEffect, useCallback} from "react";
import {GoogleMap, useJsApiLoader, Marker, InfoWindow} from "@react-google-maps/api";
import {Spin, Typography, Select, Input, Tag, Space, Dropdown, Button} from "antd";
import {EnvironmentOutlined, SearchOutlined, CheckOutlined, AppstoreOutlined} from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import {artifactService} from "@/services";
import {useNavigate} from "react-router-dom";
import "./styles.less";

const {Option} = Select;

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  province: string;
  thumbnail: string;
  itemType?: "heritage" | "artifact";
}

interface HeritageLocation {
  id: number;
  name: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lng?: number;
  type?: string;
  province: string;
  image?: string;
  mainImage?: string;
}

interface ArtifactLocation {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  artifactType?: string;
  province?: string;
  image?: string;
  mainImage?: string;
  heritageSiteId?: number;
}

// Google Maps configuration
const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 16.047079,
  lng: 108.20623,
};

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<"all" | "heritage" | "artifact">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [_map, setMap] = useState<google.maps.Map | null>(null);

  // Map layers state
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);
  const [transitLayer, setTransitLayer] = useState<google.maps.TransitLayer | null>(null);
  const [bicyclingLayer, setBicyclingLayer] = useState<google.maps.BicyclingLayer | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const [showBicycling, setShowBicycling] = useState(false);

  // Load Google Maps API
  const {isLoaded, loadError} = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    language: "vi",
    region: "VN",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Initialize layers
    const traffic = new google.maps.TrafficLayer();
    const transit = new google.maps.TransitLayer();
    const bicycling = new google.maps.BicyclingLayer();

    setTrafficLayer(traffic);
    setTransitLayer(transit);
    setBicyclingLayer(bicycling);
  }, []);

  const onUnmount = useCallback(() => {
    // Clean up layers
    trafficLayer?.setMap(null);
    transitLayer?.setMap(null);
    bicyclingLayer?.setMap(null);
    setMap(null);
  }, [trafficLayer, transitLayer, bicyclingLayer]);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations, provinceFilter, typeFilter, itemTypeFilter, searchText]);

  // Handle traffic layer toggle
  useEffect(() => {
    if (trafficLayer && _map) {
      trafficLayer.setMap(showTraffic ? _map : null);
    }
  }, [showTraffic, trafficLayer, _map]);

  // Handle transit layer toggle
  useEffect(() => {
    if (transitLayer && _map) {
      transitLayer.setMap(showTransit ? _map : null);
    }
  }, [showTransit, transitLayer, _map]);

  // Handle bicycling layer toggle
  useEffect(() => {
    if (bicyclingLayer && _map) {
      bicyclingLayer.setMap(showBicycling ? _map : null);
    }
  }, [showBicycling, bicyclingLayer, _map]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const allLocations: Location[] = [];

      // Helper function to add small offset to artifact locations
      const getArtifactOffset = (id: number) => {
        // Use ID to generate consistent but varied offsets
        const seed = id % 360; // Convert to angle
        const distance = 0.003; // ~300 meters offset
        const angle = (seed * Math.PI) / 180;
        return {
          latOffset: Math.cos(angle) * distance,
          lngOffset: Math.sin(angle) * distance,
        };
      };

      // Fetch Heritage Site locations
      const heritageRes = await heritageService.getLocations();
      const heritageMap = new Map<number, HeritageLocation>();

      if (heritageRes.success && heritageRes.data) {
        heritageRes.data.forEach((h: HeritageLocation) => {
          heritageMap.set(h.id, h);
          allLocations.push({
            id: h.id,
            name: h.name,
            lat: Number(h.latitude || h.lat),
            lng: Number(h.longitude || h.lng),
            type: h.type || "Di sản",
            province: h.province,
            thumbnail: h.image || h.mainImage || "",
            itemType: "heritage" as const,
          });
        });
      }

      // Fetch Artifacts with pagination (max limit = 100)
      try {
        let currentPage = 1;
        let hasMore = true;
        let totalArtifacts = 0;
        let artifactWithHeritageSite = 0;
        let artifactWithCoordinates = 0;
        let artifactSkipped = 0;

        while (hasMore) {
          const artifactRes = await artifactService.getAll({limit: 100, page: currentPage});

          if (artifactRes.success && artifactRes.data && artifactRes.data.length > 0) {
            totalArtifacts += artifactRes.data.length;

            if (currentPage === 1) {
              console.log("[Map] Sample artifact:", artifactRes.data[0]);
            }

            artifactRes.data.forEach((a: ArtifactLocation) => {
              // Check all possible field names for heritage site ID
              const heritageId = a.heritageSiteId || (a as any).heritage_site_id || (a as any).heritageSite;

              // If artifact has heritageSiteId, use heritage site's location with offset
              if (heritageId && heritageMap.has(heritageId)) {
                const heritage = heritageMap.get(heritageId)!;
                const offset = getArtifactOffset(a.id);
                allLocations.push({
                  id: a.id,
                  name: a.name,
                  lat: Number(heritage.latitude || heritage.lat) + offset.latOffset,
                  lng: Number(heritage.longitude || heritage.lng) + offset.lngOffset,
                  type: a.artifactType || "Hiện vật",
                  province: a.province || heritage.province || "Chưa xác định",
                  thumbnail: a.image || a.mainImage || "",
                  itemType: "artifact" as const,
                });
                artifactWithHeritageSite++;
              }
              // If artifact has direct lat/lng coordinates
              else if (a.latitude && a.longitude) {
                allLocations.push({
                  id: a.id,
                  name: a.name,
                  lat: Number(a.latitude),
                  lng: Number(a.longitude),
                  type: a.artifactType || "Hiện vật",
                  province: a.province || "Chưa xác định",
                  thumbnail: a.image || a.mainImage || "",
                  itemType: "artifact" as const,
                });
                artifactWithCoordinates++;
              } else {
                artifactSkipped++;
              }
            });

            // Check if there are more pages
            if (artifactRes.data.length < 100) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } else {
            hasMore = false;
          }
        }

        console.log(`[Map] Loaded ${totalArtifacts} artifacts from ${currentPage} page(s)`);
        console.log(`[Map] Artifacts with heritage site: ${artifactWithHeritageSite}`);
        console.log(`[Map] Artifacts with coordinates: ${artifactWithCoordinates}`);
        console.log(`[Map] Artifacts skipped (no location): ${artifactSkipped}`);
      } catch (error) {
        console.warn("Failed to load artifact locations:", error);
      }

      console.log(
        `[Map] Total locations: ${allLocations.length} (Heritage: ${allLocations.filter((l) => l.itemType === "heritage").length}, Artifacts: ${allLocations.filter((l) => l.itemType === "artifact").length})`,
      );
      setLocations(allLocations);
    } catch (error) {
      console.error("Failed to load map data", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = locations;

    if (itemTypeFilter !== "all") {
      result = result.filter((l) => l.itemType === itemTypeFilter);
    }

    if (provinceFilter) {
      result = result.filter((l) => l.province === provinceFilter);
    }

    if (typeFilter) {
      result = result.filter((l) => l.type === typeFilter);
    }

    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter((l) => l.name.toLowerCase().includes(lower));
    }

    setFilteredLocations(result);
  };

  const provinces = Array.from(new Set(locations.map((l) => l.province).filter(Boolean))).sort();
  const types = Array.from(new Set(locations.map((l) => l.type).filter(Boolean))).sort();
  const heritageCount = locations.filter((l) => l.itemType === "heritage").length;
  const artifactCount = locations.filter((l) => l.itemType === "artifact").length;

  return (
    <div className="map-page-container">
      {/* Header / Filter Bar */}
      <div className="map-header-bar">
        <div className="header-left">
          <EnvironmentOutlined className="map-icon" />
          <div className="title-group">
            <Typography.Title level={4}>Bản đồ Di sản và Hiện Vật</Typography.Title>
            <Typography.Text className="map-subtitle">
              Khám phá {filteredLocations.length} địa điểm trên khắp Việt Nam (Di sản: {heritageCount}, Hiện vật:{" "}
              {artifactCount})
            </Typography.Text>
          </div>
        </div>

        <Input
          placeholder="Tìm kiếm địa điểm..."
          prefix={<SearchOutlined />}
          className="filter-input"
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select
          placeholder="Loại nội dung"
          className="filter-select-type"
          value={itemTypeFilter}
          onChange={setItemTypeFilter}
        >
          <Option value="all">Tất cả</Option>
          <Option value="heritage">Di sản</Option>
          <Option value="artifact">Hiện vật</Option>
        </Select>

        <Select
          placeholder="Tỉnh/Thành phố"
          className="filter-select-province"
          allowClear
          onChange={setProvinceFilter}
          showSearch
        >
          {provinces.map((p) => (
            <Option key={p} value={p}>
              {p}
            </Option>
          ))}
        </Select>

        <Select placeholder="Loại hình" className="filter-select-type" allowClear onChange={setTypeFilter}>
          {types.map((t) => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>
      </div>

      {/* Map Container */}
      <div className="map-wrapper">
        {loadError ? (
          <div className="loading-overlay">
            <Typography.Text type="danger">Không thể tải Google Maps. Vui lòng kiểm tra API key.</Typography.Text>
          </div>
        ) : !isLoaded || loading ? (
          <div className="loading-overlay">
            <Spin size="large" tip="Đang tải bản đồ..." />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={8}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              // Default map type - Hiển thị bản đồ đường mặc định
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              // Map Type Control - Chuyển đổi kiểu bản đồ
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: [
                  google.maps.MapTypeId.ROADMAP, // Bản đồ đường
                  google.maps.MapTypeId.SATELLITE, // Vệ tinh
                  google.maps.MapTypeId.HYBRID, // Vệ tinh + Tên đường
                  google.maps.MapTypeId.TERRAIN, // Địa hình
                ],
              },
              // Street View Control
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
              },
              // Fullscreen Control
              fullscreenControl: true,
              fullscreenControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
              },
              // Zoom Control
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
              // Scale Control - Hiển thị tỷ lệ
              scaleControl: true,
              // Rotate Control - Xoay bản đồ
              rotateControl: true,
              rotateControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
              },
              // Disable default UI if you want full custom control
              disableDefaultUI: false,
              // Gestures
              gestureHandling: "greedy",
              // Map styles (optional - can uncomment for custom styling)
              // styles: [],
            }}
          >
            {/* Location Markers */}
            {filteredLocations.map((loc) => (
              <Marker
                key={`${loc.itemType}-${loc.id}`}
                position={{lat: loc.lat, lng: loc.lng}}
                onClick={() => setSelectedMarker(loc)}
                title={`${loc.name} - ${loc.type}`}
                icon={{
                  url:
                    loc.itemType === "artifact"
                      ? "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new google.maps.Size(40, 40),
                  labelOrigin: new google.maps.Point(20, 45),
                }}
                label={
                  filteredLocations.length < 50
                    ? {
                        text: loc.name.length > 15 ? loc.name.substring(0, 15) + "..." : loc.name,
                        color: loc.itemType === "artifact" ? "#ff6b35" : "#1890ff",
                        fontSize: "11px",
                        fontWeight: "bold",
                        className: "marker-label",
                      }
                    : undefined
                }
              />
            ))}

            {/* Info Window */}
            {selectedMarker && (
              <InfoWindow
                position={{lat: selectedMarker.lat, lng: selectedMarker.lng}}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="map-popup-content" style={{maxWidth: "250px"}}>
                  {selectedMarker.thumbnail && (
                    <div
                      className="popup-image"
                      style={{
                        backgroundImage: `url(${selectedMarker.thumbnail})`,
                        height: "120px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    />
                  )}
                  <Typography.Title level={5} style={{margin: "8px 0"}}>
                    {selectedMarker.name}
                  </Typography.Title>
                  <Space size={[0, 8]} wrap className="popup-tags">
                    <Tag color={selectedMarker.itemType === "artifact" ? "orange" : "blue"}>
                      {selectedMarker.itemType === "artifact" ? "Hiện vật" : selectedMarker.type}
                    </Tag>
                    {selectedMarker.province && <Tag color="green">{selectedMarker.province}</Tag>}
                  </Space>
                  <button
                    className="popup-action-btn"
                    style={{
                      marginTop: "12px",
                      padding: "6px 12px",
                      background: "#1890ff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      width: "100%",
                    }}
                    onClick={() =>
                      navigate(
                        selectedMarker.itemType === "artifact"
                          ? `/artifacts/${selectedMarker.id}`
                          : `/heritage-sites/${selectedMarker.id}`,
                      )
                    }
                  >
                    Xem chi tiết
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {/* Layers Control Button (Google Maps style) */}
        {!loading && !loadError && (
          <div className="layers-control-wrapper">
            <Dropdown
              menu={{
                items: [
                  {
                    key: "traffic",
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          minWidth: "200px",
                        }}
                      >
                        <span>🚗 Giao thông</span>
                        {showTraffic && <CheckOutlined style={{color: "#1890ff"}} />}
                      </div>
                    ),
                    onClick: () => setShowTraffic(!showTraffic),
                  },
                  {
                    key: "transit",
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          minWidth: "200px",
                        }}
                      >
                        <span>🚊 Phương tiện công cộng</span>
                        {showTransit && <CheckOutlined style={{color: "#1890ff"}} />}
                      </div>
                    ),
                    onClick: () => setShowTransit(!showTransit),
                  },
                  {
                    key: "bicycling",
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          minWidth: "200px",
                        }}
                      >
                        <span>🚴 Xe đạp</span>
                        {showBicycling && <CheckOutlined style={{color: "#1890ff"}} />}
                      </div>
                    ),
                    onClick: () => setShowBicycling(!showBicycling),
                  },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button className="layers-control-button" icon={<AppstoreOutlined />} size="large">
                Lớp bản đồ
              </Button>
            </Dropdown>
          </div>
        )}

        {/* Map Legend */}
        {!loading && !loadError && (
          <div className="map-legend">
            <div className="legend-title">
              <EnvironmentOutlined /> Chú giải
            </div>
            <div className="legend-item">
              <div className="legend-icon heritage-icon"></div>
              <span>Di sản ({heritageCount})</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon artifact-icon"></div>
              <span>Hiện vật ({artifactCount})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
