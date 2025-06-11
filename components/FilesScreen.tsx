
import React, { useState, useEffect, useCallback } from 'react';
import { FileItem } from '../types'; // Renamed from GalleryItem
import { CHUTE_KEYPAD_SEQUENCE, CELL_DOOR_IMAGE_BASE64_DATA } from '../constants';
import LoadingSpinner from './LoadingSpinner';

// Icons
const DocumentIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"></path>
  </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8 sm:w-10 sm:h-10" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10zM10 9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-4 2a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    <path d="M6.5 12.5l1.793-1.793a.5.5 0 01.707 0L10.5 12.5l2.707-2.707a.5.5 0 01.707 0L15.5 11.5V7.5a.5.5 0 00-.5-.5h-10a.5.5 0 00-.5.5v5z" />
    <circle cx="7.5" cy="8.5" r="1.5" />
  </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 sm:w-5 sm:h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 sm:w-5 sm:h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const FileTile: React.FC<{ item: FileItem; onClick: () => void; }> = ({ item, onClick }) => { // Renamed GalleryItem to FileItem
  return (
    <button
      onClick={onClick}
      className="w-24 h-24 sm:w-28 sm:h-28
                 flex flex-col items-center justify-center
                 p-2
                 bg-gray-800 rounded-lg shadow-lg border border-gray-700/80
                 hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-teal-500
                 transition-all duration-150 group"
      aria-label={`Open file: ${item.title}`}
    >
      {React.cloneElement(item.icon, {
        className: "w-8 h-8 sm:w-10 sm:h-10 text-teal-400 group-hover:text-teal-300 transition-colors mb-1 sm:mb-1.5"
      })}
      <span
        className="text-xs text-center text-gray-300 group-hover:text-white transition-colors w-full line-clamp-2"
        title={item.title}
      >
        {item.title}
      </span>
    </button>
  );
};


const FileViewerModal: React.FC<{ file: FileItem | null; isOpen: boolean; onClose: () => void; onMinimize: () => void;}> = ({ file, isOpen, onClose, onMinimize }) => { // Renamed GalleryItem to FileItem
  if (!isOpen || !file) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-viewer-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col overflow-hidden max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-3 bg-gray-700/80 border-b border-gray-600">
          <h2 id="file-viewer-title" className="text-md sm:text-lg font-semibold text-teal-300 truncate pr-2" title={file.title}>
            {file.title}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMinimize}
              className="p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Minimize file viewer"
            >
              <MinusIcon />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:bg-red-600 hover:text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close file viewer"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-5 text-gray-300 overflow-y-auto custom-scrollbar">
          {file.type === 'note' && (
            <>
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-3">{file.description}</p>
              {file.listItems && file.listItems.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Attached Items:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm sm:text-base pl-2">
                    {file.listItems.map((li, liIndex) => (
                      <li key={liIndex}>
                        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 text-xs sm:text-sm">{li}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {file.type === 'photo' && (
             <div className="flex justify-center items-center min-h-[200px]">
               {file.isLoadingImage && file.id === "cell-door-photo" ? (
                <div className="flex flex-col items-center">
                  <LoadingSpinner size="w-10 h-10" />
                  <p className="mt-2 text-sm text-gray-400">Loading image...</p>
                </div>
               ) : file.imageUrl ? (
                 <img src={file.imageUrl} alt={file.title} className="max-w-full h-auto rounded-md object-contain" />
               ) : (
                 <p className="text-center text-gray-500 italic">Image not available.</p>
               )}
             </div>
          )}
        </main>
      </div>
    </div>
  );
};


const FilesScreen: React.FC = () => {
  const [activeOpenFile, setActiveOpenFile] = useState<FileItem | null>(null); // Renamed GalleryItem to FileItem
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const baseFileItems: Omit<FileItem, 'imageUrl' | 'isLoadingImage' | 'content'>[] = [ // Renamed GalleryItem to FileItem
    {
      id: "skull-diagram",
      title: "Skull_Network_Diagram.txt",
      icon: <DocumentIcon />,
      description: "A crudely drawn network diagram. Several nodes are labelled with cryptic codenames ('Hydra', 'Cerberus', 'Styx'). One central node is larger, labelled 'SKULLS.SYSTEM', with lines connecting to all others. Next to SKULLS.SYSTEM, a small, almost illegible note says: 'Default Pass: Primary Asset Codename'.",
      type: 'note',
    },
    {
      id: "subject-log",
      title: "Subject_Log_Excerpt.txt",
      icon: <DocumentIcon />,
      description: "A photo of a printed page. It appears to be a list:",
      listItems: [
        "Subject #32 - Status: Processed (Reloc. Gamma)",
        "Subject #33 - Status: Pending Assessment (Reloc. Delta)",
        "Subject #34 - Status: Acquisition Confirmed (Asset Codename: LILITH_V)"
      ],
      type: 'note',
    },
    {
      id: "cell-layout",
      title: "Cell_Block_C_Layout.txt",
      icon: <DocumentIcon />,
      description: `A very basic floor plan sketch, labelled "Cell Block C". It shows a few cells, one marked "#34". An arrow points from cell #34 to a spot labelled "Waste Disposal Chute - Manual Override: Keypad Sequence ${CHUTE_KEYPAD_SEQUENCE}".`,
      type: 'note',
    },
  ];

  const mappedBaseItems: FileItem[] = baseFileItems.map((item): FileItem => ({ // Renamed GalleryItem to FileItem
    id: item.id,
    title: item.title,
    icon: item.icon,
    description: item.description,
    listItems: item.listItems,
    content: undefined,
    type: item.type,
    imageUrl: undefined,
    isLoadingImage: false,
  }));

  const cellDoorImageItem: FileItem = { // Renamed GalleryItem to FileItem
    id: "cell-door-photo",
    title: "Cell_Door_Detail.jpg",
    icon: <ImageIcon />,
    description: "View of a heavy, locked hatch.",
    type: 'photo',
    imageUrl: CELL_DOOR_IMAGE_BASE64_DATA,
    isLoadingImage: false,
  };

  const fileItems: FileItem[] = [ // Renamed GalleryItem to FileItem
    ...mappedBaseItems,
    cellDoorImageItem
  ].sort((a, b) => a.title.localeCompare(b.title));


  const handleOpenFile = (item: FileItem) => { // Renamed GalleryItem to FileItem
    setActiveOpenFile(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setActiveOpenFile(null), 200);
  }, []);

  const handleMinimizeModal = useCallback(() => {
    handleCloseModal();
  }, [handleCloseModal]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen, handleCloseModal]);


  return (
    <div
      className="flex flex-col h-full w-full bg-gray-900 text-gray-100"
      style={{
        backgroundImage: "url('https://wallpapers.com/images/hd/hacking-background-bryw246r4lx5pyue.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="bg-gray-900/80 backdrop-blur-sm flex flex-col h-full w-full"> {/* Inner div for blurred background content */}
        <header className="bg-gray-800/90 p-4 shadow-md flex items-center justify-between sticky top-0 z-10 border-b border-gray-700">
          <h1 className="text-lg sm:text-xl font-bold text-teal-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Files - Unlocked
          </h1>
        </header>

        <main className="flex-grow p-3 sm:p-4 overflow-y-auto custom-scrollbar">
          <div className="mb-3 sm:mb-4 px-1">
              <p className="text-xs sm:text-sm text-gray-300 bg-black/30 inline-block px-2 py-0.5 rounded">Root Directory</p>
              <p className="text-xs text-gray-400 bg-black/30 inline-block px-2 py-0.5 rounded mt-1">Select a file to view its contents.</p>
          </div>
          <div
            className="w-full flex flex-row flex-wrap gap-4 sm:gap-5 justify-start items-start"
          >
              {fileItems.map((item) => ( // Renamed galleryItems to fileItems
              <FileTile
                  key={item.id}
                  item={item}
                  onClick={() => handleOpenFile(item)}
              />
              ))}
          </div>
        </main>

        <FileViewerModal
          file={activeOpenFile}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onMinimize={handleMinimizeModal}
        />
      </div>
    </div>
  );
};

export default FilesScreen;
