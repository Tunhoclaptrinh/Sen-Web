/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import proj4 from "proj4";
import { useNavigate } from "react-router-dom";
import { ITEM_TYPES, ISLAND_SPRATLY, ISLAND_PARACEL, ITEM_TYPE_LABELS } from "@/config/constants";
import { getImageUrl } from "@/utils/image.helper";

if (typeof window !== "undefined") {
  (window as any).proj4 = proj4;
}

try {
  if (typeof highchartsMap === "function") {
    (highchartsMap as any)(Highcharts);
  }
} catch (e) {
  console.error("Failed to initialize Highcharts Map module", e);
}

if (Highcharts && Highcharts.AST) {
  Highcharts.AST.allowedAttributes.push("data-id");
  Highcharts.AST.allowedAttributes.push("data-type");
  Highcharts.AST.allowedAttributes.push("onclick");
}

interface ExploreMapProps {
  mapData: any;
  worldData: any;
  locations: any[];
  artifacts: any[];
  isFullscreen?: boolean;
  allowZoom?: boolean;
  height?: string | number;
  onMapClick?: () => void;
  activeHunt?: any;
  onHunt?: (loc: any) => void;
  autoSelectId?: number | null;
  autoSelectType?: string | null;
  showProvinceLabels?: boolean;
  softBackground?: boolean;
}

const SVG_PALETTE = {
  st7: "#b84a4a",
  st4: "#d86c6c",
  st2: "#f28c8c",
  st1: "#ee968b",
  st0: "#fe9288",
  st5: "#fdcab6",
  stroke: "#fff",
};

const EXPLORE_SERIES_NAME = "Explore map";

const normalizeProvinceName = (value?: string) => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/province|city/gi, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const getDensityColor = (count: number, maxCount: number) => {
  if (count <= 0 || maxCount <= 0) return SVG_PALETTE.st5;
  const ratio = Math.min(1, count / maxCount);
  if (ratio >= 0.75) return SVG_PALETTE.st7;
  if (ratio >= 0.55) return SVG_PALETTE.st4;
  if (ratio >= 0.35) return SVG_PALETTE.st2;
  if (ratio >= 0.15) return SVG_PALETTE.st0;
  return SVG_PALETTE.st0;
};

const ExploreMap: React.FC<ExploreMapProps> = ({
  mapData,
  worldData,
  locations,
  artifacts,
  isFullscreen = false,
  allowZoom = false,
  height = "100%",
  onMapClick,
  activeHunt,
  onHunt,
  autoSelectId,
  autoSelectType,
  showProvinceLabels = true,
  softBackground = false,
}) => {
  const navigate = useNavigate();
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number } | null>(null);

  const provinceDensityData = useMemo(() => {
    const featureList = mapData?.features || [];
    const provinceCountMap = new Map<string, number>();

    (locations || []).forEach((loc) => {
      const key = normalizeProvinceName(loc?.province);
      if (key) {
        provinceCountMap.set(key, (provinceCountMap.get(key) || 0) + 1);
      }
    });

    const data = featureList.map((feature: any) => {
      const props = feature?.properties || {};
      const provinceName = props.name || "";
      const hcKey = props["hc-key"];
      const normalized = normalizeProvinceName(provinceName);

      let value = provinceCountMap.get(normalized) || 0;
      if (!value && normalized.includes("ho chi minh")) value = provinceCountMap.get("ho chi minh") || 0;
      if (!value && normalized.includes("ha noi")) value = provinceCountMap.get("ha noi") || 0;

      return {
        "hc-key": hcKey,
        provinceName,
        value,
      };
    });

    const maxCount = data.reduce((max: number, item: any) => Math.max(max, item.value || 0), 0);

    return data.map((item: any) => ({
      ...item,
      color: getDensityColor(item.value, maxCount),
    }));
  }, [mapData, locations]);

  useEffect(() => {
    (window as any).SEN_NAVIGATE = (id: string, type: string) => {
      if (!id || id === "undefined") return;
      if (type === ITEM_TYPES.ARTIFACT) {
        navigate(`/artifacts/${id}`);
      } else {
        navigate(`/heritage-sites/${id}`);
      }
    };

    (window as any).SEN_HUNT = (id: string) => {
      const artifact = artifacts.find((a) => a.id === Number(id));
      if (artifact && onHunt) onHunt(artifact);
    };

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const detailBtn = target.closest(".ylvn-detail-btn") as HTMLElement;
      const huntBtn = target.closest(".ylvn-hunt-btn") as HTMLElement;

      if (detailBtn) {
        e.stopPropagation();
        const id = detailBtn.getAttribute("data-id");
        const type = detailBtn.getAttribute("data-type");
        if (id) (window as any).SEN_NAVIGATE(id, type || "");
      }

      if (huntBtn) {
        e.stopPropagation();
        const id = huntBtn.getAttribute("data-id");
        if (id) (window as any).SEN_HUNT(id);
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
      delete (window as any).SEN_NAVIGATE;
      delete (window as any).SEN_HUNT;
    };
  }, [navigate, artifacts, onHunt]);

  const chartOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        map: mapData,
        backgroundColor: softBackground ? "#f4ecec" : "transparent",
        style: { fontFamily: "var(--font-sans)" },
        events: {
          click: (e: any) => {
            if (!isFullscreen && onMapClick && !e.point) onMapClick();
          },
        },
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: {
        enabled: false,
        align: "center",
        verticalAlign: "bottom",
        itemStyle: {
          color: "#7a3434",
          fontSize: "12px",
          fontWeight: "600",
        },
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: { verticalAlign: "bottom", align: "right" },
        enableDoubleClickZoomTo: true,
        enableMouseWheelZoom: allowZoom,
      },
      mapView: {
        padding: isFullscreen ? [30, 30, 30, 30] : [18, 18, 18, 18],
      },
      plotOptions: {
        series: {
          animation: false,
          states: { inactive: { opacity: 1 } },
        },
      },
      tooltip: {
        useHTML: true,
        borderWidth: 1,
        borderColor: "#d86c6c",
        borderRadius: 10,
        backgroundColor: "rgba(255, 250, 248, 0.98)",
        shadow: false,
        formatter: function (this: any) {
          const p = this.point;
          if (p.series.name === EXPLORE_SERIES_NAME) {
            return `
              <div style="padding: 10px 12px; min-width: 180px;">
                <div style="font-weight: 700; color: #7a3434; margin-bottom: 4px;">${p.provinceName || p.name || "Tỉnh/Thành"}</div>
                <div style="font-size: 12px; color: #a65a5a;">${Number(p.value || 0)} di tích</div>
              </div>
            `;
          }

          if (p.isLabel || !p.id) return false;

          const image = p.image || p.thumbnail || p.mainImage || "";
          const imageUrl = getImageUrl(
            image,
            "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355948/sen_web/static/public/images/MapGame.png",
          );

          return `
            <div style="width: 260px; padding: 14px;">
              <div style="height: 130px; border-radius: 8px; overflow: hidden; margin-bottom: 10px; background: #f7e8e4;">
                <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div style="font-weight:700;color:#682f2f;font-size:15px;line-height:1.4;">${p.name || "Chưa có tên"}</div>
              <div style="font-size:12px;color:#9d6969;margin:4px 0 10px 0;">${p.province || p.siteName || ""}</div>
              <div style="display:flex;justify-content:flex-end;gap:8px;">
                <button class="ylvn-detail-btn" data-id="${p.id}" data-type="${p.type}" style="padding:6px 10px;border:1px solid #d6a3a3;background:#fff6f3;color:#8f3e3e;border-radius:6px;font-size:12px;cursor:pointer;">Chi tiết</button>
                ${
                  p.type === ITEM_TYPES.ARTIFACT
                    ? `<button class="ylvn-hunt-btn" data-id="${p.id}" style="padding:6px 10px;border:none;background:#b84a4a;color:white;border-radius:6px;font-size:12px;cursor:pointer;">Tầm bảo</button>`
                    : ""
                }
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
          affectsMapView: false,
          nullColor: "#f7ecec",
          color: "#f1e2e2",
          borderColor: "#f1dede",
          borderWidth: 0.8,
          enableMouseTracking: false,
          opacity: softBackground ? 0.55 : 0.3,
          dataLabels: { enabled: false },
        } as any,
        {
          type: "map",
          name: EXPLORE_SERIES_NAME,
          data: provinceDensityData,
          joinBy: "hc-key",
          borderColor: SVG_PALETTE.stroke,
          borderWidth: 0.5,
          nullColor: SVG_PALETTE.st5,
          states: {
            hover: {
              brightness: -0.02,
              borderColor: "#ffffff",
            },
          },
          dataLabels: {
            enabled: true,
            useHTML: true,
            formatter: function (this: any) {
              if (!showProvinceLabels) return "";
              const name = this.point.name || "";
              if (!name) return "";
              return `<span style="white-space:nowrap;color:#fff;-webkit-text-stroke:2.4px #a71a1a;paint-order:stroke;font-style:normal;font-weight:500;line-height:normal;opacity:.72;font-size:${isFullscreen ? 16 : 11}px;">${name}</span>`;
            },
            allowOverlap: true,
            crop: false,
            style: {
              textOutline: "none",
            },
          },
        } as any,
        {
          type: "mappoint",
          name: `${ITEM_TYPE_LABELS[ITEM_TYPES.HERITAGE]} Glow`,
          linkedTo: ":previous",
          enableMouseTracking: false,
          data: (locations || []).map((loc) => ({
            lat: Number(loc.lat || loc.latitude),
            lon: Number(loc.lng || loc.longitude),
          })),
          marker: {
            symbol: "circle",
            radius: 16,
            fillColor: "rgba(167,26,26,0.2)",
            lineWidth: 0,
          },
          zIndex: 4,
        } as any,
        {
          type: "mappoint",
          name: ITEM_TYPE_LABELS[ITEM_TYPES.HERITAGE],
          data: (locations || []).map((loc) => ({
            id: loc.id,
            type: loc.type || ITEM_TYPES.HERITAGE,
            name: loc.name || loc.title || "Chưa có tên",
            lat: Number(loc.lat || loc.latitude),
            lon: Number(loc.lng || loc.longitude),
            province: loc.province,
            image:
              loc.image ||
              loc.thumbnail ||
              loc.mainImage ||
              (loc.images && loc.images[0]) ||
              "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355948/sen_web/static/public/images/MapGame.png",
          })),
          marker: {
            symbol: "circle",
            radius: 7,
            fillColor: "#a71a1a",
            lineColor: "#fff",
            lineWidth: 2,
          },
          zIndex: 5,
          events: {
            click: function (this: any) {
              const id = this.id || this.options.id;
              if (id) navigate(`/heritage-sites/${id}`);
            },
          },
        } as any,
        {
          type: "mappoint",
          name: ITEM_TYPE_LABELS[ITEM_TYPES.ARTIFACT],
          data: (artifacts || []).map((art) => ({
            id: art.id,
            type: ITEM_TYPES.ARTIFACT,
            name: art.name || art.title || "Chưa có tên",
            lat: Number(art.lat || art.latitude),
            lon: Number(art.lng || art.longitude),
            siteName: art.siteName,
            image:
              art.image ||
              art.mainImage ||
              art.thumbnail ||
              (art.images && art.images[0]) ||
              "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355973/sen_web/static/public/images/Image.png",
          })),
          marker: {
            symbol: "circle",
            radius: 4.2,
            fillColor: "#fdcab6",
            lineColor: "#a71a1a",
            lineWidth: 1.2,
          },
          zIndex: 3,
          events: {
            click: function (this: any) {
              const id = this.id || this.options.id;
              if (id) navigate(`/artifacts/${id}`);
            },
          },
        } as any,
        {
          type: "mappoint",
          name: ISLAND_SPRATLY.name,
          data: ISLAND_SPRATLY.markers,
          affectsMapView: false,
          marker: { symbol: "circle", radius: 2.8, fillColor: SVG_PALETTE.st7 },
          dataLabels: {
            enabled: true,
            formatter: function (this: any) {
              return this.point.isLabel ? this.point.name : "";
            },
            style: { color: SVG_PALETTE.st7, fontWeight: "700", fontSize: "11px", textOutline: "2px #fff" },
            y: -14,
          },
          zIndex: 2,
        } as any,
        {
          type: "mappoint",
          name: ISLAND_PARACEL.name,
          data: ISLAND_PARACEL.markers,
          affectsMapView: false,
          marker: { symbol: "circle", radius: 2.8, fillColor: SVG_PALETTE.st7 },
          dataLabels: {
            enabled: true,
            formatter: function (this: any) {
              return this.point.isLabel ? this.point.name : "";
            },
            style: { color: SVG_PALETTE.st7, fontWeight: "700", fontSize: "11px", textOutline: "2px #fff" },
            y: -6,
          },
          zIndex: 2,
        } as any,
      ],
    }),
    [
      mapData,
      worldData,
      provinceDensityData,
      locations,
      artifacts,
      isFullscreen,
      allowZoom,
      onMapClick,
      navigate,
      showProvinceLabels,
      softBackground,
    ],
  );

  const updateOverlayPosition = useCallback(() => {
    if (!activeHunt || !chartRef.current?.chart) {
      setOverlayPos((prev) => (prev ? null : prev));
      return;
    }

    const chart = chartRef.current.chart;
    const pos = (chart as any).fromLatLonToPoint({ lat: activeHunt.lat, lon: activeHunt.lng });
    if (pos) setOverlayPos({ x: pos.x, y: pos.y });
  }, [activeHunt]);

  useEffect(() => {
    updateOverlayPosition();
  }, [updateOverlayPosition]);

  useEffect(() => {
    if (chartRef.current?.chart) {
      const chart = chartRef.current.chart;
      Highcharts.addEvent(chart, "render", updateOverlayPosition);
      return () => {
        Highcharts.removeEvent(chart, "render", updateOverlayPosition);
      };
    }
  }, [updateOverlayPosition]);

  useEffect(() => {
    const chart = chartRef.current?.chart;
    const targetId = autoSelectId || activeHunt?.id;
    const targetType = autoSelectType || activeHunt?.itemType;

    if (!chart || !targetId) return;

    let pointFound: any = null;
    chart.series.forEach((series: any) => {
      if (!pointFound && series.visible) {
        const matched = series.points?.find((p: any) => p.id === targetId && (p.type === targetType || !targetType));
        if (matched) pointFound = matched;
      }
    });

    if (pointFound) {
      setTimeout(() => {
        pointFound.onMouseOver();
        chart.tooltip.refresh(pointFound);
      }, 220);
    }
  }, [autoSelectId, autoSelectType, activeHunt, locations, artifacts]);

  return (
    <div className="yeulam-map-wrapper" style={{ height, width: "100%", position: "relative" }}>
      <style>{`
        .yeulam-map-wrapper .highcharts-background { rx: 0; }
        .yeulam-map-wrapper .highcharts-tooltip { pointer-events: auto !important; z-index: 9999 !important; }
        .yeulam-map-wrapper .highcharts-legend-item text { fill: #8d4a4a !important; }
        .yeulam-map-wrapper .highcharts-container { background: ${softBackground ? "#f6e9e9" : "transparent"}; }
      `}</style>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={chartOptions}
        ref={chartRef}
        containerProps={{ style: { height: "100%", width: "100%" } }}
      />

      {overlayPos && (
        <div
          className="radar-pulse-overlay"
          style={{
            position: "absolute",
            left: `${overlayPos.x}px`,
            top: `${overlayPos.y}px`,
            zIndex: 10,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};

export default ExploreMap;
