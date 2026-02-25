import React, {useEffect, useMemo, useRef} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import proj4 from "proj4";
import {useNavigate} from "react-router-dom";
import {ITEM_TYPES, ISLAND_SPRATLY, ISLAND_PARACEL, ITEM_TYPE_LABELS} from "@/config/constants";
import {getImageUrl} from "@/utils/image.helper";

// Initialize proj4 for Highcharts
if (typeof window !== "undefined") {
  (window as any).proj4 = proj4;
}

// Initialize the map module
try {
  if (typeof highchartsMap === "function") {
    (highchartsMap as any)(Highcharts);
  }
} catch (e) {
  console.error("Failed to initialize Highcharts Map module", e);
}

// Bypassing Highcharts AST sanitizer for custom attributes and onclick
if (Highcharts && Highcharts.AST) {
  Highcharts.AST.allowedAttributes.push('data-id');
  Highcharts.AST.allowedAttributes.push('data-type');
  Highcharts.AST.allowedAttributes.push('onclick');
}

interface SimpleMapProps {
  mapData: any;
  worldData: any;
  locations: any[];
  artifacts: any[];
  isFullscreen?: boolean;
  allowZoom?: boolean;
  height?: string | number;
  onMapClick?: () => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  mapData,
  worldData,
  locations,
  artifacts,
  isFullscreen = false,
  allowZoom = false,
  height = "100%",
  onMapClick,
}) => {
  const navigate = useNavigate();
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  // Reflow chart when fullscreen state or height changes
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const timer = setTimeout(() => {
        chartRef.current?.chart.reflow();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, height]);

  // Failsafe Global Navigation Bridge
  useEffect(() => {
    console.log("!!! SEN_NAVIGATE BRIDGE INITIALIZING !!!");
    
    (window as any).SEN_NAVIGATE = (id: string, type: string) => {
      console.log(`!!! [SEN_NAVIGATE] EXECUTING !!! id=${id}, type=${type}`);
      if (!id || id === 'undefined') {
        console.error("!!! [SEN_NAVIGATE] ERROR: ID is missing or undefined !!!");
        return;
      }
      if (type === ITEM_TYPES.ARTIFACT) {
        navigate(`/artifacts/${id}`);
      } else {
        navigate(`/heritage-sites/${id}`);
      }
    };

    // Global Catch-all Click Debugger (Capture phase)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Broad log for debugging what's blocking clicks
      console.log("!!! RAW DOCUMENT CLICK !!!", target);
      
      const btn = target.closest(".view-details-btn") as HTMLElement;
      if (btn) {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const type = btn.getAttribute("data-type");
        console.log("!!! DETECTED CLICK ON VIEW-DETAILS-BTN !!!", { id, type });
        if (id && (window as any).SEN_NAVIGATE) {
          (window as any).SEN_NAVIGATE(id, type);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
      delete (window as any).SEN_NAVIGATE;
    };
  }, [navigate]);

  const chartOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        map: mapData,
        backgroundColor: "transparent",
        style: {
          fontFamily: "var(--font-sans)",
        },
        events: {
          click: function (e: any) {
            // Only trigger fullscreen if not already in fullscreen and click is on background
            if (!isFullscreen && onMapClick && !e.point) {
              onMapClick();
            }
          },
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
        enableMouseWheelZoom: allowZoom,
      },
      mapView: {
        padding: isFullscreen ? [60, 60, 60, 60] : [80, 80, 80, 80],
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#d9363e",
        borderRadius: 8,
        borderWidth: 1,
        shadow: true,
        useHTML: true,
        padding: 0,
        style: {
          pointerEvents: "auto",
        },
        formatter: function (this: any) {
          const p = this.point;
          console.log("!!! FORMATTER POINT DATA !!!", { id: p.id, type: p.type, name: p.name });
          if (p.isLabel || p.series.type === "map" || p.series.name === "World" || p.series.name === "Vietnam") return false;

          const image = p.image || p.thumbnail || p.mainImage || "";
          const fullImageUrl = getImageUrl(image, "/images/placeholder-heritage.jpg");
          const hasImage = fullImageUrl && !fullImageUrl.includes("placeholder");
          const pointName = p.name || p.title || "Chưa có tên";

          const imgHtml = hasImage
            ? `<div style="height: 160px; width: 100%; border-radius: 8px; overflow: hidden; margin-bottom: 12px; background: #f0f0f0;">
                  <img src="${fullImageUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/images/placeholder-heritage.jpg'; this.onerror=null;"/>
                 </div>`
            : "";

          return `
          <div style="width: 280px; padding: 16px; pointer-events: auto;">
              ${imgHtml}
              <div style="font-family: var(--font-sans);">
                  <b style="font-size: 16px; color: var(--text-color-primary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; line-height: 1.4;">${pointName}</b>
                  <span style="font-size: 13px; color: var(--text-color-secondary); display: block; margin-bottom: 12px;">${p.province || p.siteName || ""}</span>
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <i style="font-size: 12px; color: var(--seal-red);">${p.series.name}</i>
                    <button 
                      class="view-details-btn"
                      data-id="${p.id}"
                      data-type="${p.type}"
                      onclick="if(window.SEN_NAVIGATE) window.SEN_NAVIGATE('${p.id}', '${p.type}')"
                      style="padding: 6px 12px; background: var(--gold-color); color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 600; pointer-events: auto !important;"
                    >
                      Xem chi tiết
                    </button>
                  </div>
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
          className: "faded-world-map",
          affectsMapView: false,
          borderColor: "#d0d0d0",
          nullColor: "#f0f0f0",
          color: "#f0f0f0",
          enableMouseTracking: false,
          borderWidth: 1,
          dataLabels: {enabled: false},
        } as any,
        {
          type: "map",
          name: "Vietnam",
          data: mapData,
          borderColor: "#d9363e",
          borderWidth: 1,
          color: "#fdf6e3",
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
              color: "rgba(139, 69, 19, 0.5)",
              fontWeight: "normal",
              textOutline: "none",
            },
          },
        } as any,
        {
          type: "mappoint",
          name: ITEM_TYPE_LABELS[ITEM_TYPES.HERITAGE],
          color: "#d9363e",
          data: (locations || []).map((loc) => ({
            name: loc.name || loc.title || "Chưa có tên",
            lat: Number(loc.lat || loc.latitude),
            lon: Number(loc.lng || loc.longitude),
            province: loc.province,
            id: loc.id,
            type: loc.type || ITEM_TYPES.HERITAGE,
            image: loc.image || loc.thumbnail || loc.mainImage || (loc.images && loc.images[0]) || "/images/placeholder-heritage.jpg",
          })),
          marker: {
            symbol: "diamond",
            radius: 9,
            fillColor: "#d9363e",
            lineWidth: 2,
            lineColor: "#fff",
          },
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
          color: "#faad14",
          data: (artifacts || []).map((art) => ({
            name: art.name || art.title || "Chưa có tên",
            lat: Number(art.lat || art.latitude),
            lon: Number(art.lng || art.longitude),
            siteName: art.siteName,
            id: art.id,
            type: ITEM_TYPES.ARTIFACT,
            image: art.image || art.mainImage || art.thumbnail || (art.images && art.images[0]) || "/images/placeholder-artifact.jpg",
          })),
          marker: {
            symbol: "diamond",
            radius: 9,
            fillColor: "#faad14",
            lineWidth: 2,
            lineColor: "#fff",
          },
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
          color: "#d9363e",
          data: ISLAND_SPRATLY.markers,
          marker: {
            symbol: "circle",
            radius: 3,
            fillColor: "#d9363e",
          },
          dataLabels: {
            enabled: true,
            formatter: function (this: any) {
              return this.point.isLabel ? this.point.name : "";
            },
            style: {
              color: "#d9363e",
              fontWeight: "bold",
              fontSize: "12px",
              textOutline: "2px white",
            },
            y: -15,
          },
        } as any,
        {
          type: "mappoint",
          name: ISLAND_PARACEL.name,
          color: "#d9363e",
          data: ISLAND_PARACEL.markers,
          marker: {
            symbol: "circle",
            radius: 3,
            fillColor: "#d9363e",
          },
          dataLabels: {
            enabled: true,
            formatter: function (this: any) {
              return this.point.isLabel ? this.point.name : "";
            },
            style: {
              color: "#d9363e",
              fontWeight: "bold",
              fontSize: "12px",
              textOutline: "2px white",
            },
            y: -5,
          },
        } as any,
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
                  [111.0, 17.0], [113.2, 17.0], [113.2, 15.5], [111.0, 15.5], [111.0, 17.0],
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
                  [113.0, 12.0], [115.0, 12.0], [115.0, 7.5], [111.5, 7.5], [111.5, 9.0], [113.0, 12.0],
                ],
              },
              color: "#d9363e",
              dashStyle: "ShortDot",
              lineWidth: 1.5,
            },
          ],
        } as any,
      ],
    }),
    [mapData, worldData, locations, artifacts, isFullscreen, height, allowZoom, onMapClick, navigate],
  );

  return (
    <div className="simple-map-wrapper" style={{height: height, width: "100%", position: "relative"}}>
      <style>{`
        .highcharts-tooltip {
          pointer-events: auto !important;
          z-index: 9999 !important;
          transition: none !important;
        }
        .highcharts-tooltip-container {
          pointer-events: auto !important;
          z-index: 9999 !important;
        }
      `}</style>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={"mapChart"}
        options={chartOptions}
        ref={chartRef}
        containerProps={{style: {height: "100%", width: "100%"}}}
      />
    </div>
  );
};

export default SimpleMap;
