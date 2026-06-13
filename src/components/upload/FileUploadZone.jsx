import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Check, AlertCircle, FileImage, FileText, File } from "lucide-react";

const getFileIcon = (file) => {
  if (!file) return FileText;
  const type = file.type;
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (type.startsWith('image/')) return FileImage;
  if (type === 'application/pdf' || extension === 'pdf') return FileText;
  if (type.includes('word') || ['doc', 'docx'].includes(extension)) return FileText;
  return File;
};

const suggestCategory = (filename) => {
  const name = filename.toLowerCase();
  if (name.includes('passport') || name.includes('license') || name.includes('id')) return 'identification';
  if (name.includes('insurance') || name.includes('policy')) return 'insurance';
  if (name.includes('contract') || name.includes('legal')) return 'legal_contracts';
  if (name.includes('medical') || name.includes('health')) return 'medical_records';
  if (name.includes('tax') || name.includes('1099') || name.includes('w2')) return 'tax_documents';
  if (name.includes('diploma') || name.includes('certificate') || name.includes('degree')) return 'education_certificates';
  if (name.includes('employment') || name.includes('job') || name.includes('salary')) return 'employment_records';
  if (name.includes('warranty') || name.includes('receipt')) return 'warranties';
  return 'other';
};

export default function FileUploadZone({ onFileSelect, selectedFile, dragActive, onCategorySuggestion }) {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      const suggestedCategory = suggestCategory(file.name);
      onFileSelect(files);
      if (onCategorySuggestion) {
        onCategorySuggestion(suggestedCategory);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isValidFileType = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    return validTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|gif|webp)$/i);
  };

  const FileIcon = selectedFile ? getFileIcon(selectedFile) : Upload;

  return (
    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
      dragActive 
        ? "border-blue-400 bg-blue-50 scale-[1.02]" 
        : selectedFile
        ? "border-green-400 bg-green-50"
        : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
    }`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
      />
      
      {selectedFile ? (
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            {isValidFileType(selectedFile) ? (
              <Check className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileIcon className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900 break-all">{selectedFile.name}</h3>
            </div>
            <p className="text-sm text-slate-500">
              {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
            </p>
            {!isValidFileType(selectedFile) && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ File type may not be supported
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleBrowseClick}
            className="bg-white hover:bg-slate-50"
          >
            Choose Different File
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            <Upload className={`w-10 h-10 text-blue-600 ${dragActive ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {dragActive ? 'Drop your file here' : 'Upload your document'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Drag & drop your file or click to browse
            </p>
          </div>
          <Button
            onClick={handleBrowseClick}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base"
          >
            <File className="w-5 h-5 mr-2" />
            Browse Files
          </Button>
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium">Supported formats:</p>
            <div className="flex justify-center gap-4 text-xs text-slate-400">
              <span>PDF</span>
              <span>•</span>
              <span>DOC/DOCX</span>
              <span>•</span>
              <span>JPG/PNG</span>
              <span>•</span>
              <span>GIF/WEBP</span>
            </div>
            <p className="text-xs text-slate-400">Max file size: 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
}