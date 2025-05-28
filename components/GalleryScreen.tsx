
import React, { useState } from 'react';

interface GalleryScreenProps {
  chuteKeypadSequence: string;
  // skullsPasswordHelp is no longer needed as a prop, clues are in descriptions
}

interface GalleryItem {
  id: string;
  title: string;
  icon: React.ReactNode; // For placeholder visuals
  description: string;
  listItems?: string[];
}

// Placeholder Icons
const DocumentIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"></path>
  </svg>
);
const ListIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
  </svg>
);
const MapIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 18.414L6 14.414V5.586L10 1.586v16.828zM16 1.586L12 5.586v12.828l4-4V1.586z" clipRule="evenodd"></path>
     <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 18.414L6 14.414V5.586L10 1.586v16.828zM16 1.586L12 5.586v12.828l4-4V1.586zM10 0a1 1 0 00-1 1v18a1 1 0 001.555.832l5-2.5a1 1 0 00.445-.832V3.5a1 1 0 00-.445-.832l-5-2.5A1 1 0 0010 0zM4 3.5a1 1 0 01.445-.832l5-2.5a1 1 0 011.11 0l5 2.5A1 1 0 0116 3.5V16.5a1 1 0 01-.445.832l-5 2.5a1 1 0 01-1.11 0l-5-2.5A1 1 0 014 16.5V3.5z" clipRule="evenodd"></path>
  </svg>
);

const AccordionItem: React.FC<{ item: GalleryItem; isOpen: boolean; onToggle: () => void; }> = ({ item, isOpen, onToggle }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none focus:bg-gray-700/50 transition-colors"
        aria-expanded={isOpen}
        aria-controls={`gallery-content-${item.id}`}
      >
        <div className="flex items-center space-x-3">
          <div className="text-teal-400 flex-shrink-0">{item.icon}</div>
          <span className="text-md sm:text-lg font-semibold text-gray-100">{item.title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      {isOpen && (
        <div id={`gallery-content-${item.id}`} className="p-4 sm:p-5 border-t border-gray-700 bg-gray-800/50">
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{item.description}</p>
          {item.listItems && (
            <ul className="list-disc list-inside mt-3 space-y-1 text-gray-300 text-sm sm:text-base pl-2">
              {item.listItems.map((li, liIndex) => (
                <li key={liIndex}>
                  <code className="bg-gray-700 p-1 rounded text-gray-200 text-xs sm:text-sm">{li}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const GalleryScreen: React.FC<GalleryScreenProps> = ({ chuteKeypadSequence }) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: "skull-diagram",
      title: "Image 1: Skull Network Diagram",
      icon: <DocumentIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
      description: "A crudely drawn network diagram. Several nodes are labelled with cryptic codenames ('Hydra', 'Cerberus', 'Styx'). One central node is larger, labelled 'SKULLS.SYSTEM', with lines connecting to all others. Next to SKULLS.SYSTEM, a small, almost illegible note says: 'Default Pass: Primary Asset Codename'.",
    },
    {
      id: "subject-log",
      title: "Image 2: Subject Log - Excerpt",
      icon: <ListIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
      description: "A photo of a printed page. It appears to be a list:",
      listItems: [
        "Subject #32 - Status: Processed (Reloc. Gamma)",
        "Subject #33 - Status: Pending Assessment (Reloc. Delta)",
        "Subject #34 - Status: Acquisition Confirmed (Asset Codename: LILITH_V)"
      ],
    },
    {
      id: "cell-layout",
      title: "Image 3: Cell Block C - Emergency Layout",
      icon: <MapIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
      description: `A very basic floor plan sketch, labelled "Cell Block C". It shows a few cells, one marked "#34". An arrow points from cell #34 to a spot labelled "Waste Disposal Chute - Manual Override: Keypad Sequence ${chuteKeypadSequence}".`,
    }
  ];

  const handleToggleItem = (itemId: string) => {
    setOpenItemId(openItemId === itemId ? null : itemId);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-4 shadow-md flex items-center justify-between sticky top-0 z-10 border-b border-gray-700">
        <h1 className="text-xl font-bold text-teal-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Gallery - Unlocked
        </h1>
        {/* Back button is handled by main navigation controls */}
      </header>

      <main className="flex-grow p-3 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 sm:space-y-5">
        <p className="text-sm text-gray-400 px-1 sm:px-0 mb-2">Select an item to view details.</p>
        {galleryItems.map((item) => (
          <AccordionItem
            key={item.id}
            item={item}
            isOpen={openItemId === item.id}
            onToggle={() => handleToggleItem(item.id)}
          />
        ))}
      </main>
    </div>
  );
};

export default GalleryScreen;
