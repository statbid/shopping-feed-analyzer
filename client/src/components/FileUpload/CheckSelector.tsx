/**
 * CheckSelector Component
 *
 * This component provides a user interface for selecting and managing quality checks.
 * It organizes checks into expandable/collapsible categories, supports selecting/deselecting
 * individual or all checks, and provides a summary of the current selection.
 *
 * Features:
 * - **Category Management:** Displays checks grouped by categories, which can be expanded or collapsed.
 * - **Select/Deselect All Controls:** Users can select or clear all checks with one click.
 * - **Dynamic State Updates:** Keeps track of selected checks and communicates changes to the parent component.
 * - **Interactive Checkboxes:** Allows toggling individual checks or entire categories.
 *
 * Props:
 * - `categories`: An array of categories containing checks to be displayed.
 * - `onSelectionChange`: A callback function triggered when the selection changes, passing the selected check IDs.
 * - `hideHeader`: A boolean that hides the header if set to `true`.
 * - `selectedChecks`: An array of currently selected check IDs to initialize the component.
 *
 * Styling:
 * - Uses Tailwind CSS for layout and styling.
 * - Includes responsive and scrollable sections for better usability with long lists of checks.
 */

import React, { useState, useEffect } from 'react';
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
  selectedChecks: string[];
}

const CheckSelector: React.FC<CheckSelectorProps> = ({
  categories, 
  onSelectionChange, 
  hideHeader = false,
  selectedChecks 
}) => {
  // State for tracking expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // State for tracking locally selected checks
  const [localSelectedChecks, setLocalSelectedChecks] = useState<Set<string>>(
    new Set(selectedChecks)
  );

  // Sync local state with selectedChecks prop
  useEffect(() => {
    setLocalSelectedChecks(new Set(selectedChecks));
  }, [selectedChecks]);

  /**
   * Toggles the expansion of a category.
   * @param categoryName - The name of the category to toggle.
   */
  const handleCategoryExpand = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  /**
   * Toggles the selection of an individual check.
   * @param checkId - The ID of the check to toggle.
   */
  const handleCheckToggle = (checkId: string) => {
    const newSelected = new Set(localSelectedChecks);
    if (newSelected.has(checkId)) {
      newSelected.delete(checkId);
    } else {
      newSelected.add(checkId);
    }
    setLocalSelectedChecks(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  /**
   * Toggles the selection of all checks in a category.
   * @param category - The category whose checks are toggled.
   */
  const handleCategoryToggle = (category: CheckCategory) => {
    const newSelected = new Set(localSelectedChecks);
    const categoryChecks = category.checks.map(check => check.id);
    const allCategoryChecksSelected = categoryChecks.every(id => localSelectedChecks.has(id));

    if (allCategoryChecksSelected) {
      categoryChecks.forEach(id => newSelected.delete(id));
    } else {
      categoryChecks.forEach(id => newSelected.add(id));
    }

    setLocalSelectedChecks(newSelected);
    onSelectionChange(Array.from(newSelected));
  };

  /**
   * Selects all checks across all categories.
   */
  const handleSelectAll = () => {
    const allCheckIds = categories.flatMap(cat => cat.checks.map(check => check.id));
    setLocalSelectedChecks(new Set(allCheckIds));
    onSelectionChange(allCheckIds);
  };

  /**
   * Clears all selected checks.
   */
  const handleClearAll = () => {
    setLocalSelectedChecks(new Set());
    onSelectionChange([]);
  };

  return (
    <div className="bg-white flex flex-col h-full">
      {/* Header Section (optional) */}
      {!hideHeader && (
        <div className="pb-4 mb-4 border-b flex justify-between items-center">
          <div className="text-sm text-gray-600 font-medium">
            {localSelectedChecks.size} checks selected
          </div>
          <div className="space-x-4">
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Categories Section */}
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
                  {category.checks.every(check => localSelectedChecks.has(check.id)) && (
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

            {/* Category Items */}
            {expandedCategories.has(category.name) && (
              <div className="px-4 py-2 space-y-2">
                {category.checks.map((check) => (
                  <div key={check.id} className="flex items-center pl-6">
                    <div
                      className="w-5 h-5 border border-gray-300 rounded mr-2 flex items-center justify-center cursor-pointer"
                      onClick={() => handleCheckToggle(check.id)}
                    >
                      {localSelectedChecks.has(check.id) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <label
                      className="text-gray-700 cursor-pointer select-none"
                      onClick={() => handleCheckToggle(check.id)}
                    >
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
