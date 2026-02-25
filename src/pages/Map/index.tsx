import React, {useState, useEffect, useCallback} from "react";
import {GoogleMap, useJsApiLoader, Marker, InfoWindow} from "@react-google-maps/api";
import {Spin, Typography, Select, Input, Tag, Space, Dropdown, Button, Radio} from "antd";
import {EnvironmentOutlined, SearchOutlined, CheckOutlined, AppstoreOutlined} from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import {artifactService} from "@/services";
import SimpleMap from "@/components/Map/SimpleMap";
import {useNavigate} from "react-router-dom";
import {
  ITEM_TYPES,
  MAP_CENTER,
  MAP_VIEW_MODES,
  ItemType,
  MapViewMode,
  HERITAGE_TYPE_LABELS,
  ARTIFACT_TYPE_LABELS,
} from "@/config/constants";
import vnMapDataUrl from "/mapdata/vn-all.geo.json?url";
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
  itemType?: ItemType;
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
  thumbnail?: string;
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
  thumbnail?: string;
  heritageSiteId?: number;
}

// Google Maps configuration
const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = MAP_CENTER;

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [_map, setMap] = useState<google.maps.Map | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>(MAP_VIEW_MODES.GOOGLE);
  const [mapData, setMapData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Helper to normalize image URLs
  const getFullImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/")) {
      return url;
    }
    // Assume relative path from API base (without /api)
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").split("/api")[0];
    return `${baseUrl}/${url}`;
  };

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

  // Fetch Highcharts Map Data
  useEffect(() => {
    const fetchHighchartsData = async () => {
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

          // Filter for SEA neighbors
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
      } catch (e) {
        console.warn("Error in Highcharts data fetching", e);
      }
    };
    fetchHighchartsData();
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
            thumbnail: getFullImageUrl(h.mainImage || h.image || h.thumbnail) || "/images/placeholder-heritage.jpg",
            itemType: ITEM_TYPES.HERITAGE,
          });
        });
      }

      // Fetch Artifacts with pagination (max limit = 100)
      try {
        let currentPage = 1;
        let hasMore = true;
        let totalArtifacts = 0;

        while (hasMore) {
          const artifactRes = await artifactService.getAll({limit: 100, page: currentPage});

          if (artifactRes.success && artifactRes.data && artifactRes.data.length > 0) {
            totalArtifacts += artifactRes.data.length;

            artifactRes.data.forEach((a: ArtifactLocation) => {
              const heritageId = a.heritageSiteId || (a as any).heritage_site_id || (a as any).heritageSite;

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
                  thumbnail: a.mainImage || a.image || "/images/placeholder-artifact.jpg",
                  itemType: ITEM_TYPES.ARTIFACT,
                });
              } else if (a.latitude && a.longitude) {
                allLocations.push({
                  id: a.id,
                  name: a.name,
                  lat: Number(a.latitude),
                  lng: Number(a.longitude),
                  type: a.artifactType || "Hiện vật",
                  province: a.province || "Chưa xác định",
                  thumbnail: getFullImageUrl(a.mainImage || a.image || a.thumbnail) || "/images/placeholder-artifact.jpg",
                  itemType: ITEM_TYPES.ARTIFACT,
                });
              }
            });

            if (artifactRes.data.length < 100) {
              hasMore = false;
            } else {
              currentPage++;
            }
          } else {
            hasMore = false;
          }
        }
      } catch (error) {
        console.warn("Failed to load artifact locations:", error);
      }

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
      result = result.filter((loc) => loc.itemType === itemTypeFilter);
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
  
  const getTypeLabel = (type: string) => {
    return (HERITAGE_TYPE_LABELS as any)[type] || (ARTIFACT_TYPE_LABELS as any)[type] || type;
  };

  const heritageCount = filteredLocations.filter((loc) => loc.itemType === ITEM_TYPES.HERITAGE).length;
  const artifactCount = filteredLocations.filter((loc) => loc.itemType === ITEM_TYPES.ARTIFACT).length;

  return (
    <div className="map-page-container">
      {/* Header / Filter Bar */}
      <div className="map-header-bar">
        <div className="header-left">
          <EnvironmentOutlined className="map-icon" />
          <div className="title-group">
            <Typography.Title level={4}>Bản đồ Di sản & Hiện vật</Typography.Title>
            <Typography.Text className="map-subtitle">Đang hiển thị {filteredLocations.length} địa điểm</Typography.Text>
          </div>
        </div>

        <div className="filter-section">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            className="filter-input"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          <Select
            placeholder="Loại nội dung"
            className="filter-select-item-type"
            value={itemTypeFilter}
            onChange={(v) => setItemTypeFilter(v as any)}
          >
            <Option value="all">Tất cả ({locations.length})</Option>
            <Option value={ITEM_TYPES.HERITAGE}>
              Di sản ({locations.filter((l) => l.itemType === ITEM_TYPES.HERITAGE).length})
            </Option>
            <Option value={ITEM_TYPES.ARTIFACT}>
              Hiện vật ({locations.filter((l) => l.itemType === ITEM_TYPES.ARTIFACT).length})
            </Option>
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
                {getTypeLabel(t)}
              </Option>
            ))}
          </Select>

          <div className="view-mode-toggle">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="middle"
              className="custom-radio-group"
              options={[
                {label: "Google Maps", value: MAP_VIEW_MODES.GOOGLE},
                {label: "Simple Map", value: MAP_VIEW_MODES.SIMPLE},
              ]}
            />
          </div>
        </div>
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
        ) : viewMode === MAP_VIEW_MODES.SIMPLE && mapData ? (
          <div className="simple-map-container" style={{height: "100%", background: "#fff"}}>
            <SimpleMap
              mapData={mapData}
              worldData={worldData}
              locations={filteredLocations.filter((l) => l.itemType === ITEM_TYPES.HERITAGE)}
              artifacts={filteredLocations.filter((l) => l.itemType === ITEM_TYPES.ARTIFACT)}
              allowZoom={true}
              height="100%"
            />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={8}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT,
                mapTypeIds: [
                  google.maps.MapTypeId.ROADMAP,
                  google.maps.MapTypeId.SATELLITE,
                  google.maps.MapTypeId.HYBRID,
                  google.maps.MapTypeId.TERRAIN,
                ],
              },
              streetViewControl: true,
              streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
              },
              fullscreenControl: true,
              fullscreenControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
              },
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
              },
              scaleControl: true,
              rotateControl: true,
              rotateControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT,
              },
              disableDefaultUI: false,
              gestureHandling: "greedy",
            }}
          >
            {filteredLocations.map((loc) => (
              <Marker
                key={`${loc.itemType}-${loc.id}`}
                position={{lat: loc.lat, lng: loc.lng}}
                onClick={() => setSelectedMarker(loc)}
                title={`${loc.name} - ${loc.type}`}
                icon={{
                  url:
                    loc.itemType === ITEM_TYPES.ARTIFACT
                      ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                      : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new google.maps.Size(40, 40),
                  labelOrigin: new google.maps.Point(20, 45),
                }}
                label={
                  filteredLocations.length < 50
                    ? {
                        text: loc.name.length > 15 ? loc.name.substring(0, 15) + "..." : loc.name,
                        color: loc.itemType === ITEM_TYPES.ARTIFACT ? "#faad14" : "#d9363e",
                        fontSize: "11px",
                        fontWeight: "bold",
                        className: "marker-label",
                      }
                    : undefined
                }
              />
            ))}

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
                        backgroundImage: `url(${getFullImageUrl(selectedMarker.thumbnail)})`,
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
                    <Tag color={selectedMarker.itemType === ITEM_TYPES.ARTIFACT ? "warning" : "error"}>
                      {selectedMarker.itemType === ITEM_TYPES.ARTIFACT ? "Hiện vật" : getTypeLabel(selectedMarker.type)}
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
