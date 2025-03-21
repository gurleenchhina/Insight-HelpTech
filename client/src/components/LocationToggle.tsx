import { Button } from "@/components/ui/button";
import { Location } from "@/lib/types";

interface LocationToggleProps {
  location: Location;
  onToggle: () => void;
}

const LocationToggle = ({ location, onToggle }: LocationToggleProps) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-md shadow-sm bg-white border border-neutral-light" role="group">
        <Button
          variant={location === 'interior' ? 'default' : 'ghost'}
          className={`px-6 py-2 text-sm font-medium ${
            location === 'interior' 
              ? 'bg-primary text-white rounded-l-lg rounded-r-none' 
              : 'text-neutral-dark hover:bg-neutral-lightest rounded-l-lg rounded-r-none'
          }`}
          onClick={() => location === 'exterior' && onToggle()}
        >
          Interior
        </Button>
        <Button
          variant={location === 'exterior' ? 'default' : 'ghost'}
          className={`px-6 py-2 text-sm font-medium ${
            location === 'exterior' 
              ? 'bg-primary text-white rounded-r-lg rounded-l-none' 
              : 'text-neutral-dark hover:bg-neutral-lightest rounded-r-lg rounded-l-none'
          }`}
          onClick={() => location === 'interior' && onToggle()}
        >
          Exterior
        </Button>
      </div>
    </div>
  );
};

export default LocationToggle;
