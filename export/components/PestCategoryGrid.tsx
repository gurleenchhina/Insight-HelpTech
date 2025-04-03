'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bug } from 'lucide-react';
import { PestCategory } from '@/lib/db';

export default function PestCategoryGrid() {
  const [categories, setCategories] = useState<PestCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchPestCategories = async () => {
      try {
        const response = await fetch('/api/pest-categories');
        if (!response.ok) {
          throw new Error('Failed to fetch pest categories');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching pest categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPestCategories();
  }, []);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-neutral-light p-6 rounded-lg h-48 animate-pulse flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-medium mb-4"></div>
            <div className="h-4 bg-neutral-medium rounded w-24 mb-2"></div>
            <div className="h-3 bg-neutral-medium rounded w-36"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Bug className="mx-auto text-neutral-medium mb-4" size={48} />
        <h3 className="text-xl font-medium mb-2">No pest categories found</h3>
        <p className="text-neutral-dark">Try refreshing the page or check back later.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/pests/${category.id}`}
          className="bg-white border border-neutral-light hover:border-primary hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden flex flex-col"
        >
          <div className="aspect-video bg-neutral-light flex items-center justify-center">
            {category.imageUrl ? (
              <img 
                src={category.imageUrl} 
                alt={category.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Bug size={48} className="text-neutral-medium" />
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-medium text-lg mb-1">{category.name}</h3>
            <p className="text-sm text-neutral-dark line-clamp-2">{category.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}