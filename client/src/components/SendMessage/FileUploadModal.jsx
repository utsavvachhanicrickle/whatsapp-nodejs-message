import Button from "../Button";
import * as pdfjsLib from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
function FileUploadModal({
  isOpen,
  file,
  setFile,
  loading,
  onUpload,
  setParsedContacts,
  onCancel,
  accept = "application/pdf",
  title = "Upload File",
}) {
  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = async () => {
      const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;

      let text = "";

      // 🔹 Extract text from PDF
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      // 🔹 Regex to match: 1. Name - 9876543210
      const matches = text.match(/\d+\.\s*([A-Za-z\s]+)\s*-\s*(\d{10})/g);

      // 🔹 Deduplication Map (key = phoneNumber)
      const uniqueContacts = new Map();

      if (matches) {
        matches.forEach((item) => {
          const m = item.match(/([A-Za-z\s]+)\s*-\s*(\d{10})/);

          if (m) {
            const name = m[1].trim();
            const phone = m[2];

            // ✅ Prevent duplicates
            if (!uniqueContacts.has(phone)) {
              uniqueContacts.set(phone, {
                name,
                phoneNumber: phone,
              });
            }
          }
        });
      }

      // 🔹 Convert Map → Array
      const contacts = Array.from(uniqueContacts.values());

      console.log("📦 Final Clean Contacts:", contacts);

      setParsedContacts(contacts);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-(--text-inverse) p-6 rounded-xl w-[90%] max-w-lg shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* DROP AREA */}
        <div
          className="border-2 border-dashed border-(--border) rounded-lg p-6 text-center cursor-pointer hover:bg-(--bg-secondary) transition"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <p className="text-(--text-secondary)">
            {file ? "File selected" : "Click or Drag & Drop file here"}
          </p>

          <input
            id="fileInput"
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* FILE PREVIEW */}
        {file && (
          <div className="mt-3 p-3 border rounded bg-(--bg-secondary)">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-(--text-secondary)">
              {(file.size / 1024).toFixed(2)} KB
            </p>

            <Button
              variant="danger"
              className="mt-2"
              onClick={() => setFile(null)}
            >
              Remove
            </Button>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            onClick={onUpload}
            disabled={!file || loading}
            className="px-4 py-2 rounded bg-(--btn-primary-bg) text-white disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FileUploadModal;
