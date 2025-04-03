import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Bug } from 'lucide-react';

const pestFacts = [
  "Ants can lift up to 20 times their body weight, equivalent to a human lifting a car.",
  "Spiders are not insects - they are arachnids with 8 legs and 2 body segments.",
  "A cockroach can live for several weeks without its head.",
  "Termites cause over $5 billion in property damage each year in North America.",
  "Some wasps can recognize the faces of other wasps, just like humans recognize faces.",
  "Mosquitoes have killed more humans than all wars combined by spreading diseases.",
  "House flies taste with their feet, which have taste receptors on them.",
  "Bed bugs can survive for a year without feeding.",
  "Stinkbugs release a defensive odor when threatened, but they can't sting or bite.",
  "Rodents are responsible for 35-40% of all mammal extinctions in the last 500 years.",
  "A single flea can lay up to 50 eggs per day and up to 2,000 in a lifetime.",
  "Carpenter ants don't eat wood but carve tunnels through it to build their nests.",
  "Centipedes have one pair of legs per body segment and always have an odd number of segments.",
  "Silverfish are among the oldest insects and have remained virtually unchanged for 400 million years.",
  "Fruit flies were the first living creatures sent into space for scientific research."
];

const PestFact = () => {
  const [fact, setFact] = useState<string>("");

  useEffect(() => {
    // Get a random fact when the component mounts
    const randomFact = pestFacts[Math.floor(Math.random() * pestFacts.length)];
    setFact(randomFact);
  }, []);

  return (
    <Card className="bg-primary/5 shadow-sm p-4 mt-6 mx-auto max-w-lg">
      <div className="flex items-start gap-3">
        <Bug className="text-primary shrink-0 mt-1" />
        <div>
          <h3 className="font-medium text-primary">Fun Pest Fact</h3>
          <p className="text-sm">{fact}</p>
        </div>
      </div>
    </Card>
  );
};

export default PestFact;