import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Star, 
  Calendar, 
  Shield, 
  Download,
  Eye,
  AlertTriangle,
  Upload as UploadIcon,
  Copy,
  FileImage,
  File
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DocumentPreviewModal from "./DocumentPreviewModal";

const categoryColors = {
  identification: "bg-blue-100 text-blue-800 border-blue-200",
  insurance: "bg-green-100 text-green-800 border-green-200",
  legal_contracts: "bg-purple-100 text-purple-800 border-purple-200",
  medical_records: "bg-red-100 text-red-800 border-red-200",
  financial_statements: "bg-yellow-100 text-yellow-800 border-yellow-200",
  tax_documents: "bg-orange-100 text-orange-800 border-orange-200",
  property_deeds: "bg-indigo-100 text-indigo-800 border-indigo-200",
  education_certificates: "bg-cyan-100 text-cyan-800 border-cyan-200",
  employment_records: "bg-pink-100 text-pink-800 border-pink-200",
  travel_documents: "bg-teal-100 text-teal-800 border-teal-200",
  warranties: "bg-lime-100 text-lime-800 border-lime-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const securityColors = {
  standard: "bg-slate-100 text-slate-700 border-slate-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return expiry <= thirtyDaysFromNow && expiry >= now;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (document) => {
  const fileType = document.file_type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return FileImage;
  if (['pdf'].includes(fileType)) return FileText;
  if (['doc', 'docx'].includes(fileType)) return FileText;
  return File;
};

export default function DocumentGrid({ documents, isLoading, viewMode, batchMode, selectedDocs = [], onToggleSelection, onReload }) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openPreview = (document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedDocument(null);
  };

  const handleDelete = () => {
    closePreview();
    if (onReload) onReload();
  };

  if (isLoading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 mb-3">No documents found</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          No documents match your current search and filter criteria. 
          Try adjusting your filters or upload your first document.
        </p>
        <div className="flex justify-center gap-3">
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UploadIcon className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {documents.map((document) => {
            const FileIcon = getFileIcon(document);
            const isSelected = selectedDocs.includes(document.id);
            return (
              <Card 
                key={document.id} 
                className={`hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-slate-200/60 group cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('button') || e.target.closest('a')) return;
                  if (batchMode) {
                    onToggleSelection?.(document.id);
                  } else {
                    openPreview(document);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {batchMode && (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection?.(document.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                    <FileIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{document.name}</h3>
                      {document.is_important && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      {isExpiringSoon(document.expiry_date) && (
                        <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Uploaded {format(new Date(document.created_date), "MMM d, yyyy")}
                      {document.file_size && (
                        <span className="ml-2">• {formatFileSize(document.file_size)}</span>
                      )}
                      {document.expiry_date && (
                        <span className="ml-2">• Expires {format(new Date(document.expiry_date), "MMM d, yyyy")}</span>
                      )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className={categoryColors[document.category]}>
                        {document.category.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="secondary" className={securityColors[document.security_level]}>
                        <Shield className="w-3 h-3 mr-1" />
                        {document.security_level}
                      </Badge>
                      {document.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {document.file_url && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-blue-50 hover:text-blue-700"
                          title="View document"
                        >
                          <a
                            href={document.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-green-50 hover:text-green-700"
                          title="Download document"
                        >
                          <a
                            href={document.file_url}
                            download={document.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(document.file_url, document.id)}
                          className="hover:bg-purple-50 hover:text-purple-700"
                          title={copiedId === document.id ? "Copied!" : "Copy link"}
                        >
                          <Copy className={`w-4 h-4 ${copiedId === document.id ? 'text-green-600' : ''}`} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
        <DocumentPreviewModal
          document={selectedDocument}
          isOpen={isPreviewOpen}
          onClose={closePreview}
          onDelete={handleDelete}
          onReload={onReload}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[70vh] overflow-y-auto pr-2">
        {documents.map((document) => {
          const FileIcon = getFileIcon(document);
          const isSelected = selectedDocs.includes(document.id);
          return (
            <Card 
              key={document.id} 
              className={`group hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-slate-200/60 hover:border-blue-200 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
              onClick={(e) => {
                if (e.target.closest('button') || e.target.closest('a')) return;
                if (batchMode) {
                  onToggleSelection?.(document.id);
                } else {
                  openPreview(document);
                }
              }}
            >
              <CardContent className="p-6">
                {batchMode && (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection?.(document.id)}
                    />
                  </div>
                )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all flex-shrink-0">
                  <FileIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-900 transition-colors">
                      {document.name}
                    </h3>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      {document.is_important && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                      {isExpiringSoon(document.expiry_date) && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                  {document.file_url && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                      >
                        <a
                          href={document.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-7 px-2 text-xs hover:bg-green-50 hover:text-green-700"
                      >
                        <a
                          href={document.file_url}
                          download={document.name}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(document.file_url, document.id)}
                        className="h-7 px-2 text-xs hover:bg-purple-50 hover:text-purple-700"
                        title={copiedId === document.id ? "Copied!" : "Copy link"}
                      >
                        <Copy className={`w-3 h-3 ${copiedId === document.id ? 'text-green-600' : ''}`} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {document.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className={categoryColors[document.category]}>
                    {document.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="secondary" className={securityColors[document.security_level]}>
                    <Shield className="w-3 h-3 mr-1" />
                    {document.security_level}
                  </Badge>
                </div>

                {document.expiry_date && (
                  <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                    isExpiringSoon(document.expiry_date) 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-slate-500'
                  }`}>
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {isExpiringSoon(document.expiry_date) ? 'Expires soon: ' : 'Expires '}
                      {format(new Date(document.expiry_date), "MMM d, yyyy")}
                    </span>
                  </div>
                )}

                {document.tags && document.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{document.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Uploaded {format(new Date(document.created_date), "MMM d, yyyy")}</span>
                  {document.file_size && (
                    <span>{formatFileSize(document.file_size)}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>
      <DocumentPreviewModal
        document={selectedDocument}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onDelete={handleDelete}
        onReload={onReload}
      />
    </>
  );
}