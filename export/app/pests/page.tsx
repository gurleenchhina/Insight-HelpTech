import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PestCategoryGrid from '@/components/PestCategoryGrid';

export default async function PestsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          <span>Back to Search</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Pest Categories</h1>
      
      <p className="text-gray-600 mb-6">
        Select a pest category to learn about recommended treatment methods and products for Ontario pest technicians.
      </p>
      
      <PestCategoryGrid />
    </div>
  );
}