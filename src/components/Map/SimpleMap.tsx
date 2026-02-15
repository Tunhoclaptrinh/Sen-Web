import React, {useEffect, useMemo, useRef} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMap from "highcharts/modules/map";
import proj4 from "proj4";
import {useNavigate} from "react-router-dom";
import {ITEM_TYPES, ISLAND_SPRATLY, ISLAND_PARACEL, ITEM_TYPE_LABELS} from "@/config/constants";

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
      setTimeout(() => {
        chartRef.current?.chart.reflow();
      }, 100);
    }
  }, [isFullscreen, height]);

  const chartOptions: Highcharts.Options = useMemo(
    () => ({
      chart: {
        map: mapData,
        backgroundColor: "transparent",
        // height: height, // Remove literal 'vh' height from options, let it reflow based on container
        style: {
          fontFamily: "var(--font-sans)",
        },
        events: {
          click: function () {
            if (onMapClick) onMapClick();
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
        padding: isFullscreen ? [60, 60, 60, 60] : [80, 80, 80, 80], // Revert to original beautiful padding
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
          if (p.isLabel || p.type === "map") return false;

          const image = p.image || "";
          const hasImage = image && !image.includes("placeholder");

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
          className: "faded-world-map",
          affectsMapView: false,
          borderColor: "#d0d0d0",
          nullColor: "#f0f0f0",
          color: "#f0f0f0",
          enableMouseTracking: false,
          borderWidth: 1,
          dataLabels: {enabled: false},
          states: {
            inactive: {opacity: 0.6},
          },
        },
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
        },
        {
          type: "mappoint",
          name: ITEM_TYPE_LABELS[ITEM_TYPES.HERITAGE],
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
          name: ITEM_TYPE_LABELS[ITEM_TYPES.ARTIFACT],
          color: "#faad14",
          data: artifacts.map((art) => ({
            name: art.name,
            lat: art.lat,
            lon: art.lng,
            siteName: art.siteName,
            id: art.id,
            type: ITEM_TYPES.ARTIFACT,
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
                  [111.0, 17.0],
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
                  [113.0, 12.0],
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
    }),
    [mapData, worldData, locations, artifacts, isFullscreen, height, allowZoom, onMapClick, navigate],
  );

  return (
    <HighchartsReact
      highcharts={Highcharts}
      constructorType={"mapChart"}
      options={chartOptions}
      ref={chartRef}
      containerProps={{style: {height: height, width: "100%"}}}
    />
  );
};

export default SimpleMap;
