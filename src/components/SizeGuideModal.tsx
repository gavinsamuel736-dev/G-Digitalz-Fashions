import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [unit, setUnit] = useState<'cm' | 'inches'>('cm');

  if (!isSizeGuideOpen) return null;

  const womenSizes = [
    { size: 'UK 8 / XS', bust: unit === 'cm' ? '82 - 85 cm' : '32 - 33.5 in', waist: unit === 'cm' ? '64 - 67 cm' : '25 - 26.5 in', hips: unit === 'cm' ? '90 - 93 cm' : '35.5 - 36.5 in' },
    { size: 'UK 10 / S', bust: unit === 'cm' ? '86 - 89 cm' : '34 - 35 in', waist: unit === 'cm' ? '68 - 71 cm' : '27 - 28 in', hips: unit === 'cm' ? '94 - 97 cm' : '37 - 38 in' },
    { size: 'UK 12 / M', bust: unit === 'cm' ? '90 - 94 cm' : '35.5 - 37 in', waist: unit === 'cm' ? '72 - 76 cm' : '28.5 - 30 in', hips: unit === 'cm' ? '98 - 102 cm' : '38.5 - 40 in' },
    { size: 'UK 14 / L', bust: unit === 'cm' ? '95 - 100 cm' : '37.5 - 39.5 in', waist: unit === 'cm' ? '77 - 82 cm' : '30.5 - 32.5 in', hips: unit === 'cm' ? '103 - 108 cm' : '40.5 - 42.5 in' },
    { size: 'UK 16 / XL', bust: unit === 'cm' ? '101 - 107 cm' : '40 - 42 in', waist: unit === 'cm' ? '83 - 89 cm' : '33 - 35 in', hips: unit === 'cm' ? '109 - 115 cm' : '43 - 45 in' },
  ];

  const menSizes = [
    { size: '38R / S', chest: unit === 'cm' ? '96 - 99 cm' : '38 in', waist: unit === 'cm' ? '78 - 81 cm' : '31 - 32 in', shoulder: unit === 'cm' ? '45 cm' : '17.7 in' },
    { size: '40R / M', chest: unit === 'cm' ? '101 - 104 cm' : '40 in', waist: unit === 'cm' ? '82 - 86 cm' : '33 - 34 in', shoulder: unit === 'cm' ? '47 cm' : '18.5 in' },
    { size: '42R / L', chest: unit === 'cm' ? '106 - 109 cm' : '42 in', waist: unit === 'cm' ? '87 - 91 cm' : '35 - 36 in', shoulder: unit === 'cm' ? '48.5 cm' : '19.1 in' },
    { size: '44R / XL', chest: unit === 'cm' ? '111 - 116 cm' : '44 in', waist: unit === 'cm' ? '92 - 97 cm' : '37 - 38 in', shoulder: unit === 'cm' ? '50 cm' : '19.7 in' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={() => setIsSizeGuideOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 text-[#1A1816]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl font-semibold">Atelier Measurement Chart</h3>
              <p className="text-xs text-[#7A7165]">Kampala standard couture & international sizing conversion</p>
            </div>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-1.5 text-[#7A7165] hover:text-[#1A1816] rounded-full hover:bg-[#EFECE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Switcher */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#595045]">
            Women's Measurements
          </span>
          <div className="flex items-center bg-[#EFECE6] rounded p-1 text-xs font-medium">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded transition-colors ${unit === 'cm' ? 'bg-[#1A1816] text-white' : 'text-[#7A7165]'}`}
            >
              Centimeters (cm)
            </button>
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 rounded transition-colors ${unit === 'inches' ? 'bg-[#1A1816] text-white' : 'text-[#7A7165]'}`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Women's Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
                <th className="py-2.5 font-medium">Size</th>
                <th className="py-2.5 font-medium">Bust</th>
                <th className="py-2.5 font-medium">Waist</th>
                <th className="py-2.5 font-medium">Hips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] font-body">
              {womenSizes.map((row) => (
                <tr key={row.size} className="hover:bg-[#F3EFEA]">
                  <td className="py-2.5 font-semibold text-[#1A1816]">{row.size}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.bust}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.waist}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Men's Table */}
        <div className="mt-8 mb-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#595045]">
            Men's Measurements
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
                <th className="py-2.5 font-medium">Jacket Size</th>
                <th className="py-2.5 font-medium">Chest</th>
                <th className="py-2.5 font-medium">Waist</th>
                <th className="py-2.5 font-medium">Shoulder Width</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] font-body">
              {menSizes.map((row) => (
                <tr key={row.size} className="hover:bg-[#F3EFEA]">
                  <td className="py-2.5 font-semibold text-[#1A1816]">{row.size}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.chest}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.waist}</td>
                  <td className="py-2.5 tabular-nums text-[#4A433A]">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bespoke Tailoring Callout */}
        <div className="mt-6 p-4 bg-[#EFECE6] rounded-md text-xs text-[#4A433A] flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#8E6C3B] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1A1816] mb-0.5">Need Made-to-Measure / Bespoke Fitting?</p>
            <p className="text-[#595045] leading-relaxed">
              We offer bespoke fitting appointments at our Nakasero studio or can craft pieces according to your exact WhatsApp measurements with our master cutter. Select &quot;Bespoke Made-to-Measure&quot; on any garment.
            </p>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-medium hover:bg-[#322D27]"
          >
            Close Sizing Guide
          </button>
        </div>
      </div>
    </div>
  );
};
