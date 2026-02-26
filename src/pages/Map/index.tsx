import React, {useState, useEffect, useCallback} from "react";
import {GoogleMap, useJsApiLoader, Marker, InfoWindow, OverlayView} from "@react-google-maps/api";
import {Spin, Typography, Select, Input, Tag, Space, Dropdown, Button, Radio, notification} from "antd";
import {EnvironmentOutlined, SearchOutlined, CheckOutlined, AppstoreOutlined, RocketOutlined} from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import {artifactService} from "@/services";
import SimpleMap from "@/components/Map/SimpleMap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import gameService from "@/services/game.service";
import EmbeddedGameZone from "@/components/Game/EmbeddedGameZone";
import { Modal } from "antd";
import {
  ITEM_TYPES,
  MAP_CENTER,
  MAP_VIEW_MODES,
  ItemType,
  MapViewMode,
  HERITAGE_TYPE_LABELS,
  ARTIFACT_TYPE_LABELS,
  MAP_ZOOM_DEFAULT,
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
  relatedLevelIds?: number[];
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
  relatedLevelIds?: number[];
}

// Google Maps configuration
const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = MAP_CENTER;

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemType | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [_map, setMap] = useState<google.maps.Map | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>(MAP_VIEW_MODES.SIMPLE);
  const [mapData, setMapData] = useState<any>(null);
  const [worldData, setWorldData] = useState<any>(null);

  // Actions state
  const { user } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);
  const [activeGameLevel, setActiveGameLevel] = useState<number | null>(null);
  const [activeHunt, setActiveHunt] = useState<Location | null>(null);

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

  // Handle Google Maps load error
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps Load Error:", loadError);
      notification.warning({
        message: "Lỗi tải Google Maps",
        description: "Không thể tải Google Maps. Hệ thống đã tự động chuyển sang Bản đồ Đơn giản để bạn tiếp tục trải nghiệm.",
        placement: "topRight",
        duration: 5,
      });
      setViewMode(MAP_VIEW_MODES.SIMPLE);
    }
  }, [loadError]);

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
    // Global listener for Google Maps authentication failure
    // This is called by the Google Maps script if the API key is invalid or restricted
    (window as any).gm_authFailure = () => {
      console.error("Google Maps Authentication Failed!");
      notification.error({
        message: "Lỗi xác thực Google Maps",
        description: "API Key không hợp lệ hoặc bị giới hạn. Hệ thống đang chuyển sang Bản đồ dự phòng.",
        placement: "topRight",
        duration: 10,
      });
      setViewMode(MAP_VIEW_MODES.SIMPLE);
    };

    fetchLocations();

    // Handle URL parameters for centering and actions
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const actionParam = searchParams.get("action");
    const idParam = searchParams.get("id");
    const typeParam = searchParams.get("type");

    if (latParam && lngParam) {
      // Map centering will happen when _map is available or via center state if we had one
      // For now, let's show a notification if there's an action
      if (actionParam === "hunt") {
        notification.info({
          message: "🎯 Chế độ Tầm bảo",
          description: "Bạn đã kích hoạt chế độ Tầm bảo tại địa điểm này. Hãy di chuyển đến gần để bắt đầu!",
          placement: "top",
          icon: <RocketOutlined style={{ color: '#1890ff' }} />,
        });
      } else if (actionParam === "checkin") {
        notification.success({
          message: "📍 Sẵn sàng Check-in",
          description: "Vị trí đã được đánh dấu. Bạn có thể check-in khi đến đúng tọa độ!",
          placement: "top",
        });
      }
    }

    if (idParam && typeParam) {
      // We'll use this to auto-select the marker once locations are loaded
    }

    return () => {
      delete (window as any).gm_authFailure;
    };
  }, [searchParams]);

  // Effect to center map when _map and searchParams change
  useEffect(() => {
    if (_map && searchParams.get("lat") && searchParams.get("lng")) {
      const lat = Number(searchParams.get("lat"));
      const lng = Number(searchParams.get("lng"));
      if (!isNaN(lat) && !isNaN(lng)) {
        _map.panTo({ lat, lng });
        _map.setZoom(17); // Close up for specific location
      }
    }
  }, [_map, searchParams]);

  // Effect to auto-select marker when locations load and id/type param exists
  useEffect(() => {
    if (locations.length > 0) {
      const id = searchParams.get("id");
      const type = searchParams.get("type");
      if (id && type) {
        const found = locations.find(l => l.id === Number(id) && l.itemType === type);
        if (found) {
          setSelectedMarker(found);
          if (searchParams.get("action") === "hunt") {
            setActiveHunt(found);
          }
        }
      }
    }
  }, [locations, searchParams]);

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
          const lat = Number(h.latitude || h.lat);
          const lng = Number(h.longitude || h.lng);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            allLocations.push({
              id: h.id,
              name: h.name,
              lat: lat,
              lng: lng,
              type: h.type || "Di sản",
              province: h.province,
              thumbnail: getFullImageUrl(h.mainImage || h.image || h.thumbnail) || "/images/placeholder-heritage.jpg",
              itemType: ITEM_TYPES.HERITAGE,
            });
          }
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
                const lat = Number(heritage.latitude || heritage.lat) + offset.latOffset;
                const lng = Number(heritage.longitude || heritage.lng) + offset.lngOffset;

                if (!isNaN(lat) && !isNaN(lng)) {
                  allLocations.push({
                    id: a.id,
                    name: a.name,
                    lat: lat,
                    lng: lng,
                    type: a.artifactType || "Hiện vật",
                    province: a.province || heritage.province || "Chưa xác định",
                    thumbnail: a.mainImage || a.image || "/images/placeholder-artifact.jpg",
                    itemType: ITEM_TYPES.ARTIFACT,
                    relatedLevelIds: a.relatedLevelIds,
                  });
                }
              } else if (a.latitude !== undefined && a.longitude !== undefined) {
                const lat = Number(a.latitude);
                const lng = Number(a.longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                  allLocations.push({
                    id: a.id,
                    name: a.name,
                    lat: lat,
                    lng: lng,
                    type: a.artifactType || "Hiện vật",
                    province: a.province || "Chưa xác định",
                    thumbnail: getFullImageUrl(a.mainImage || a.image || a.thumbnail) || "/images/placeholder-artifact.jpg",
                    itemType: ITEM_TYPES.ARTIFACT,
                    relatedLevelIds: a.relatedLevelIds,
                  });
                }
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

  const handleCheckIn = async (locId: number) => {
    if (!user) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để thực hiện Check-in!",
      });
      return;
    }

    try {
      setCheckingIn(true);
      const res = await gameService.checkIn(locId);
      notification.success({
        message: "Check-in thành công!",
        description: `Chúc mừng! Bạn đã nhận được ${res.pointsEarned} điểm cúp tại ${res.locationName}.`,
        icon: <CheckOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error: any) {
      console.error("Check-in error:", error);
      notification.error({
        message: "Check-in thất bại",
        description: error.response?.data?.message || "Bạn đã check-in tại địa điểm này hôm nay rồi.",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleHunt = (loc: Location) => {
    if (!user) {
      notification.warning({
        message: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tham gia Tầm bảo!",
      });
      return;
    }

    if (loc.relatedLevelIds && loc.relatedLevelIds.length > 0) {
      setActiveGameLevel(loc.relatedLevelIds[0]);
    } else {
      setActiveHunt(loc);
      if (_map) {
        _map.panTo({ lat: loc.lat, lng: loc.lng });
        _map.setZoom(18);
      }
      notification.info({
        message: "Chuẩn bị tầm bảo",
        description: `Bắt đầu tìm kiếm ${loc.name}. Hiệu ứng radar đã được kích hoạt!`,
        icon: <RocketOutlined style={{ color: "#faad14" }} />,
      });
    }
  };

  const provinces = Array.from(new Set(locations.map((l) => l.province).filter(Boolean))).sort();
  const types = Array.from(new Set(locations.map((l) => l.type).filter(Boolean))).sort();
  
  const getTypeLabel = (type: string) => {
    return (HERITAGE_TYPE_LABELS as any)[type] || (ARTIFACT_TYPE_LABELS as any)[type] || type;
  };

  const heritageCount = filteredLocations.filter((loc) => loc.itemType === ITEM_TYPES.HERITAGE).length;
  const artifactCount = filteredLocations.filter((loc) => loc.itemType === ITEM_TYPES.ARTIFACT).length;

  // Determine what to render
  const renderMap = () => {
    // 1. Loading state (initial)
    if (loading || (!isLoaded && !loadError)) {
      return (
        <div className="loading-overlay">
          <Spin size="large" tip="Đang tải dữ liệu và bản đồ..." />
        </div>
      );
    }

    // 2. Fallback or Manual Simple Map branch
    // We show SimpleMap if user chose it OR if Google Maps failed to load
    if (viewMode === MAP_VIEW_MODES.SIMPLE || loadError) {
      if (!mapData) {
        return (
          <div className="loading-overlay">
            <Spin size="large" tip="Đang chuẩn bị bản đồ dự phòng..." />
          </div>
        );
      }
      return (
        <div className="simple-map-container" style={{height: "100%", background: "#fff"}}>
          <SimpleMap
            mapData={mapData}
            worldData={worldData}
            locations={filteredLocations.filter((l) => l.itemType === ITEM_TYPES.HERITAGE)}
            artifacts={filteredLocations.filter((l) => l.itemType === ITEM_TYPES.ARTIFACT)}
            allowZoom={true}
            height="100%"
            activeHunt={activeHunt}
            onHunt={handleHunt}
            autoSelectId={searchParams.get("id") ? Number(searchParams.get("id")) : null}
            autoSelectType={searchParams.get("type")}
          />
        </div>
      );
    }

    // 3. Google Maps branch
    if (isLoaded && !loadError) {
      // Small safety check for the global google object
      if (typeof google === 'undefined') {
        return (
           <div className="loading-overlay">
              <Spin size="large" tip="Đang khởi tạo Google Maps..." />
           </div>
        );
      }

      return (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={MAP_ZOOM_DEFAULT}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            scaleControl: true,
            rotateControl: true,
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
              icon={
                typeof google !== 'undefined' ? {
                  url: loc.itemType === ITEM_TYPES.ARTIFACT
                    ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                    : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new google.maps.Size(40, 40),
                  labelOrigin: new google.maps.Point(20, 45),
                } : undefined
              }
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

          {activeHunt && !isNaN(activeHunt.lat) && !isNaN(activeHunt.lng) && (
            <OverlayView
              position={{ lat: activeHunt.lat, lng: activeHunt.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div className="radar-pulse-overlay" />
            </OverlayView>
          )}

          {selectedMarker && !isNaN(selectedMarker.lat) && !isNaN(selectedMarker.lng) && (
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
                <Space direction="vertical" style={{ width: "100%", marginTop: "12px" }}>
                  <Button
                    type="primary"
                    block
                    onClick={() =>
                      navigate(
                        selectedMarker.itemType === "artifact"
                          ? `/artifacts/${selectedMarker.id}`
                          : `/heritage-sites/${selectedMarker.id}`,
                      )
                    }
                  >
                    Xem chi tiết
                  </Button>

                  {selectedMarker.itemType === ITEM_TYPES.HERITAGE ? (
                    <Button
                      block
                      icon={<CheckOutlined />}
                      loading={checkingIn}
                      onClick={() => handleCheckIn(selectedMarker.id)}
                      style={{ background: "#52c41a", color: "white", borderColor: "#52c41a" }}
                    >
                      Check-in tại đây
                    </Button>
                  ) : (
                    <Button
                      block
                      icon={<RocketOutlined />}
                      onClick={() => handleHunt(selectedMarker)}
                      style={{ background: "#faad14", color: "white", borderColor: "#faad14" }}
                    >
                      Tầm bảo ngay
                    </Button>
                  )}
                </Space>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      );
    }

    return null;
  };

  return (
    <div className="map-page-container">
      {/* Header / Filter Bar */}
      <div className="map-header-bar">
        <div className="header-left">
          <EnvironmentOutlined className="map-icon" />
          <div className="discovery-header">
            <Typography.Title level={2}>Bản đồ Văn hóa SEN</Typography.Title>
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
        {activeHunt && (
          <div className="hunt-banner-wrapper">
            <div className="hunt-banner">
              <div className="hunt-info">
                <img 
                  src={getFullImageUrl(activeHunt.thumbnail)} 
                  alt={activeHunt.name} 
                  className="hunt-target-img" 
                />
                <div className="hunt-text">
                  <span className="target-label">Đang tìm kiếm</span>
                  <h3 className="target-name">{activeHunt.name}</h3>
                </div>
              </div>
              <div className="hunt-actions">
                <Button 
                   type="primary" 
                   icon={<RocketOutlined />} 
                   className="popup-action-btn"
                   onClick={() => navigate(`/game/scan`)}
                >
                   Quét QR
                </Button>
                <Button 
                  ghost 
                  danger 
                  icon={<CheckOutlined />} 
                  onClick={() => setActiveHunt(null)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        )}
        {renderMap()}

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

      <Modal
        open={!!activeGameLevel}
        onCancel={() => setActiveGameLevel(null)}
        footer={null}
        width={1000}
        centered
        destroyOnClose
        className="game-modal"
        bodyStyle={{padding: 0}}
      >
        {activeGameLevel && <EmbeddedGameZone levelId={activeGameLevel} onClose={() => setActiveGameLevel(null)} />}
      </Modal>
    </div>
  );
};

export default MapPage;
