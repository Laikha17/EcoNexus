import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { RoleType, UserRole } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { Recycle, ArrowLeft, Factory, ShoppingBag, Truck, Check, Sparkles, Camera, Upload, User } from 'lucide-react';
import { clsx } from 'clsx';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

interface SignupPageProps {
  onGoToLogin: () => void;
  onGoToLanding: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onGoToLogin, onGoToLanding }) => {
  const { signup, addToast } = useEcoNexus();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [industry, setIndustry] = useState('Textile Manufacturing');
  const [location, setLocation] = useState('Bhimavaram, Andhra Pradesh');
  const [avatar, setAvatar] = useState<string>(AVATAR_PRESETS[0]);

  // Multi-Role Selection (No Admin allowed in public sign up)
  const [selectedRoles, setSelectedRoles] = useState<RoleType[]>(['SELLER', 'BUYER']);

  // Role-specific Fields
  const [materialCategories, setMaterialCategories] = useState<string>('Textiles & Fabric');
  const [monthlyDemand, setMonthlyDemand] = useState('500 - 1,000 kg');
  const [serviceArea, setServiceArea] = useState('Coastal Andhra Pradesh');
  const [vehicleInfo, setVehicleInfo] = useState('14ft Container Trucks (10 Ton capacity)');

  const toggleRole = (role: RoleType) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter(r => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // Step 1 Validation
      if (!company.trim() || !contactPerson.trim() || !phone.trim() || !email.trim() || !password.trim()) {
        addToast('Please fill out all required fields.', 'error');
        return;
      }
      if (password.length < 6) {
        addToast('Password must be at least 6 characters long.', 'error');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (selectedRoles.length === 0) {
        addToast('Please select at least one business capability role.', 'error');
        return;
      }
      setStep(3);
      return;
    }

    // Step 3 Submission
    if (!location.trim()) {
      addToast('Please provide your registered facility location.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        company,
        contactPerson,
        email,
        phone,
        password,
        industry,
        location,
        avatar,
        roles: selectedRoles,
        role: selectedRoles[0].toLowerCase() as UserRole,
        materialsOfInterest: [materialCategories],
        monthlyDemand,
        serviceArea,
        vehicleInfo
      });
    } catch (err: any) {
      setIsSubmitting(false);
      // If error is related to credentials, take user back to step 1 to fix
      if (err?.code?.startsWith('auth/')) {
        setStep(1);
      }
    }
  };

  const accountTypes = [
    {
      role: 'SELLER' as RoleType,
      title: 'Waste Generator / Seller',
      desc: 'Monetize surplus industrial scrap, offcuts, and raw material waste.',
      icon: <Factory className="w-5 h-5 text-emerald-600" />
    },
    {
      role: 'BUYER' as RoleType,
      title: 'Resource Buyer / Manufacturer',
      desc: 'Procure secondary circular raw materials to lower production costs.',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />
    },
    {
      role: 'LOGISTICS' as RoleType,
      title: 'Logistics Transport Partner',
      desc: 'Handle industrial pickup, container haulage, and delivery dispatches.',
      icon: <Truck className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to EcoNexus Home
        </button>

        <div className="flex items-center justify-center gap-2">
          <img src="/econexus-logo.jpg" alt="EcoNexus Logo" className="w-11 h-11 rounded-xl object-cover ring-1 ring-emerald-500/20 shadow-xs" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">Eco<span className="text-emerald-600">Nexus</span></span>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900">Create Business Account</h2>
        <p className="text-xs text-slate-500">
          Step {step} of 3 — {step === 1 ? 'Company Details' : step === 2 ? 'Select Platform Capabilities (Multi-Role Support)' : 'Profile Configuration'}
        </p>

        {/* Stepper indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx(
                'h-1.5 rounded-full transition-all duration-300',
                s === step ? 'w-8 bg-emerald-600' : s < step ? 'w-4 bg-emerald-300' : 'w-4 bg-slate-200'
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <Card padded className="shadow-modal border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Step 1: Corporate Details */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <Input
                  label="Legal Business / Company Name"
                  placeholder="e.g. Ramesh Textiles & Material Works"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Contact Person Name"
                    placeholder="Ramesh Varma"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />

                  <Input
                    label="Official Phone Number"
                    placeholder="+91 98480 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Business Email Address"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Input
                    label="Account Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Select
                  label="Primary Industry Sector"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  options={[
                    { value: 'Textile Manufacturing', label: 'Textile Manufacturing' },
                    { value: 'Furniture & Home Upholstery', label: 'Furniture & Home Upholstery' },
                    { value: 'Plastics & Polymer Molding', label: 'Plastics & Polymer Molding' },
                    { value: 'Metal Scrap & Alloy Works', label: 'Metal Scrap & Alloy Works' },
                    { value: 'Industrial Logistics & Haulage', label: 'Industrial Logistics & Haulage' }
                  ]}
                />
              </div>
            )}

            {/* Step 2: Multi-Role Selection (Checkboxes) */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">Select Business Capabilities</h3>
                  <p className="text-xs text-slate-500">
                    A single EcoNexus business account can act as both a <strong className="text-slate-800">Seller</strong> and a <strong className="text-slate-800">Buyer</strong>. Select all that apply:
                  </p>
                </div>

                <div className="space-y-3">
                  {accountTypes.map((acc) => {
                    const isSelected = selectedRoles.includes(acc.role);
                    return (
                      <div
                        key={acc.role}
                        onClick={() => toggleRole(acc.role)}
                        className={clsx(
                          'p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4',
                          isSelected
                            ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        )}
                      >
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div onClick
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0">
                          {acc.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{acc.title}</h4>
                            {isSelected && (
                              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{acc.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Operational Details */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <Input
                  label="Registered Facility Location"
                  placeholder="e.g. Autonagar, Bhimavaram, AP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />

                {selectedRoles.includes('SELLER') && (
                  <Select
                    label="Primary Waste Categories Generated"
                    value={materialCategories}
                    onChange={(e) => setMaterialCategories(e.target.value)}
                    options={[
                      { value: 'Textiles & Fabric', label: 'Textiles & Fabric Waste' },
                      { value: 'Plastics & Polymers', label: 'Plastics & Polymers' },
                      { value: 'Metals & Alloys', label: 'Metals & Scrap Alloys' },
                      { value: 'Paper & Packaging', label: 'Paper & Corrugated Scrap' }
                    ]}
                  />
                )}

                {selectedRoles.includes('BUYER') && (
                  <Select
                    label="Estimated Monthly Sourcing Demand"
                    value={monthlyDemand}
                    onChange={(e) => setMonthlyDemand(e.target.value)}
                    options={[
                      { value: '100 - 500 kg', label: '100 - 500 kg / month' },
                      { value: '500 - 1,000 kg', label: '500 - 1,000 kg / month' },
                      { value: '1,000 - 5,000 kg', label: '1,000 - 5,000 kg / month' },
                      { value: '5,000+ kg', label: '5,000+ kg (Bulk Industrial Demand)' }
                    ]}
                  />
                )}

                {selectedRoles.includes('LOGISTICS') && (
                  <Input
                    label="Fleet & Capacity Info"
                    value={vehicleInfo}
                    onChange={(e) => setVehicleInfo(e.target.value)}
                  />
                )}

                {/* Profile Display Picture (DP) Upload & Selection */}
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Profile Display Picture (DP)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group shrink-0">
                      <img
                        src={avatar}
                        alt="Profile DP Preview"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 shadow-sm"
                      />
                      <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-full cursor-pointer shadow-sm transition-transform group-hover:scale-110">
                        <Camera className="w-3.5 h-3.5" />
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

                    <div className="flex-1 space-y-2 text-xs w-full">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-white px-3 py-1.5 border border-slate-300 hover:border-emerald-500 rounded-lg font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs text-xs transition-colors">
                          <Upload className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Upload DP Photo</span>
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

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Or choose avatar preset:</span>
                        <div className="flex items-center gap-2">
                          {AVATAR_PRESETS.map((p, idx) => (
                            <img
                              key={idx}
                              src={p}
                              alt={`Preset ${idx + 1}`}
                              onClick={() => setAvatar(p)}
                              className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition-all ${
                                avatar === p ? 'border-emerald-600 ring-2 ring-emerald-400 scale-105' : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              <Button type="submit" variant="primary" size="md" loading={isSubmitting} disabled={isSubmitting}>
                {step < 3 ? 'Continue' : isSubmitting ? 'Creating Business Account...' : 'Complete Business Registration'}
              </Button>
            </div>
          </form>

          <div className="border-t border-slate-100 pt-4 mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already registered?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-emerald-600 hover:text-emerald-700"
              >
                Sign In to Workspace
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
