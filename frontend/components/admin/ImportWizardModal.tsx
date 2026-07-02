import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportWizardModal({ isOpen, onClose, onSuccess }: ImportWizardModalProps) {
  const [step, setStep] = useState(1);
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationReport, setValidationReport] = useState<any>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    window.open("http://localhost:8000/api/v1/admin/import/template", "_blank");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSpreadsheet = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      setSpreadsheetFile(file);
      setErrorMessage(null);
    } else {
      setErrorMessage("Please drop a valid .csv or .xlsx spreadsheet file.");
    }
  };

  const handleDropZip = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".zip")) {
      setZipFile(file);
      setErrorMessage(null);
    } else {
      setErrorMessage("Please drop a valid .zip image archive.");
    }
  };

  const startValidation = async () => {
    if (!spreadsheetFile) return;
    setIsValidating(true);
    setErrorMessage(null);
    setStep(3);

    const formData = new FormData();
    formData.append("file", spreadsheetFile);
    if (zipFile) {
      formData.append("images_zip", zipFile);
    }

    try {
      const res = await apiFetch<any>("/admin/import/validate", {
        method: "POST",
        body: formData
      });
      setValidationReport(res);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to validate imported data.");
      setStep(1);
    } finally {
      setIsValidating(false);
    }
  };

  const executeImport = async () => {
    if (!spreadsheetFile) return;
    setIsImporting(true);
    setErrorMessage(null);
    setStep(5);

    const formData = new FormData();
    formData.append("file", spreadsheetFile);
    if (zipFile) {
      formData.append("images_zip", zipFile);
    }

    try {
      const res = await apiFetch<any>("/admin/import/execute", {
        method: "POST",
        body: formData
      });
      setImportResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Import execution encountered critical failures.");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadErrorReport = () => {
    if (!validationReport?.errors) return;
    
    let csvContent = "data:text/csv;charset=utf-8,Row,SKU,Type,Error Message,Suggested Fix\n";
    validationReport.errors.forEach((err: any) => {
      csvContent += `${err.row},"${err.sku}","${err.error_type}","${err.message.replace(/"/g, '""')}","${err.suggested_fix.replace(/"/g, '""')}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `validation_errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-border w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl rounded-sm">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-secondary">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-neutral-900">Bulk Product Import Wizard</span>
            <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Enterprise Catalog Sync</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-800 transition-colors uppercase text-xs font-bold tracking-widest"
          >
            Close ✕
          </button>
        </div>

        {/* Steps Bar */}
        <div className="bg-neutral-50 border-b border-secondary flex justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          <div className={`flex-1 text-center py-2 border-r ${step === 1 ? "bg-white text-black border-b-2 border-b-black" : ""}`}>1. Upload Spreadsheet</div>
          <div className={`flex-1 text-center py-2 border-r ${step === 2 ? "bg-white text-black border-b-2 border-b-black" : ""}`}>2. Upload Images ZIP</div>
          <div className={`flex-1 text-center py-2 border-r ${step === 3 ? "bg-white text-black border-b-2 border-b-black" : ""}`}>3. Validate Data</div>
          <div className={`flex-1 text-center py-2 border-r ${step === 4 ? "bg-white text-black border-b-2 border-b-black" : ""}`}>4. Preview & Score</div>
          <div className={`flex-1 text-center py-2 ${step === 5 ? "bg-white text-black border-b-2 border-b-black" : ""}`}>5. Finish Import</div>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-6 overflow-y-auto min-h-[300px]">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-sm mb-4">
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-6 items-center py-8">
              <div className="text-center max-w-lg">
                <h3 className="font-serif text-base font-bold mb-1">Select Excel or CSV Spreadsheet</h3>
                <p className="text-neutral-500 text-xs">
                  Your file must follow the standard headers map (SKU, Product Name, Brand, Category, Price, etc.).
                </p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropSpreadsheet}
                className="w-full max-w-lg h-48 border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100/50 flex flex-col justify-center items-center transition-colors cursor-pointer rounded-sm"
              >
                <span className="text-xs font-bold uppercase tracking-wider mb-2">Drag & Drop file here</span>
                <span className="text-[10px] text-neutral-400">or click below to select from your files</span>
                <input 
                  type="file" 
                  accept=".csv, .xlsx" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSpreadsheetFile(file);
                  }}
                  className="mt-4 text-xs font-medium text-neutral-500"
                />
              </div>

              {spreadsheetFile && (
                <div className="bg-neutral-100 border border-neutral-200 px-4 py-2 text-xs flex justify-between items-center w-full max-w-lg rounded-sm">
                  <span>📄 <strong className="font-semibold text-neutral-800">{spreadsheetFile.name}</strong> ({(spreadsheetFile.size/1024).toFixed(1)} KB)</span>
                  <button onClick={() => setSpreadsheetFile(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={handleDownloadTemplate}
                  className="border border-neutral-800 text-neutral-800 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 transition-colors rounded-sm"
                >
                  Download Import Template
                </button>
                <button 
                  disabled={!spreadsheetFile}
                  onClick={() => setStep(2)}
                  className="bg-black text-white disabled:bg-neutral-300 hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 transition-colors rounded-sm"
                >
                  Continue to ZIP Upload
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-6 items-center py-8">
              <div className="text-center max-w-lg">
                <h3 className="font-serif text-base font-bold mb-1">Upload Product Banners ZIP Archive</h3>
                <p className="text-neutral-500 text-xs">
                  (Optional) Auto-match folder images to products using SKU names (e.g. <code>ATL-0010/front.jpg</code>).
                </p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDrop={handleDropZip}
                className="w-full max-w-lg h-48 border-2 border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100/50 flex flex-col justify-center items-center transition-colors cursor-pointer rounded-sm"
              >
                <span className="text-xs font-bold uppercase tracking-wider mb-2">Drag & Drop ZIP file here</span>
                <span className="text-[10px] text-neutral-400">or click below to select file</span>
                <input 
                  type="file" 
                  accept=".zip" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setZipFile(file);
                  }}
                  className="mt-4 text-xs font-medium text-neutral-500"
                />
              </div>

              {zipFile && (
                <div className="bg-neutral-100 border border-neutral-200 px-4 py-2 text-xs flex justify-between items-center w-full max-w-lg rounded-sm">
                  <span>📦 <strong className="font-semibold text-neutral-800">{zipFile.name}</strong> ({(zipFile.size/(1024*1024)).toFixed(1)} MB)</span>
                  <button onClick={() => setZipFile(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="border border-neutral-800 text-neutral-800 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 transition-colors rounded-sm"
                >
                  Back
                </button>
                <button 
                  onClick={startValidation}
                  className="bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-6 py-2.5 transition-colors rounded-sm"
                >
                  Validate Uploaded Data
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 (Validation Loading) */}
          {step === 3 && (
            <div className="flex flex-col gap-6 items-center justify-center py-16">
              <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h4 className="font-serif text-sm font-bold uppercase tracking-widest mb-1">Analyzing catalog files</h4>
                <p className="text-neutral-500 text-xs">Comparing SKU matches, checking prices format, and optimizing ZIP graphics...</p>
              </div>
            </div>
          )}

          {/* STEP 4 (Preview Report) */}
          {step === 4 && validationReport && (
            <div className="flex flex-col gap-6">
              {/* Readiness Card */}
              <div className="bg-neutral-50 border border-secondary p-5 grid grid-cols-1 md:grid-cols-4 gap-6 items-center rounded-sm">
                <div className="text-center md:border-r border-secondary py-2">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Readiness Score</div>
                  <div className={`font-serif text-3xl font-bold mt-1 ${validationReport.readiness_score >= 80 ? "text-green-600" : "text-amber-600"}`}>
                    {validationReport.readiness_score}%
                  </div>
                </div>
                <div className="text-center md:border-r border-secondary py-2">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Total Products</div>
                  <div className="font-serif text-2xl font-bold mt-1 text-neutral-900">{validationReport.total_products}</div>
                </div>
                <div className="text-center md:border-r border-secondary py-2">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Images Matched</div>
                  <div className="font-serif text-2xl font-bold mt-1 text-neutral-900">{validationReport.total_images}</div>
                </div>
                <div className="text-center py-2">
                  <div className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Issues Found</div>
                  <div className="font-serif text-sm font-bold mt-2 flex flex-col gap-0.5 justify-center">
                    <span className="text-red-600">{validationReport.critical_errors} Critical</span>
                    <span className="text-amber-600">{validationReport.warnings} Warnings</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <h4 className="font-serif text-base font-bold">Validation Report Details</h4>
                <div className="flex gap-3">
                  {validationReport.errors.length > 0 && (
                    <button 
                      onClick={downloadErrorReport}
                      className="border border-neutral-800 text-neutral-800 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider px-4 py-2 transition-colors rounded-sm"
                    >
                      Export Error Log (CSV)
                    </button>
                  )}
                  <button 
                    disabled={validationReport.critical_errors > 0}
                    onClick={executeImport}
                    className="bg-black text-white disabled:bg-neutral-300 hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-6 py-2 transition-colors rounded-sm"
                  >
                    Commit Import to Database
                  </button>
                </div>
              </div>

              {/* Validation logs list */}
              <div className="border border-secondary max-h-[300px] overflow-y-auto rounded-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-neutral-50 border-b border-secondary sticky top-0 text-[10px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Row</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Suggested Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {validationReport.errors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-green-600 font-semibold">
                          ✓ Catalog verified perfectly! Zero warnings or critical blockers identified.
                        </td>
                      </tr>
                    ) : (
                      validationReport.errors.map((err: any, idx: number) => (
                        <tr key={idx} className="hover:bg-neutral-50/50">
                          <td className="p-3 font-semibold text-neutral-700">{err.row}</td>
                          <td className="p-3 font-mono font-bold text-neutral-900">{err.sku}</td>
                          <td className="p-3 uppercase">
                            <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-sm ${err.error_type === "critical" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                              {err.error_type}
                            </span>
                          </td>
                          <td className="p-3 text-neutral-800 font-medium">{err.message}</td>
                          <td className="p-3 text-neutral-500 italic">{err.suggested_fix}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5 (Finish/Progress) */}
          {step === 5 && (
            <div className="flex flex-col gap-6 items-center justify-center py-12">
              {isImporting ? (
                <>
                  <div className="h-10 w-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-center">
                    <h4 className="font-serif text-sm font-bold uppercase tracking-widest mb-1">Importing items</h4>
                    <p className="text-neutral-500 text-xs">Writing product database keys, mapping sizes/colors, and copying asset URLs...</p>
                  </div>
                </>
              ) : importResult ? (
                <div className="flex flex-col items-center gap-6 text-center max-w-lg">
                  <div className="h-12 w-12 bg-green-50 text-green-600 border border-green-200 rounded-full flex items-center justify-center text-lg font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold mb-1">Import Finished Successfully!</h3>
                    <p className="text-neutral-500 text-xs">
                      The catalog batch has been processed and saved to the persistence layer.
                    </p>
                  </div>

                  <div className="bg-neutral-50 border border-secondary p-4 w-full flex justify-around text-xs font-semibold rounded-sm">
                    <div>
                      <div className="text-neutral-400 text-[9px] uppercase font-bold tracking-widest">Success Rows</div>
                      <div className="text-green-600 text-lg font-bold mt-0.5">{importResult.success_count}</div>
                    </div>
                    <div>
                      <div className="text-neutral-400 text-[9px] uppercase font-bold tracking-widest">Failed Rows</div>
                      <div className="text-red-600 text-lg font-bold mt-0.5">{importResult.failed_count}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      onSuccess();
                      onClose();
                    }}
                    className="bg-black text-white hover:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider px-8 py-3 rounded-sm transition-colors"
                  >
                    Finish & Refresh Table
                  </button>
                </div>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
