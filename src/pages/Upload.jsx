import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { UploadFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Shield, Upload as UploadIcon, Check, Home, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import FileUploadZone from "../components/upload/FileUploadZone";
import DocumentForm from "../components/upload/DocumentForm";

const CATEGORIES = [
  { value: "identification", label: "ID Documents" },
  { value: "insurance", label: "Insurance" },
  { value: "legal_contracts", label: "Legal Contracts" },
  { value: "medical_records", label: "Medical Records" },
  { value: "financial_statements", label: "Financial Statements" },
  { value: "tax_documents", label: "Tax Documents" },
  { value: "property_deeds", label: "Property Deeds" },
  { value: "education_certificates", label: "Education Certificates" },
  { value: "employment_records", label: "Employment Records" },
  { value: "travel_documents", label: "Travel Documents" },
  { value: "warranties", label: "Warranties" },
  { value: "other", label: "Other" }
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentData, setDocumentData] = useState({
    name: "",
    description: "",
    category: "other",
    tags: [],
    expiry_date: "",
    is_important: false,
    security_level: "standard"
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handleFileSelect = useCallback(async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      
      setDocumentData(prev => ({
        ...prev,
        name: cleanName,
        file_type: file.name.split('.').pop()?.toLowerCase(),
        file_size: file.size
      }));
      
      // Check for potential duplicates
      try {
        const existingDocs = await base44.entities.Document.list();
        const duplicate = existingDocs.find(doc => 
          doc.name.toLowerCase() === cleanName.toLowerCase() ||
          (doc.file_size === file.size && Math.abs(new Date(doc.created_date).getTime() - Date.now()) > 24 * 60 * 60 * 1000)
        );
        
        if (duplicate) {
          setDuplicateWarning(`Similar document "${duplicate.name}" already exists. Continue anyway?`);
        } else {
          setDuplicateWarning(null);
        }
      } catch (error) {
        console.error("Error checking for duplicates:", error);
      }
      
      setError(null);
    }
  }, []);

  const handleCategorySuggestion = (category) => {
    if (category !== 'other') {
      setSuggestedCategory(category);
    }
  };

  const applySuggestedCategory = () => {
    setDocumentData(prev => ({ ...prev, category: suggestedCategory }));
    setSuggestedCategory(null);
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    if (!documentData.name.trim()) {
      setError("Please enter a document name");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload file
      const { file_url } = await UploadFile({ file: selectedFile });

      // Create document record
      const newDoc = await base44.entities.Document.create({
        ...documentData,
        file_url,
        tags: documentData.tags.filter(tag => tag.trim())
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        action: "upload",
        document_id: newDoc.id,
        document_name: newDoc.name,
        details: `Uploaded ${documentData.category.replace(/_/g, ' ')} document`
      });

      setSuccess(true);

    } catch (error) {
      setError("Error uploading document. Please check your connection and try again.");
      console.error("Upload error:", error);
    }
    
    setUploading(false);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocumentData({
      name: "",
      description: "",
      category: "other",
      tags: [],
      expiry_date: "",
      is_important: false,
      security_level: "standard"
    });
    setSuccess(false);
    setError(null);
    setSuggestedCategory(null);
    setDuplicateWarning(null);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center shadow-xl border-green-200">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Successful!</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Your document has been securely encrypted and stored in your vault. 
              It's now protected with military-grade security.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={resetForm}
              >
                Upload Another Document
              </Button>
              <Button 
                variant="ghost"
                onClick={() => navigate(createPageUrl("Documents"))}
                className="text-sm"
              >
                View Document Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Upload Document</h1>
            <p className="text-slate-600 mt-1">Add a new document to your secure vault</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestedCategory && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-blue-800">
                Smart suggestion: This looks like a <strong>{CATEGORIES.find(c => c.value === suggestedCategory)?.label}</strong> document
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={applySuggestedCategory}
                className="ml-4 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              >
                Apply
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {duplicateWarning && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {duplicateWarning}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-5 gap-8">
          {/* File Upload - Takes 3 columns */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg bg-white/90 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadIcon className="w-5 h-5 text-blue-600" />
                  Select File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone 
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  dragActive={dragActive}
                  onCategorySuggestion={handleCategorySuggestion}
                />
              </CardContent>
            </Card>
          </div>

          {/* Document Details - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg bg-white/90 backdrop-blur-sm h-fit sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentForm 
                  documentData={documentData}
                  setDocumentData={setDocumentData}
                  categories={CATEGORIES}
                  onUpload={handleUpload}
                  uploading={uploading}
                  disabled={!selectedFile}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}