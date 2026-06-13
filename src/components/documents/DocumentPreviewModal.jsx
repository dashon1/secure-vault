import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Trash2,
  Calendar,
  Shield,
  Tag,
  Eye,
  ExternalLink,
  Clock,
  User,
  Star
} from "lucide-react";
import { format } from "date-fns";

const CATEGORY_COLORS = {
  identification: "bg-blue-100 text-blue-800",
  insurance: "bg-green-100 text-green-800",
  legal_contracts: "bg-purple-100 text-purple-800",
  medical_records: "bg-red-100 text-red-800",
  financial_statements: "bg-yellow-100 text-yellow-800",
  tax_documents: "bg-orange-100 text-orange-800",
  property_deeds: "bg-indigo-100 text-indigo-800",
  education_certificates: "bg-cyan-100 text-cyan-800",
  employment_records: "bg-pink-100 text-pink-800",
  travel_documents: "bg-teal-100 text-teal-800",
  warranties: "bg-lime-100 text-lime-800",
  other: "bg-gray-100 text-gray-800"
};

const SECURITY_COLORS = {
  standard: "bg-slate-100 text-slate-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700"
};

export default function DocumentPreviewModal({ document, isOpen, onClose, onDelete, onReload }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!document) return null;

  const handleView = async () => {
    if (document.file_url) {
      // Track view
      await base44.entities.Document.update(document.id, {
        view_count: (document.view_count || 0) + 1,
        last_accessed: new Date().toISOString()
      });
      await base44.entities.ActivityLog.create({
        action: "view",
        document_id: document.id,
        document_name: document.name
      });
      window.open(document.file_url, '_blank');
      if (onReload) onReload();
    }
  };

  const handleDownload = async () => {
    if (document.file_url) {
      // Track download
      await base44.entities.Document.update(document.id, {
        download_count: (document.download_count || 0) + 1,
        last_accessed: new Date().toISOString()
      });
      await base44.entities.ActivityLog.create({
        action: "download",
        document_id: document.id,
        document_name: document.name
      });
      
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      if (onReload) onReload();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${document.name}"?`)) return;
    
    setIsDeleting(true);
    try {
      await base44.entities.ActivityLog.create({
        action: "delete",
        document_id: document.id,
        document_name: document.name
      });
      await base44.entities.Document.delete(document.id);
      if (onDelete) onDelete();
      onClose();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
    setIsDeleting(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isExpiringSoon = document.expiry_date && 
    new Date(document.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-slate-900 break-words">{document.name}</h2>
                {document.is_important && (
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={CATEGORY_COLORS[document.category]}>
              {document.category.replace(/_/g, ' ')}
            </Badge>
            <Badge className={SECURITY_COLORS[document.security_level]}>
              <Shield className="w-3 h-3 mr-1" />
              {document.security_level}
            </Badge>
            {isExpiringSoon && (
              <Badge className="bg-red-100 text-red-800">
                <Clock className="w-3 h-3 mr-1" />
                Expiring Soon
              </Badge>
            )}
          </div>

          {/* Description */}
          {document.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">{document.description}</p>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Uploaded</p>
                <p className="text-sm font-medium text-slate-900">
                  {format(new Date(document.created_date), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {document.expiry_date && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Expires</p>
                  <p className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-slate-900'}`}>
                    {format(new Date(document.expiry_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">File Size</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatFileSize(document.file_size)}
                </p>
              </div>
            </div>

            {document.file_type && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">File Type</p>
                  <p className="text-sm font-medium text-slate-900 uppercase">
                    {document.file_type}
                  </p>
                </div>
              </div>
            )}

            {document.created_by && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Uploaded By</p>
                  <p className="text-sm font-medium text-slate-900">
                    {document.created_by}
                  </p>
                </div>
              </div>
            )}

            {document.last_accessed && (
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Last Accessed</p>
                  <p className="text-sm font-medium text-slate-900">
                    {format(new Date(document.last_accessed), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          {(document.view_count > 0 || document.download_count > 0) && (
            <>
              <Separator />
              <div className="flex gap-6">
                {document.view_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {document.view_count} {document.view_count === 1 ? 'view' : 'views'}
                    </span>
                  </div>
                )}
                {document.download_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {document.download_count} {document.download_count === 1 ? 'download' : 'downloads'}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-slate-50">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {document.file_url && (
              <>
                <Button onClick={handleView} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Document
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
            <Button 
              onClick={handleDelete} 
              variant="destructive" 
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}