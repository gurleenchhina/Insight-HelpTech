import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function PestDetailsPage({ params }: { params: { id: string } }) {
  const pestId = parseInt(params.id);
  
  if (isNaN(pestId)) {
    notFound();
  }
  
  const pestCategory = await db.getPestCategoryById(pestId);
  
  if (!pestCategory) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/pests" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="mr-2" size={20} />
          <span>Back to Categories</span>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-video bg-neutral-light relative">
          {pestCategory.imageUrl ? (
            <img 
              src={pestCategory.imageUrl} 
              alt={pestCategory.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-neutral-light">
              <span className="text-neutral-dark">No image available</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{pestCategory.name}</h1>
          <p className="text-gray-700 mb-8">{pestCategory.description}</p>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recommended Treatment</h2>
            <TreatmentGuidelines pestName={pestCategory.name} />
          </div>
          
          <div className="mt-8">
            <Link 
              href={`/?search=${encodeURIComponent(`How to treat ${pestCategory.name}`)}`}
              className="btn-primary inline-flex items-center"
            >
              Get AI Recommendations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreatmentGuidelines({ pestName }: { pestName: string }) {
  // This could be expanded to fetch from an API or database
  const guidelines = {
    "Ants": (
      <>
        <p className="mb-4">For interior ant infestations:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>If the property can be vacated: Use <strong>Seclira WSG</strong> as a broad spray application.</li>
          <li>Without vacation: Apply <strong>Greenway Ant Gel</strong> or <strong>Maxforce Quantum</strong> in cracks, crevices, and ant trails.</li>
        </ul>
        <p className="mb-4">For exterior ant infestations:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Primary option: <strong>Suspend Polyzone</strong> as a perimeter spray.</li>
          <li>Alternative: <strong>Temprid SC</strong> for persistent problems.</li>
          <li>For mounds and soil nests: <strong>Scorpio Ant Bait</strong> granules.</li>
        </ul>
      </>
    ),
    "Spiders": (
      <>
        <p className="mb-4">For interior spider control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>If the property can be vacated: Use <strong>Seclira WSG</strong> as a targeted application in corners, ceilings, and crawl spaces.</li>
          <li>Without vacation: Apply <strong>Drione</strong> dust in cracks and voids.</li>
        </ul>
        <p className="mb-4">For exterior spider control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Primary option: <strong>Suspend Polyzone</strong> applied to eaves, doorways, and window frames.</li>
          <li>Alternative: <strong>Temprid SC</strong> for areas with high web concentrations.</li>
        </ul>
      </>
    ),
    "Wasps": (
      <>
        <p className="mb-4">For wasp nest removal:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Visible nests: Use <strong>KONK</strong> aerosol from a safe distance.</li>
          <li>Hidden nests: Apply <strong>Drione</strong> dust into entry points.</li>
          <li>For indoor nests: <strong>Drione</strong> dust with wasp traps placed outside.</li>
        </ul>
      </>
    ),
    "Rodents": (
      <>
        <p className="mb-4">For rodent control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Exterior baiting: <strong>Contrac Blox</strong> in tamper-resistant bait stations.</li>
          <li>Interior baiting: <strong>Resolv</strong> or <strong>Contrac</strong> in secure bait stations.</li>
          <li>Always use mechanical traps alongside rodenticides for effective control.</li>
        </ul>
      </>
    ),
    "Cockroaches": (
      <>
        <p className="mb-4">For cockroach control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Use <strong>Maxforce Quantum</strong> gel bait in cracks and crevices.</li>
          <li>Apply <strong>Seclira WSG</strong> in voids and harborage areas.</li>
          <li>For heavy infestations, combine baits with IGRs (Insect Growth Regulators).</li>
        </ul>
      </>
    ),
    "Bed Bugs": (
      <>
        <p className="mb-4">For bed bug control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Apply <strong>Temprid SC</strong> as a spot treatment to harbourage areas.</li>
          <li>Use <strong>Drione</strong> dust in voids, cracks, and electrical outlets.</li>
          <li>Recommend encasements for mattresses and box springs.</li>
          <li>Multiple treatments are typically required over 2-3 weeks.</li>
        </ul>
      </>
    ),
    "Stink Bugs": (
      <>
        <p className="mb-4">For stink bug control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Seal entry points around windows, doors, and utility penetrations.</li>
          <li>Apply <strong>Seclira WSG</strong> around doors, windows, and other entry points.</li>
          <li>For ongoing problems, use <strong>Demand CS</strong> as a barrier treatment.</li>
        </ul>
      </>
    ),
    "Centipedes": (
      <>
        <p className="mb-4">For centipede/millipede control:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Inside homes: Apply <strong>Seclira WSG</strong> along baseboards and entry points.</li>
          <li>Use <strong>sticky glue traps</strong> to monitor activity levels.</li>
          <li>Outside: <strong>Suspend Polyzone</strong> as a perimeter treatment.</li>
        </ul>
      </>
    )
  };

  const defaultGuidelines = (
    <p>
      Use the AI search feature for specific treatment recommendations for this pest type.
    </p>
  );

  return (
    <div className="bg-neutral-light p-4 rounded-md">
      {guidelines[pestName as keyof typeof guidelines] || defaultGuidelines}
    </div>
  );
}