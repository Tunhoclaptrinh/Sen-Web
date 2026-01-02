import React, { CSSProperties } from "react";
import "./styles.less";

import background_full from "@/assets/images/background/background-full.png";
// import background_nothing from "@/assets/images/background/background-nothing.png";
import background_nothing from "@/assets/images/background/background-red.png";
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

  /** Background */
  useFullBackground?: boolean;
  showBase?: boolean;

  /** Elements */
  showBird?: boolean;
  showDrum?: boolean;
  showLeaf?: boolean;

  /** Lotus */
  showLotus?: boolean;
  showLotus1?: boolean;
  showLotus2?: boolean;
  showLotus3?: boolean;

  /** Smoke */
  showSmoke?: boolean;
  showSmokeLeft?: boolean;
  showSmokeRight?: boolean;

  /** Custom style */
  wrapperStyle?: CSSProperties;
  contentStyle?: CSSProperties;
}

const Background: React.FC<BackgroundProps> = ({
  children,

  useFullBackground = false,
  showBase = true,

  showBird = true,
  showDrum = true,
  showLeaf = true,

  showLotus = true,
  showLotus1 = true,
  showLotus2 = true,
  showLotus3 = true,

  showSmoke = true,
  showSmokeLeft = true,
  showSmokeRight = true,

  wrapperStyle,
  contentStyle,
}) => {
  return (
    <div className="bg-wrapper" style={wrapperStyle}>
      {/* Base Background */}
      {showBase && (
        <img
          className="bg-layer bg-base"
          src={useFullBackground ? background_full : background_nothing}
          alt="background"
        />
      )}

      {/* Bird */}
      {showBird && <img className="bg-layer bird" src={bird} alt="bird" />}

      {/* Drum */}
      {showDrum && (
        <img className="bg-layer drum" src={bronze_drum} alt="bronze drum" />
      )}

      {/* Leaf */}
      {showLeaf && <img className="bg-layer leaf" src={leaf} alt="leaf" />}

      {/* Lotus */}
      {showLotus && (
        <>
          {showLotus1 && (
            <img
              className="bg-layer lotus lotus-1"
              src={lotus_1}
              alt="lotus 1"
            />
          )}
          {showLotus2 && (
            <img
              className="bg-layer lotus lotus-2"
              src={lotus_2}
              alt="lotus 2"
            />
          )}
          {showLotus3 && (
            <img
              className="bg-layer lotus lotus-3"
              src={lotus_3}
              alt="lotus 3"
            />
          )}
        </>
      )}

      {/* Smoke */}
      {(showSmoke || showSmokeLeft) && showSmokeLeft && (
        <img
          className="bg-layer smoke-left"
          src={smoke_left}
          alt="smoke left"
        />
      )}

      {(showSmoke || showSmokeRight) && showSmokeRight && (
        <img
          className="bg-layer smoke-right"
          src={smoke_right}
          alt="smoke right"
        />
      )}

      {/* Content */}
      <div className="bg-content" style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default Background;
