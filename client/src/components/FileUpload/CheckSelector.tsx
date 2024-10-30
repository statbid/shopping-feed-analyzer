import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export interface CheckItem {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
}

interface CheckCategory {
  name: string;
  order: number;
  checks: CheckItem[];
}

interface CheckSelectorProps {
    categories: CheckCategory[];
    onSelectionChange: (selectedChecks: string[]) => void;
    hideHeader?: boolean;
  }
  

  const CheckSelector = ({ categories, onSelectionChange, hideHeader = false }: CheckSelectorProps) => {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedChecks, setSelectedChecks] = useState<Set<string>>(
      new Set(categories.flatMap(cat => cat.checks.map(check => check.id)))
    );

  const handleCategoryExpand = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCheckToggle = (checkId: string) => {
    const newSelected = new Set(selectedChecks);
    if (newSelected.has(checkId)) {
      newSelected.delete(checkId);
    } else {
      newSelected.add(checkId);
    }
    setSelectedChecks(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  const handleCategoryToggle = (category: CheckCategory) => {
    const newSelected = new Set(selectedChecks);
    const categoryChecks = category.checks.map(check => check.id);
    
    const allCategoryChecksSelected = categoryChecks.every(id => selectedChecks.has(id));
    
    if (allCategoryChecksSelected) {
      // Unselect all checks in this category
      categoryChecks.forEach(id => newSelected.delete(id));
    } else {
      // Select all checks in this category
      categoryChecks.forEach(id => newSelected.add(id));
    }
    
    setSelectedChecks(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Top Controls - Always visible */}
      <div className="pb-4 mb-4 border-b flex justify-between items-center">
        <div className="text-sm text-gray-600 font-medium">
          {selectedChecks.size} checks selected
        </div>
        <div className="space-x-4">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => {
              const allCheckIds = categories.flatMap(cat => cat.checks.map(check => check.id));
              setSelectedChecks(new Set(allCheckIds));
              onSelectionChange(allCheckIds);
            }}
          >
            Select All
          </button>
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => {
              setSelectedChecks(new Set());
              onSelectionChange([]);
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Categories List - Scrollable */}
      <div className="space-y-2 overflow-y-auto">
        {categories.sort((a, b) => a.order - b.order).map((category) => (
          <div key={category.name} className="border rounded-lg">
            {/* Category Header */}
            <button
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg"
              onClick={() => handleCategoryExpand(category.name)}
            >
              <div className="flex items-center">
                <div 
                  className="w-5 h-5 border border-gray-300 rounded mr-2 flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryToggle(category);
                  }}
                >
                  {category.checks.every(check => selectedChecks.has(check.id)) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span className="font-semibold text-[#17235E]">{category.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({category.checks.length} checks)
                </span>
              </div>
              {expandedCategories.has(category.name) ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Category Checks */}
            {expandedCategories.has(category.name) && (
              <div className="px-4 py-2 space-y-2">
                {category.checks.map((check) => (
                  <div key={check.id} className="flex items-center pl-6">
                    <div
                      className="w-5 h-5 border border-gray-300 rounded mr-2 flex items-center justify-center cursor-pointer"
                      onClick={() => handleCheckToggle(check.id)}
                    >
                      {selectedChecks.has(check.id) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <label className="text-gray-700 cursor-pointer select-none" onClick={() => handleCheckToggle(check.id)}>
                      {check.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckSelector;