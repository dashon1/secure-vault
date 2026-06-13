import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Check, X, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState([]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles.map((file, index) => ({
      id: index,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      status: "pending",
      category: "other",
      security_level: "standard"
    })));
  }, []);

  const handleBulkUpload = async () => {
    setUploading(true);
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      try {
        // Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file: fileData.file });
        
        // Create document
        const newDoc = await base44.entities.Document.create({
          name: fileData.name,
          category: fileData.category,
          security_level: fileData.security_level,
          file_url,
          file_type: fileData.file.name.split('.').pop()?.toLowerCase(),
          file_size: fileData.file.size
        });

        // Log activity
        await base44.entities.ActivityLog.create({
          action: "upload",
          document_id: newDoc.id,
          document_name: fileData.name,
          details: `Bulk uploaded`
        });

        results.push({ ...fileData, status: "success" });
      } catch (error) {
        results.push({ ...fileData, status: "error", error: error.message });
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setUploadResults(results);
    setUploading(false);
  };

  const successCount = uploadResults.filter(r => r.status === "success").length;
  const errorCount = uploadResults.filter(r => r.status === "error").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Bulk Upload</h1>
            <p className="text-slate-600 mt-1">Upload multiple documents at once</p>
          </div>
        </div>

        {/* File Selection */}
        {files.length === 0 && !uploading && uploadResults.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select Multiple Files</h3>
                <p className="text-slate-600 mb-6">Choose all files you want to upload at once</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bulk-file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                />
                <label htmlFor="bulk-file-input">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      Select Files
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files List */}
        {files.length > 0 && !uploading && uploadResults.length === 0 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Selected Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">{file.file.name}</p>
                          <p className="text-sm text-slate-500">
                            {(file.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={handleBulkUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload All Files
              </Button>
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Uploading Files...</h3>
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-slate-600">{Math.round(progress)}% Complete</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResults.length > 0 && !uploading && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upload Complete</span>
                  <div className="flex gap-2">
                    {successCount > 0 && (
                      <Badge className="bg-green-100 text-green-700">
                        {successCount} Successful
                      </Badge>
                    )}
                    {errorCount > 0 && (
                      <Badge className="bg-red-100 text-red-700">
                        {errorCount} Failed
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadResults.map((result) => (
                    <div key={result.id} className={`flex items-center justify-between p-3 rounded-lg ${
                      result.status === "success" ? "bg-green-50" : "bg-red-50"
                    }`}>
                      <div className="flex items-center gap-3">
                        {result.status === "success" ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{result.file.name}</p>
                          {result.error && (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl("Documents"))}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                View All Documents
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setUploadResults([]);
                  setProgress(0);
                }}
              >
                Upload More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}