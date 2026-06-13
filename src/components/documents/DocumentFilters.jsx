import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
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

export default function DocumentFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm text-slate-600 font-medium">Filters:</span>
      </div>

      <Select
        value={filters.category}
        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.security_level}
        onValueChange={(value) => setFilters(prev => ({ ...prev, security_level: value }))}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Security</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.is_important}
        onValueChange={(value) => setFilters(prev => ({ ...prev, is_important: value }))}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Items</SelectItem>
          <SelectItem value="true">Important</SelectItem>
          <SelectItem value="false">Normal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}