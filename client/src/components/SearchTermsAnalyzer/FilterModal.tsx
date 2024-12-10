/**
 * FilterModal Component
 *
 * This component provides a modal interface for adding filters to search or analysis results.
 * Users can specify a column, condition, and value for the filter. The selected filter is passed 
 * to the parent component through the `onAddFilter` callback.
 *
 * Features:
 * - **Dynamic Filter Options:** Adapts available conditions based on the selected column.
 * - **Validation:** Ensures that a valid value is provided before adding a filter.
 * - **Responsive Modal:** Includes a semi-transparent backdrop and centralized content.
 *
 * Props:
 * - `isOpen` (boolean): Determines whether the modal is visible.
 * - `onClose` (function): Callback triggered when the modal is closed.
 * - `onAddFilter` (function): Callback triggered when a new filter is added.
 * - `currentFilters` (array): Array of currently applied filters (not modified by this component).
 *
 * Types:
 * - `FilterableColumns`: Enumerates the columns that can be filtered (e.g., `id`, `productName`).
 * - `FilterType`: Enumerates the types of conditions available for filtering (e.g., `contains`, `greaterThan`).
 * - `Filter`: Represents a single filter with `column`, `type`, and `value` properties.
 */


import React, { useState, FormEvent, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { SearchTerm } from '../../types';

// Define filterable columns
export type FilterableColumns = 'id' | 'productName' | 'searchTerm' | 'pattern' | 'estimatedVolume';
export type FilterType = 'contains' | 'notContains' | 'greaterThan' | 'lessThan';

// Column display names mapping
export const columnDisplayNames: Record<FilterableColumns, string> = {
  id: 'Product ID',
  productName: 'Product Name',
  searchTerm: 'Search Term',
  pattern: 'Pattern',
  estimatedVolume: 'Est. Volume'
};

// Filter type display names mapping
export const filterTypeDisplayNames: Record<FilterType, string> = {
  contains: 'contains',
  notContains: 'not contains',
  greaterThan: 'greater than',
  lessThan: 'less than'
};

export interface Filter {
  column: FilterableColumns;
  type: FilterType;
  value: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFilter: (filter: Filter) => void;
  currentFilters: Filter[];
}

type ColumnOption = {
  value: FilterableColumns;
  label: string;
}

type FilterTypes = {
  [K in FilterableColumns]: FilterType[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onAddFilter,
  currentFilters
}) => {
  // Local State Management
// - `column`: Tracks the currently selected column for filtering.
// - `type`: Tracks the selected condition type (e.g., contains, greaterThan).
// - `value`: Holds the user-entered value for the filter.

  const [column, setColumn] = useState<FilterableColumns>('searchTerm');
  const [type, setType] = useState<FilterType>('contains');
  const [value, setValue] = useState('');

  if (!isOpen) return null;
  
/**
 * Handles form submission to add a new filter.
 * - Validates the user-entered value before adding the filter.
 * - Resets the `value` state and closes the modal upon successful addition.
 * @param e - Form submission event.
 */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAddFilter({ column, type, value: value.trim() });
      setValue('');
      onClose();
    }
  };

  const columnOptions: ColumnOption[] = [
    { value: 'id', label: columnDisplayNames.id },
    { value: 'productName', label: columnDisplayNames.productName },
    { value: 'searchTerm', label: columnDisplayNames.searchTerm },
    { value: 'pattern', label: columnDisplayNames.pattern },
    { value: 'estimatedVolume', label: columnDisplayNames.estimatedVolume }
  ];

  const filterTypes: FilterTypes = {
    id: ['contains', 'notContains'],
    productName: ['contains', 'notContains'],
    searchTerm: ['contains', 'notContains'],
    pattern: ['contains', 'notContains'],
    estimatedVolume: ['greaterThan', 'lessThan']
  };

  const isNumericColumn = (col: FilterableColumns): boolean => 
    col === 'estimatedVolume';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Add Filter</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column
            </label>
            <select
              value={column}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const newColumn = e.target.value as FilterableColumns;
                setColumn(newColumn);
                setType(filterTypes[newColumn][0]);
                setValue(''); // Reset value when changing column
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {columnOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={type}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setType(e.target.value as FilterType);
                setValue(''); // Reset value when changing condition
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {filterTypes[column].map((filterType: FilterType) => (
                <option key={filterType} value={filterType}>
                  {filterTypeDisplayNames[filterType]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type={isNumericColumn(column) ? 'number' : 'text'}
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={`Enter ${isNumericColumn(column) ? 'numeric' : ''} value`}
              min={isNumericColumn(column) ? "0" : undefined}
              step={isNumericColumn(column) ? "1" : undefined}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FilterModal;