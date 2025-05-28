
import React from 'react';

interface SkullsSystemScreenProps {
  relocationEta: string;
}

const SkullsSystemScreen: React.FC<SkullsSystemScreenProps> = ({ relocationEta }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full my-8 text-gray-200 border border-teal-700/50">
      <header className="text-center mb-6 pb-4 border-b border-teal-700/50">
        <h1 className="text-3xl font-bold text-teal-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          SKULLS.SYSTEM
        </h1>
        <p className="text-sm text-gray-400">Secure Operations Network</p>
      </header>

      <div className="space-y-5">
        <section aria-labelledby="system-status-heading">
          <h2 id="system-status-heading" className="text-xl font-semibold text-teal-500 mb-2">SYSTEM STATUS: <span className="text-green-400">ONLINE</span></h2>
          <p className="text-gray-300">Welcome, Operative.</p>
        </section>

        <section aria-labelledby="active-subject-heading" className="bg-gray-700/50 p-4 rounded-md">
          <h2 id="active-subject-heading" className="text-lg font-semibold text-teal-400 mb-1">CURRENT ACTIVE SUBJECT:</h2>
          <ul className="list-disc list-inside ml-4 text-gray-300 space-y-1">
            <li>ID: <code className="bg-gray-600 px-1 rounded">#34</code></li>
            <li>Asset Codename: <code className="bg-gray-600 px-1 rounded">LILITH_V</code></li>
            <li>Cell Block Assignment: <code className="bg-gray-600 px-1 rounded">C</code></li>
            <li>Containment Protocol: <code className="bg-gray-600 px-1 rounded">STANDARD</code></li>
          </ul>
        </section>
        
        <section aria-labelledby="relocation-info-heading" className="bg-gray-700/50 p-4 rounded-md">
          <h2 id="relocation-info-heading" className="text-lg font-semibold text-red-400 mb-1">RELOCATION NOTICE:</h2>
           <p className="text-red-300">
            Relocation Unit ETA for Subject #34: <strong className="text-yellow-300">{relocationEta}</strong>
          </p>
          <p className="text-sm text-gray-400 mt-1">Ensure subject readiness for transfer.</p>
        </section>

        <section aria-labelledby="protocols-heading" className="bg-gray-700/50 p-4 rounded-md">
            <h2 id="protocols-heading" className="text-lg font-semibold text-teal-400 mb-1">OPERATIONAL NOTES:</h2>
            <ul className="list-disc list-inside ml-4 text-gray-300 space-y-1 text-sm">
                <li>Emergency Protocols: Access via local cell interface only.</li>
                <li>Waste disposal chute in Cell Block C, Cell #34 requires manual override for unscheduled use. Standard operations only.</li>
                <li>All deviations from protocol must be logged post-incident.</li>
            </ul>
        </section>

        <div className="text-center mt-8 pt-4 border-t border-teal-700/50">
            <p className="text-xs text-gray-500">Access Logged: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default SkullsSystemScreen;