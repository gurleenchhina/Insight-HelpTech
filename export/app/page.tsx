import Link from 'next/link';
import Search from '@/components/Search';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              HelpTech Pest Solutions
            </span>
          </h1>
          
          <Search />
          
          <div className="mt-12 text-center text-neutral-dark text-sm">
            <p className="mb-2">Looking for pest treatment recommendations in Ontario?</p>
            <p>Enter your question above or browse common pest categories below</p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link 
              href="/pests" 
              className="btn-primary inline-flex items-center"
            >
              Browse Pest Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}