import React from "react";
import PosterPage from "@/pages/Poster";
import "./styles.less";

const POSTER_BASE_WIDTH = 841;
const POSTER_BASE_HEIGHT = 1189;

const PosterOnlyPage: React.FC = () => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const updateScale = () => {
      const widthScale = window.innerWidth / POSTER_BASE_WIDTH;
      setScale(widthScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <main className="poster-only-page">
      <div
        className="poster-only-stage-shell"
        style={{
          width: POSTER_BASE_WIDTH * scale,
          height: POSTER_BASE_HEIGHT * scale,
        }}
      >
        <div
          className="poster-only-stage"
          style={{
            width: POSTER_BASE_WIDTH,
            height: POSTER_BASE_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <PosterPage standalone />
        </div>
      </div>
    </main>
  );
};

export default PosterOnlyPage;
