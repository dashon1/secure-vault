import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, Star, X } from "lucide-react";

export default function DocumentForm({ 
  documentData, 
  setDocumentData, 
  categories, 
  onUpload, 
  uploading, 
  disabled 
}) {
  const [tagInput, setTagInput] = React.useState("");

  const handleTagsSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      setDocumentData(prev => ({ 
        ...prev, 
        tags: [...(prev.tags || []), ...newTags.filter(tag => !prev.tags?.includes(tag))]
      }));
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove) => {
    setDocumentData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, index) => index !== indexToRemove)
    }));
  };

  return (
    <form onSubmit={handleTagsSubmit} className="space-y-6">
      {/* Document Name */}
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-slate-700">
          Document Name *
        </Label>
        <Input
          id="name"
          value={documentData.name}
          onChange={(e) => setDocumentData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter document name..."
          className="mt-1"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-slate-700">
          Description
        </Label>
        <Textarea
          id="description"
          value={documentData.description}
          onChange={(e) => setDocumentData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add notes or description..."
          className="mt-1 h-20 resize-none"
        />
      </div>

      {/* Category and Security Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">Category</Label>
          <Select
            value={documentData.category}
            onValueChange={(value) => setDocumentData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700">Security Level</Label>
          <Select
            value={documentData.security_level}
            onValueChange={(value) => setDocumentData(prev => ({ ...prev, security_level: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  Standard
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  High
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Critical
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expiry Date */}
      <div>
        <Label htmlFor="expiry_date" className="text-sm font-medium text-slate-700">
          Expiry Date (Optional)
        </Label>
        <Input
          id="expiry_date"
          type="date"
          value={documentData.expiry_date}
          onChange={(e) => setDocumentData(prev => ({ ...prev, expiry_date: e.target.value }))}
          className="mt-1"
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-slate-500 mt-1">For documents like IDs, insurance policies, etc.</p>
      </div>

      {/* Tags */}
      <div>
        <Label className="text-sm font-medium text-slate-700">Tags</Label>
        <div className="mt-1 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tags separated by commas..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              variant="outline" 
              size="sm"
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {documentData.tags && documentData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {documentData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1 pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Important Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <Star className={`w-5 h-5 ${documentData.is_important ? 'text-yellow-500 fill-current' : 'text-slate-400'}`} />
          <div>
            <span className="text-sm font-medium text-slate-700">Mark as Important</span>
            <p className="text-xs text-slate-500">Priority documents for quick access</p>
          </div>
        </div>
        <Switch
          checked={documentData.is_important}
          onCheckedChange={(checked) => setDocumentData(prev => ({ ...prev, is_important: checked }))}
        />
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-blue-900 block mb-1">Security Guarantee</span>
            <p className="text-xs text-blue-800 leading-relaxed">
              Your document will be encrypted with military-grade AES-256 encryption and stored with 
              zero-knowledge architecture. Only you have access to decrypt and view your files.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <Button
        type="button"
        onClick={onUpload}
        disabled={disabled || uploading || !documentData.name.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
            Encrypting & Uploading...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-3" />
            Secure Upload Document
          </>
        )}
      </Button>
    </form>
  );
}