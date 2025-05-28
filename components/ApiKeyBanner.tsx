
import React from 'react';
import { API_KEY_ERROR_MESSAGE } from '../constants';

const ApiKeyBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-3 text-center text-sm font-semibold">
      {API_KEY_ERROR_MESSAGE}
    </div>
  );
};

export default ApiKeyBanner;
    