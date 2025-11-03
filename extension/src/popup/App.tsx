import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import type { UserSkinProfile, SkinType, Climate, SkinConcern } from '@shared/types';
import { SKIN_TYPES, CLIMATES, SKIN_CONCERNS } from '@shared/constants/skinTypes';

export default function App() {
  const [profile, setProfile] = useState<UserSkinProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [skinType, setSkinType] = useState<SkinType>('normal');
  const [climate, setClimate] = useState<Climate>('temperate');
  const [concerns, setConcerns] = useState<SkinConcern[]>([]);
  const [detectedProduct, setDetectedProduct] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const saved = await storage.getProfile();
    if (saved) {
      setProfile(saved);
      setSkinType(saved.skinType);
      setClimate(saved.climate);
      setConcerns(saved.concerns);
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const newProfile: UserSkinProfile = {
      skinType,
      climate,
      concerns
    };
    await storage.setProfile(newProfile);
    setProfile(newProfile);
    setIsEditing(false);
  };

  const toggleConcern = (concern: SkinConcern) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  const handleAnalyzeProduct = async () => {
    setIsAnalyzing(true);
    setDetectedProduct(null);

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      if (!currentTab.id) {
        alert('No active tab found');
        setIsAnalyzing(false);
        return;
      }

      const message = { type: 'SCRAPE_PRODUCT' };
      const response = await chrome.tabs.sendMessage(currentTab.id, message);

      if (response.success) {
        setDetectedProduct(response.data);
      } else {
        alert('Failed to detect product on this page');
      }

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error analyzing product:', error);
      alert('Error: Make sure you are on a product page');
      setIsAnalyzing(false);
    }
  };

  if (!profile || isEditing) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">SkinSense Profile</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skin Type
          </label>
          <select
            value={skinType}
            onChange={(e) => setSkinType(e.target.value as SkinType)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {SKIN_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Climate
          </label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value as Climate)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {CLIMATES.map(clim => (
              <option key={clim} value={clim}>
                {clim.charAt(0).toUpperCase() + clim.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skin Concerns
          </label>
          <div className="space-y-2">
            {SKIN_CONCERNS.map(concern => (
              <label key={concern} className="flex items-center">
                <input
                  type="checkbox"
                  checked={concerns.includes(concern)}
                  onChange={() => toggleConcern(concern)}
                  className="mr-2"
                />
                <span className="text-sm">
                  {concern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">SkinSense</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
        <p className="text-sm text-gray-600">Skin Type: <span className="font-medium">{profile.skinType}</span></p>
        <p className="text-sm text-gray-600">Climate: <span className="font-medium">{profile.climate}</span></p>
        <p className="text-sm text-gray-600">Concerns: <span className="font-medium">{profile.concerns.join(', ')}</span></p>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 mb-2"
      >
        Edit Profile
      </button>

      <button
        onClick={handleAnalyzeProduct}
        disabled={isAnalyzing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze This Product'}
      </button>

      {detectedProduct && (
        <div className="mt-4 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Detected Product</h2>
          <p className="text-sm text-gray-600">Name: <span className="font-medium">{detectedProduct.productName}</span></p>
          <p className="text-sm text-gray-600">Brand: <span className="font-medium">{detectedProduct.brand || 'Unknown'}</span></p>
          <p className="text-sm text-gray-600">Ingredients: <span className="font-medium">{detectedProduct.ingredients.length} found</span></p>
          <p className="text-sm text-gray-600 break-all">URL: <span className="font-medium text-xs">{detectedProduct.url}</span></p>
        </div>
      )}
    </div>
  );
}
