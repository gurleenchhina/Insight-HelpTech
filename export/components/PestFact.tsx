'use client';

import React, { useState, useEffect } from 'react';
import { LightbulbIcon } from 'lucide-react';

const pestFacts = [
  "Ants can lift up to 20 times their own body weight.",
  "A single female bed bug can lay up to 500 eggs in her lifetime.",
  "Cockroaches can live up to a week without their heads.",
  "The jumping spider can jump up to 50 times its own length.",
  "Termites cause over $5 billion in property damage each year in North America.",
  "House flies taste with their feet.",
  "Mosquitoes have killed more humans than all wars combined through disease transmission.",
  "Spiders are not insects - they are arachnids with 8 legs instead of 6.",
  "German cockroaches can reproduce so quickly that a home can be infested in just a few weeks.",
  "Some species of wasps can recognize individual faces of other wasps.",
  "Silverfish can live up to a year without food.",
  "Bed bugs can survive for up to a year without feeding.",
  "Rodents' teeth never stop growing throughout their lifetime.",
  "A flea can jump up to 200 times its own body length.",
  "Carpenter ants don't eat wood, they just excavate it to build nests."
];

export default function PestFact() {
  const [fact, setFact] = useState('');
  
  useEffect(() => {
    // Pick a random fact
    const randomIndex = Math.floor(Math.random() * pestFacts.length);
    setFact(pestFacts[randomIndex]);
  }, []);
  
  return (
    <div className="bg-neutral-light p-4 rounded-md">
      <div className="flex items-start">
        <LightbulbIcon className="text-amber-500 mr-2 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-medium mb-1">Pest Fact</h4>
          <p className="text-gray-700 text-sm">{fact}</p>
        </div>
      </div>
    </div>
  );
}