'use client';

import React from 'react';
import { StarFilled } from '@ant-design/icons';
import { TopProduct } from '../types';

const topProducts: TopProduct[] = [
  {
    name: 'Dark Chocolate Truffles',
    brand: 'Godiva',
    rating: 4.8,
    reviews: 1250,
    keywords: ['premium', 'smooth', 'rich']
  },
  {
    name: 'Sea Salt Caramel Chocolate',
    brand: 'Lindt',
    rating: 4.7,
    reviews: 980,
    keywords: ['sweet-salty', 'creamy', 'luxurious']
  },
  {
    name: 'Hazelnut Praline Bar',
    brand: 'Ferrero',
    rating: 4.9,
    reviews: 2100,
    keywords: ['nutty', 'crunchy', 'indulgent']
  }
];

const DataSources: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex-shrink-0">
      <h3 className="text-lg font-semibold mb-4">数据源</h3>
      <div className="p-3 bg-gray-50 rounded-lg mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">热门关键词</h4>
        <div className="flex flex-wrap gap-2">
          {['Premium', 'Organic', 'Sustainable', 'Luxury', 'Natural'].map((keyword) => (
            <span key={keyword} className="!rounded-button bg-white px-3 py-1 text-xs font-medium text-gray-600 border">
              {keyword}
            </span>
          ))}
        </div>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">热门产品</h4>
        <div className="space-y-3">
          {topProducts.map((product) => (
            <div key={product.name} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                <div className="text-xs text-gray-500">{product.brand}</div>
              </div>
              <div className="flex items-center">
                <StarFilled className="text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataSources; 