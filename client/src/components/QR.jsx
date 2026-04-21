function QR({ qr }) {
  if (!qr) return null;

  return (
    <div>
      <h3>Scan QR</h3>
      <img src={qr} alt="QR Code" width={300} />
    </div>
  );
}

export default QR;