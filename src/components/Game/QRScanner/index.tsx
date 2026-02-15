import React, {useEffect} from "react";
import {Html5QrcodeScanner} from "html5-qrcode";
import {Typography} from "antd";
import "./styles.less";

const {Text} = Typography;

interface QRScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({onScanSuccess, onScanFailure}) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 15,
        qrbox: {width: 250, height: 250},
        aspectRatio: 1.0,
      },
      /* verbose= */ false,
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((error: any) => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="scanner-root">
      <div className="scanner-wrapper">
        <div id="reader"></div>
        <div className="scanner-overlay">
          <div className="scanner-frame">
            <div className="scanner-corners-2" />
            <div className="scanning-line" />
          </div>
        </div>
      </div>
      <div className="scanner-hint">
        <Text>Hướng ống kính vào mật mã để khám phá di sản</Text>
      </div>
    </div>
  );
};

export default QRScanner;
