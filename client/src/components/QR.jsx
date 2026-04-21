function QR({ qr }) {
  if (!qr) return null;

  return (
    <div className="flex flex-col items-center justify-center bg-(--card) p-6 rounded-2xl shadow-md border border-(--border)">

      <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>

      <div className="bg-white p-4 rounded-xl">
        <img src={qr} alt="QR Code" className="w-64 h-64" />
      </div>

      <p className="text-sm text-(--muted) mt-4 text-center">
        Open WhatsApp → Linked Devices → Scan QR
      </p>
    </div>
  );
}

export default QR;