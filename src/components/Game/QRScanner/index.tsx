import React, {useEffect} from "react";
import {Html5QrcodeScanner} from "html5-qrcode";
import {Typography} from "antd";

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
        fps: 10,
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
    <div style={{width: "100%", maxWidth: "500px", margin: "0 auto"}}>
      <div id="reader" style={{width: "100%"}}></div>
      <div style={{textAlign: "center", marginTop: 16}}>
        <Text type="secondary">Hướng camera vào mã QR để quét</Text>
      </div>
    </div>
  );
};

export default QRScanner;
