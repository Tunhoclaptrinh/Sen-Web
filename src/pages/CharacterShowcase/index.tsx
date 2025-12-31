import { Modal, Checkbox, Button } from "antd";
import { useState } from "react";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
// @ts-ignore
import Draggable from "react-draggable";

const characterImg = "https://placehold.co/300x400?text=Character";
const hatImg = "https://placehold.co/100x100?text=Hat";
const glassesImg = "https://placehold.co/100x50?text=Glasses";
const bagImg = "https://placehold.co/100x100?text=Bag";
const coatImg = "https://placehold.co/200x200?text=Coat";

const CharacterShowcase = ({ isVisible = false, setIsVisible = () => { } }: { isVisible?: boolean, setIsVisible?: (v: boolean) => void }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [accessories, setAccessories] = useState({
    hat: false,
    glasses: false,
    bag: false,
    coat: false,
  });

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const toggleAccessory = (key: any) => {
    setAccessories((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal
      title="Character Showcase"
      open={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      width={800}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {/* Character View Area */}
        <div
          style={{
            flex: 2,
            height: 400,
            border: "1px dashed #ccc",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f2f5",
          }}
        >
          <Draggable
            position={position}
            onStop={(_: any, data: any) => setPosition({ x: data.x, y: data.y })}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transition: "transform 0.2s",
                position: "relative",
              }}
            >
              <img
                src={characterImg}
                alt="Character"
                style={{ height: 300, pointerEvents: "none" }}
              />
              {accessories.hat && (
                <img
                  src={hatImg}
                  alt="Hat"
                  style={{
                    position: "absolute",
                    top: -20,
                    left: 40,
                    width: 80,
                  }}
                />
              )}
              {accessories.glasses && (
                <img
                  src={glassesImg}
                  alt="Glasses"
                  style={{
                    position: 'absolute',
                    top: 40,
                    left: 45,
                    width: 60
                  }}
                />
              )}
              {accessories.bag && (
                <img
                  src={bagImg}
                  alt="Bag"
                  style={{
                    position: 'absolute',
                    top: 100,
                    right: -20,
                    width: 80
                  }}
                />
              )}
              {accessories.coat && (
                <img
                  src={coatImg}
                  alt="Coat"
                  style={{
                    position: 'absolute',
                    top: 80,
                    left: 10,
                    width: 140,
                    zIndex: -1
                  }}
                />
              )}
            </div>
          </Draggable>

          {/* Zoom Controls */}
          <div
            style={{ position: "absolute", bottom: 10, right: 10, zIndex: 10 }}
          >
            <Button
              icon={<ZoomInOutlined />}
              onClick={handleZoomIn}
              style={{ marginRight: 5 }}
            />
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex: 1 }}>
          <h3>Accessories</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Checkbox
              checked={accessories.hat}
              onChange={() => toggleAccessory("hat")}
            >
              Hat
            </Checkbox>
            <Checkbox
              checked={accessories.glasses}
              onChange={() => toggleAccessory("glasses")}
            >
              Glasses
            </Checkbox>
            <Checkbox
              checked={accessories.bag}
              onChange={() => toggleAccessory("bag")}
            >
              Bag
            </Checkbox>
            <Checkbox
              checked={accessories.coat}
              onChange={() => toggleAccessory("coat")}
            >
              Coat
            </Checkbox>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CharacterShowcase;
