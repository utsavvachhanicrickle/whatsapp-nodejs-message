import Button from "../Button";
import * as pdfjsLib from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.min?url";
import * as XLSX from "xlsx";
import Papa from "papaparse";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;

function FileUploadModal({
  isOpen,
  file,
  setFile,
  loading,
  onUpload,
  setParsedContacts,
  onCancel,
  accept = ".pdf,.csv,.xlsx,.xls",
  title = "Upload File",
}) {
  if (!isOpen) return null;

  const normalizeContacts = (rows) => {
    const map = new Map();

    rows.forEach((row) => {
      let name = row.name?.trim();
      let phone = String(row.phoneNumber || "").replace(/\D/g, "");

      if (phone.length === 12 && phone.startsWith("91")) {
        phone = phone.slice(2);
      }

      if (name && /^\d{10}$/.test(phone)) {
        if (!map.has(phone)) {
          map.set(phone, { name, phoneNumber: phone });
        }
      }
    });

    return Array.from(map.values());
  };

  const parsePDF = async (fileBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text += content.items.map((item) => item.str).join(" ") + "\n";
    }

    const matches = text.match(/\d+\.\s*([A-Za-z\s]+)\s*-\s*(\d{10})/g);

    const rows = [];

    if (matches) {
      matches.forEach((item) => {
        const m = item.match(/([A-Za-z\s]+)\s*-\s*(\d{10})/);
        if (m) {
          rows.push({
            name: m[1],
            phoneNumber: m[2],
          });
        }
      });
    }

    return normalizeContacts(rows);
  };


  const parseCSV = (file) => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data.map((r) => {
            const keys = Object.keys(r).reduce((acc, key) => {
              acc[key.toLowerCase().replace(/\s/g, "")] = r[key];
              return acc;
            }, {});

            return {
              name: keys.name,
              phoneNumber:
                keys.phonenumber || keys.phone || keys.mobile || keys.number,
            };
          });

          resolve(normalizeContacts(rows));
        },
      });
    });
  };


  const parseExcel = async (fileBuffer) => {
    const workbook = XLSX.read(fileBuffer, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const rows = data.map((r) => ({
      name: r.name || r.Name,
      phoneNumber: r.phoneNumber || r.phone || r.mobile,
    }));

    return normalizeContacts(rows);
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = async () => {
      let contacts = [];

      try {
        if (selectedFile.type === "application/pdf") {
          contacts = await parsePDF(reader.result);
        } else if (selectedFile.type.includes("csv")) {
          contacts = await parseCSV(selectedFile);
        } else if (
          selectedFile.type.includes("sheet") ||
          selectedFile.name.endsWith(".xlsx") ||
          selectedFile.name.endsWith(".xls")
        ) {
          contacts = await parseExcel(reader.result);
        } else {
          alert("Unsupported file type");
          return;
        }

        console.log("✅ Final Contacts:", contacts);

        if (contacts.length === 0) {
          alert("No valid contacts found");
        }

        setParsedContacts(contacts);
      } catch (err) {
        console.error(err);
        alert("File parsing failed");
      }
    };

    if (selectedFile.type === "application/pdf") {
      reader.readAsArrayBuffer(selectedFile);
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-(--text-inverse) p-6 rounded-xl w-[90%] max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        {/* DROP AREA */}
        <div
          className="border-2 border-dashed border-(--border) rounded-lg p-6 text-center cursor-pointer hover:bg-(--bg-secondary)"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <p className="text-(--text-secondary)">
            {file ? "File selected" : "Upload PDF / CSV / Excel"}
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
            className="px-4 py-2 rounded bg-(--btn-primary-bg) text-white"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FileUploadModal;
