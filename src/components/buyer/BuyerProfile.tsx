import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { Badge } from '../common/Badge';
import { Building2, MapPin, Sparkles, ShieldCheck, Check, Camera, Upload, User as UserIcon } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

export const BuyerProfile: React.FC = () => {
  const { currentUser, updateUserProfile, addToast } = useEcoNexus();

  if (!currentUser) return null;

  const [company, setCompany] = useState(currentUser.company);
  const [industry, setIndustry] = useState(currentUser.industry);
  const [location, setLocation] = useState(currentUser.location);
  const [avatar, setAvatar] = useState<string>(currentUser.avatar || AVATAR_PRESETS[0]);
  const [monthlyDemand, setMonthlyDemand] = useState(currentUser.monthlyDemand || '500 - 1,000 kg');
  const [interestedMaterials, setInterestedMaterials] = useState<string[]>(
    currentUser.materialsOfInterest || ['Textiles & Fabric', 'Rubber & Tyres']
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        company,
        industry,
        location,
        avatar,
        monthlyDemand,
        materialsOfInterest: interestedMaterials
      });
      addToast('Enterprise profile and profile DP updated successfully!', 'success');
    } catch (err: any) {
      addToast('Failed to update profile preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMaterial = (mat: string) => {
    if (interestedMaterials.includes(mat)) {
      setInterestedMaterials(interestedMaterials.filter(m => m !== mat));
    } else {
      setInterestedMaterials([...interestedMaterials, mat]);
    }
  };

  const allCategories = [
    'Textiles & Fabric',
    'Plastics & Polymers',
    'Metals & Alloys',
    'Paper & Packaging',
    'Chemicals & Solvents',
    'Rubber & Tyres'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="verified">GST & Trade License Verified</Badge>
          <Badge variant="info">
            {currentUser.roles ? currentUser.roles.join(' + ') : currentUser.role.toUpperCase()}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Enterprise Business Profile</h1>
        <p className="text-xs text-slate-500">
          Manage your enterprise profile, operational location, and industrial preferences in EcoNexus.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Display Picture (DP) Editing Card */}
        <Card padded space-y-4 className="bg-white border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Profile Display Picture (DP)
            </h2>
            <span className="text-xs text-slate-500 font-medium">Visible to verified trading partners</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt={company}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
              />
              <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition-transform group-hover:scale-110">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setAvatar(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex-1 space-y-3 w-full text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Upload Custom Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setAvatar(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-semibold block">Or select an avatar preset:</span>
                <div className="flex items-center gap-2.5">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      onClick={() => setAvatar(preset)}
                      className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        avatar === preset ? 'border-emerald-600 ring-2 ring-emerald-400 scale-110 shadow-xs' : 'border-slate-200 hover:border-emerald-400 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padded space-y-4>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Enterprise Details & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />

            <Input
              label="Manufacturing Industry Sector"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Factory Facility Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              prefixSymbol={<MapPin className="w-4 h-4" />}
              required
            />

            <Input
              label="Est. Monthly Recycled Material Demand"
              value={monthlyDemand}
              onChange={(e) => setMonthlyDemand(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Material Requirements Selection */}
        <Card padded space-y-4>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>2. Categories of Interest for ML Matching</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {allCategories.map((cat) => {
              const isSelected = interestedMaterials.includes(cat);
              return (
                <div
                  key={cat}
                  onClick={() => toggleMaterial(cat)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-1 ring-emerald-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" loading={isSaving} disabled={isSaving}>
            {isSaving ? 'Saving Preferences...' : 'Save Profile Preferences'}
          </Button>
        </div>
      </form>
    </div>
  );
};
