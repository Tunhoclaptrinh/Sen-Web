import React from "react";
import "./styles.css";
import background_full from "@/assets/images/background/background-full.png";
import background_nothing from "@/assets/images/background/background-nothing.png";
import bronze_drum from "@/assets/images/background/bronze-drum.png";
import lotus_1 from "@/assets/images/background/lotus-1.png";
import lotus_2 from "@/assets/images/background/lotus-2.png";
import lotus_3 from "@/assets/images/background/lotus-3.png";
import smoke_left from "@/assets/images/background/smoke-left.png";
import smoke_right from "@/assets/images/background/smoke-right.png";
import leaf from "@/assets/images/background/leaf.png";
import bird from "@/assets/images/background/bird.png";

interface BackgroundProps {
  children?: React.ReactNode;

  showDrum?: boolean;
  showLotus?: boolean;
  showSmoke?: boolean;
  useFullBackground?: boolean;
}

const Background: React.FC<BackgroundProps> = ({
  children,

  showDrum = true,
  showLotus = true,
  showSmoke = true,
  useFullBackground = false,
}) => {
  return (
    <div className="bg-wrapper">
      {/* Main Background */}
      <img
        className="bg-layer bg-base"
        src={useFullBackground ? background_full : background_nothing}
        alt="background"
      />

      {/* Birds */}
      {showSmoke && (
        <>
          <img className="bg-layer bird " src={`${bird}`} />
        </>
      )}

      {/* Bronze Drum */}
      {showDrum && (
        <img
          className="bg-layer drum"
          src={`${bronze_drum}`}
          alt="bronze drum"
        />
      )}

      {/* Leaf layer (between background & lotus) */}
      <img className="bg-layer leaf" src={leaf} alt="leaf" />

      {/* Lotus group */}
      {showLotus && (
        <>
          <img className="bg-layer lotus lotus-1" src={`${lotus_1}`} />
          <img className="bg-layer lotus lotus-2" src={`${lotus_2}`} />
          <img className="bg-layer lotus lotus-3" src={`${lotus_3}`} />
        </>
      )}

      {/* Smoke effects */}
      {showSmoke && (
        <>
          <img className="bg-layer smoke-left " src={`${smoke_left}`} />
          <img className="bg-layer smoke-right" src={`${smoke_right}`} />
        </>
      )}

      {/* Content */}
      <div className="bg-content">{children}</div>
    </div>
  );
};

export default Background;
