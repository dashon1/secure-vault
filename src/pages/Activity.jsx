import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Share2,
  FolderInput,
  Copy,
  Clock,
  Search
} from "lucide-react";
import { format } from "date-fns";

const ACTION_ICONS = {
  upload: { icon: Upload, color: "text-blue-600 bg-blue-50" },
  view: { icon: Eye, color: "text-green-600 bg-green-50" },
  download: { icon: Download, color: "text-purple-600 bg-purple-50" },
  delete: { icon: Trash2, color: "text-red-600 bg-red-50" },
  update: { icon: Edit, color: "text-orange-600 bg-orange-50" },
  share: { icon: Share2, color: "text-pink-600 bg-pink-50" },
  move: { icon: FolderInput, color: "text-indigo-600 bg-indigo-50" },
  copy: { icon: Copy, color: "text-teal-600 bg-teal-50" }
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, searchQuery, filterAction]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.ActivityLog.list("-created_date", 100);
      setActivities(data);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setIsLoading(false);
  };

  const filterActivities = () => {
    let filtered = activities;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.document_name?.toLowerCase().includes(query) ||
        activity.action.toLowerCase().includes(query) ||
        activity.details?.toLowerCase().includes(query)
      );
    }

    if (filterAction !== "all") {
      filtered = filtered.filter(activity => activity.action === filterAction);
    }

    setFilteredActivities(filtered);
  };

  const groupByDate = (activities) => {
    const groups = {};
    activities.forEach(activity => {
      const date = format(new Date(activity.created_date), "MMM d, yyyy");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupByDate(filteredActivities);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Activity Log</h1>
          <p className="text-slate-600">Track all actions performed on your documents</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterAction === "all" ? "default" : "outline"}
              onClick={() => setFilterAction("all")}
              size="sm"
            >
              All
            </Button>
            {Object.keys(ACTION_ICONS).map(action => (
              <Button
                key={action}
                variant={filterAction === action ? "default" : "outline"}
                onClick={() => setFilterAction(action)}
                size="sm"
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading activity log...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No activity yet</h3>
            <p className="text-slate-500">Activity will appear here as you use the app</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{date}</h3>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-3">
                  {dayActivities.map((activity) => {
                    const ActionInfo = ACTION_ICONS[activity.action] || { icon: Clock, color: "text-slate-600 bg-slate-50" };
                    const ActionIcon = ActionInfo.icon;
                    
                    return (
                      <Card key={activity.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ActionInfo.color}`}>
                              <ActionIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="capitalize">
                                  {activity.action}
                                </Badge>
                                <span className="text-sm text-slate-500">
                                  {format(new Date(activity.created_date), "h:mm a")}
                                </span>
                              </div>
                              {activity.document_name && (
                                <p className="font-medium text-slate-900 mb-1">
                                  {activity.document_name}
                                </p>
                              )}
                              {activity.details && (
                                <p className="text-sm text-slate-600">{activity.details}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                {activity.created_by && (
                                  <span>By: {activity.created_by}</span>
                                )}
                                {activity.ip_address && (
                                  <span>IP: {activity.ip_address}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}