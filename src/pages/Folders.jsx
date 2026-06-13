import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderPlus, Folder, FolderOpen, Star, FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const FOLDER_COLORS = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  green: "bg-green-100 text-green-700 border-green-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  pink: "bg-pink-100 text-pink-700 border-pink-200",
  indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  teal: "bg-teal-100 text-teal-700 border-teal-200"
};

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
    color: "blue"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [foldersData, docsData] = await Promise.all([
        base44.entities.Folder.list("-created_date"),
        base44.entities.Document.list()
      ]);
      setFolders(foldersData);
      setDocuments(docsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const createFolder = async () => {
    if (!newFolder.name.trim()) return;
    
    try {
      await base44.entities.Folder.create(newFolder);
      setNewFolder({ name: "", description: "", color: "blue" });
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const deleteFolder = async (folderId) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;
    
    try {
      await base44.entities.Folder.delete(folderId);
      loadData();
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const toggleFavorite = async (folder) => {
    try {
      await base44.entities.Folder.update(folder.id, {
        is_favorite: !folder.is_favorite
      });
      loadData();
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  const getDocumentCount = (folderId) => {
    return documents.filter(doc => doc.folder_id === folderId).length;
  };

  const getFolderDocuments = (folderId) => {
    return documents.filter(doc => doc.folder_id === folderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Folders</h1>
            <p className="text-slate-600">Organize your documents into folders</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Folder Name</Label>
                  <Input
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                    placeholder="Enter folder name..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                    placeholder="Enter description..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Color Theme</Label>
                  <Select value={newFolder.color} onValueChange={(value) => setNewFolder({ ...newFolder, color: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FOLDER_COLORS).map(color => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${FOLDER_COLORS[color]}`} />
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createFolder} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Folders Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading folders...</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No folders yet</h3>
            <p className="text-slate-500 mb-6">Create your first folder to organize documents</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <FolderPlus className="w-4 h-4 mr-2" />
              Create First Folder
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <Card 
                key={folder.id} 
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${FOLDER_COLORS[folder.color]}`}
                onClick={() => navigate(createPageUrl("Documents") + `?folder=${folder.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${FOLDER_COLORS[folder.color]}`}>
                      <Folder className="w-8 h-8" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(folder);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Star className={`w-4 h-4 ${folder.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder.id);
                        }}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{folder.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    <span>{getDocumentCount(folder.id)} documents</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}