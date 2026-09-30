import { QRCodeSVG } from "qrcode.react";

export default function QRCode({ shortUrl }) {
  return (
    <QRCodeSVG
      value={shortUrl}
      size={300}
      level="H"
    />
  );
}