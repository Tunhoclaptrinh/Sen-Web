import React, {useState, useEffect} from "react";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import {Spin, Typography, Select, Input, Tag, Space, Button} from "antd";
import {EnvironmentOutlined, SearchOutlined} from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import {useNavigate} from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const {Title, Text} = Typography;
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
    <div style={{height: "calc(100vh - 64px)", display: "flex", flexDirection: "column"}}>
      {/* Header / Filter Bar */}
      <div
        style={{
          padding: "16px 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          zIndex: 1000,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8, marginRight: "auto"}}>
          <EnvironmentOutlined style={{fontSize: 24, color: "#1890ff"}} />
          <div>
            <Title level={4} style={{margin: 0}}>
              Bản đồ Di sản số
            </Title>
            <Text type="secondary">Khám phá {filteredLocations.length} địa điểm trên khắp Việt Nam</Text>
          </div>
        </div>

        <Input
          placeholder="Tìm kiếm địa điểm..."
          prefix={<SearchOutlined />}
          style={{width: 250}}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <Select placeholder="Tỉnh/Thành phố" style={{width: 200}} allowClear onChange={setProvinceFilter} showSearch>
          {provinces.map((p) => (
            <Option key={p} value={p}>
              {p}
            </Option>
          ))}
        </Select>

        <Select placeholder="Loại hình" style={{width: 180}} allowClear onChange={setTypeFilter}>
          {types.map((t) => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>
      </div>

      {/* Map Container */}
      <div style={{flex: 1, position: "relative"}}>
        {loading ? (
          <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "100%"}}>
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
                  <div style={{width: 200}}>
                    {loc.thumbnail && (
                      <div
                        style={{
                          width: "100%",
                          height: 120,
                          backgroundImage: `url(${loc.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                    )}
                    <Title level={5} style={{marginBottom: 4}}>
                      {loc.name}
                    </Title>
                    <Space size={[0, 8]} wrap>
                      <Tag color="blue">{loc.type}</Tag>
                      {loc.province && <Tag color="green">{loc.province}</Tag>}
                    </Space>
                    <Button
                      type="primary"
                      size="small"
                      block
                      style={{marginTop: 12}}
                      onClick={() => navigate(`/heritage/${loc.id}`)}
                    >
                      Xem chi tiết
                    </Button>
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
