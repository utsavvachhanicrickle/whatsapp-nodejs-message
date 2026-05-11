import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";

function QRModal({ qr, onClose }) {
  if (!qr) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-(--bg-primary) w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row">
        {/* Left Side: Instructions */}
        <div className="flex-1 p-8 md:p-12 bg-(--bg-secondary)/30">
          <h2 className="text-2xl font-light text-(--text-primary) mb-8">
            To use WhatsApp on your computer:
          </h2>
          <ol className="space-y-6 text-(--text-secondary) list-decimal list-inside marker:text-(--text-primary) marker:font-semibold">
            <li className="pl-2 leading-relaxed">
              Open WhatsApp on your phone
            </li>
            <li className="pl-2 leading-relaxed">
              Tap <span className="font-semibold text-(--text-primary)">Menu</span> <MoreVertIcon fontSize="small" /> or <span className="font-semibold text-(--text-primary)">Settings</span> <SettingsIcon fontSize="small" /> and select <span className="font-semibold text-(--text-primary)">Linked Devices</span>
            </li>
            <li className="pl-2 leading-relaxed">
              Tap on <span className="font-semibold text-(--text-primary)">Link a Device</span>
            </li>
            <li className="pl-2 leading-relaxed">
              Point your phone to this screen to capture the QR code
            </li>
          </ol>
          
          <div className="mt-12 pt-8 border-t border-(--border)">
            <a href="#" className="text-(--primary) hover:underline text-sm font-medium">Need help to get started?</a>
          </div>
        </div>

        {/* Right Side: QR Code */}
        <div className="w-full md:w-80 bg-white p-12 flex flex-col items-center justify-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
          >
            <CloseIcon />
          </button>
          
          <div className="relative p-2 bg-white rounded-lg whatsapp-shadow">
            <img src={qr} alt="WhatsApp QR Code" className="w-56 h-56" />
            <div className="absolute inset-0 border-2 border-(--primary)/20 rounded-lg pointer-events-none" />
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-gray-500">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-xs font-medium uppercase tracking-wider">Waiting for scan</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRModal;
