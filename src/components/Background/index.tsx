import React from "react";
import "./styles.less";

const background_full = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355993/sen_web/static/src/assets/images/background/background-full.jpg";
// const background_nothing = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356010/sen_web/static/src/assets/images/background/background-nothing.jpg";
const background_nothing = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356021/sen_web/static/src/assets/images/background/background-red.jpg";
const bronze_drum = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356033/sen_web/static/src/assets/images/background/bronze-drum.png";
const lotus_1 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356040/sen_web/static/src/assets/images/background/lotus-1.png";
const lotus_2 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356043/sen_web/static/src/assets/images/background/lotus-2.png";
const lotus_3 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356045/sen_web/static/src/assets/images/background/lotus-3.png";
const smoke_left = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356055/sen_web/static/src/assets/images/background/smoke-left.png";
const smoke_right = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356059/sen_web/static/src/assets/images/background/smoke-right.png";
const leaf = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356037/sen_web/static/src/assets/images/background/leaf.png";
const bird = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356024/sen_web/static/src/assets/images/background/bird.png";
import { BackgroundProps } from "./types";

const Background: React.FC<BackgroundProps> = ({
  className,
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
    <div className={"bg-wrapper" + (className ? " " + className : "")} style={wrapperStyle}>
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
