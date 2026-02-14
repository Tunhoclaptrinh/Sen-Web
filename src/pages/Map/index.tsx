import React, {useState, useEffect} from "react";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import {Spin, Typography, Select, Input, Tag, Space} from "antd";
import {EnvironmentOutlined, SearchOutlined} from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import {useNavigate} from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./styles.less";

// Fix Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const {Option} = Select;

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  province: string;
  thumbnail: string;
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterData();
  }, [locations, provinceFilter, typeFilter, searchText]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await heritageService.getLocations();
      if (res.success && res.data) {
        setLocations(res.data);
      }
    } catch (error) {
      console.error("Failed to load map data", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = locations;

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

  return (
    <div className="map-page-container">
      {/* Header / Filter Bar */}
      <div className="map-header-bar">
        <div className="header-left">
          <EnvironmentOutlined className="map-icon" />
          <div className="title-group">
            <Typography.Title level={4}>Bản đồ Di sản số</Typography.Title>
            <Typography.Text className="map-subtitle">
              Khám phá {filteredLocations.length} địa điểm trên khắp Việt Nam
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
        {loading ? (
          <div className="loading-overlay">
            <Spin size="large" tip="Đang tải bản đồ..." />
          </div>
        ) : (
          <MapContainer
            center={[16.047079, 108.20623]} // Center of Vietnam (Da Nang)
            zoom={6}
            style={{height: "100%", width: "100%"}}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredLocations.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="map-popup-content">
                    {loc.thumbnail && (
                      <div className="popup-image" style={{backgroundImage: `url(${loc.thumbnail})`}} />
                    )}
                    <Typography.Title level={5}>{loc.name}</Typography.Title>
                    <Space size={[0, 8]} wrap className="popup-tags">
                      <Tag color="blue">{loc.type}</Tag>
                      {loc.province && <Tag color="green">{loc.province}</Tag>}
                    </Space>
                    <button className="popup-action-btn" onClick={() => navigate(`/heritage/${loc.id}`)}>
                      Xem chi tiết
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapPage;
