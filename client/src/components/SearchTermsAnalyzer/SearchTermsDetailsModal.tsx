import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  productName: string;
}

interface ProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  products: Product[];
}

const ITEMS_PER_PAGE = 100;

const ProductsModal: React.FC<ProductsModalProps> = ({
    isOpen,
    onClose,
    searchTerm,
    products
  }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, products.length);
  const currentPageData = products.slice(startIndex, endIndex);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-2xl font-bold">Products Using Search Term</h2>
            <p className="text-sm text-gray-600">
              "{searchTerm}" - {products.length} matching products
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-[1fr,3fr] gap-4 p-4 font-bold bg-gray-100">
            <div>Product ID</div>
            <div>Product Name</div>
          </div>
          <div className="divide-y">
            {currentPageData.map((product) => (
              <div key={product.id} className="grid grid-cols-[1fr,3fr] gap-4 p-4 hover:bg-gray-50">
                <div className="font-medium">{product.id}</div>
                <div>{product.productName}</div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-gray-100">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1}-{endIndex} of {products.length} products
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsModal;