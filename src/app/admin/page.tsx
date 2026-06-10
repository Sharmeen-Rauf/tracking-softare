'use client';

import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

// Detailed mock representation of employee structure matching the system rules
const MOCK_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'Alice Carter',
    accounts: [
      { id: 'acc-1a', name: 'AeroMax Aviation' },
      { id: 'acc-1b', name: 'Bella Fashions' },
      { id: 'acc-1c', name: 'CyberNetic Solutions' }
    ]
  },
  {
    id: 'emp-2',
    name: 'Bob Sterling',
    accounts: [
      { id: 'acc-2a', name: 'Dexter Logistics' },
      { id: 'acc-2b', name: 'Echo Solar Energy' },
      { id: 'acc-2c', name: 'Fusion Bakeries' }
    ]
  },
  {
    id: 'emp-3',
    name: 'Charlie Vance',
    accounts: [
      { id: 'acc-3a', name: 'Genesis BioTech' },
      { id: 'acc-3b', name: 'Horizon Travels' },
      { id: 'acc-3c', name: 'Apex Real Estate' }
    ]
  },
  {
    id: 'emp-4',
    name: 'Diana Prince',
    accounts: [
      { id: 'acc-4a', name: 'Javalin Software' },
      { id: 'acc-4b', name: 'Krypton Minerals' },
      { id: 'acc-4c', name: 'Lunar Coffee Co.' }
    ]
  },
  {
    id: 'emp-5',
    name: 'Ethan Hunt',
    accounts: [
      { id: 'acc-5a', name: 'Mission Logistics' },
      { id: 'acc-5b', name: 'Nova Marketing' },
      { id: 'acc-5c', name: 'Omega Watchmakers' }
    ]
  }
];

// Hydrate the dashboard with 25 historical links to show working filter/search functionality
const MOCK_SUBMISSIONS = [
  // Alice Carter - emp-1
  {
    id: 'sub-1',
    url: 'https://www.youtube.com/watch?v=AeroMaxPromoYt',
    platform: 'YOUTUBE' as const,
    clientAccountId: 'acc-1a',
    clientAccountName: 'AeroMax Aviation',
    submittedById: 'emp-1',
    submittedByName: 'Alice Carter',
    createdAt: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 'sub-2',
    url: 'https://www.instagram.com/reel/BellaFashionInsta',
    platform: 'INSTAGRAM' as const,
    clientAccountId: 'acc-1b',
    clientAccountName: 'Bella Fashions',
    submittedById: 'emp-1',
    submittedByName: 'Alice Carter',
    createdAt: new Date(Date.now() - 1000 * 60 * 12)
  },
  {
    id: 'sub-3',
    url: 'https://www.tiktok.com/@cybernetic/video/CyberSolutionsTiktok',
    platform: 'TIKTOK' as const,
    clientAccountId: 'acc-1c',
    clientAccountName: 'CyberNetic Solutions',
    submittedById: 'emp-1',
    submittedByName: 'Alice Carter',
    createdAt: new Date(Date.now() - 1000 * 60 * 22)
  },
  
  // Bob Sterling - emp-2
  {
    id: 'sub-4',
    url: 'https://www.facebook.com/watch?v=DexterLogisticsFb',
    platform: 'FACEBOOK' as const,
    clientAccountId: 'acc-2a',
    clientAccountName: 'Dexter Logistics',
    submittedById: 'emp-2',
    submittedByName: 'Bob Sterling',
    createdAt: new Date(Date.now() - 1000 * 60 * 8)
  },
  {
    id: 'sub-5',
    url: 'https://www.youtube.com/shorts/EchoSolarYt',
    platform: 'YOUTUBE' as const,
    clientAccountId: 'acc-2b',
    clientAccountName: 'Echo Solar Energy',
    submittedById: 'emp-2',
    submittedByName: 'Bob Sterling',
    createdAt: new Date(Date.now() - 1000 * 60 * 18)
  },
  
  // Charlie Vance - emp-3
  {
    id: 'sub-6',
    url: 'https://www.tiktok.com/@genesis/video/GenesisBioTechTiktok',
    platform: 'TIKTOK' as const,
    clientAccountId: 'acc-3a',
    clientAccountName: 'Genesis BioTech',
    submittedById: 'emp-3',
    submittedByName: 'Charlie Vance',
    createdAt: new Date(Date.now() - 1000 * 60 * 3)
  },
  {
    id: 'sub-7',
    url: 'https://www.instagram.com/p/HorizonTravelsInsta',
    platform: 'INSTAGRAM' as const,
    clientAccountId: 'acc-3b',
    clientAccountName: 'Horizon Travels',
    submittedById: 'emp-3',
    submittedByName: 'Charlie Vance',
    createdAt: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 'sub-8',
    url: 'https://www.facebook.com/story.php?ApexRealEstateFb',
    platform: 'FACEBOOK' as const,
    clientAccountId: 'acc-3c',
    clientAccountName: 'Apex Real Estate',
    submittedById: 'emp-3',
    submittedByName: 'Charlie Vance',
    createdAt: new Date(Date.now() - 1000 * 60 * 25)
  },

  // Diana Prince - emp-4
  {
    id: 'sub-9',
    url: 'https://www.youtube.com/watch?v=JavalinSoftwareYt',
    platform: 'YOUTUBE' as const,
    clientAccountId: 'acc-4a',
    clientAccountName: 'Javalin Software',
    submittedById: 'emp-4',
    submittedByName: 'Diana Prince',
    createdAt: new Date(Date.now() - 1000 * 60 * 35)
  },
  {
    id: 'sub-10',
    url: 'https://www.instagram.com/reel/KryptonMineralsInsta',
    platform: 'INSTAGRAM' as const,
    clientAccountId: 'acc-4b',
    clientAccountName: 'Krypton Minerals',
    submittedById: 'emp-4',
    submittedByName: 'Diana Prince',
    createdAt: new Date(Date.now() - 1000 * 60 * 40)
  },
  {
    id: 'sub-11',
    url: 'https://www.tiktok.com/@lunarcoffee/video/LunarCoffeeTiktok',
    platform: 'TIKTOK' as const,
    clientAccountId: 'acc-4c',
    clientAccountName: 'Lunar Coffee Co.',
    submittedById: 'emp-4',
    submittedByName: 'Diana Prince',
    createdAt: new Date(Date.now() - 1000 * 60 * 45)
  },

  // Ethan Hunt - emp-5
  {
    id: 'sub-12',
    url: 'https://www.facebook.com/watch?v=MissionLogisticsFb',
    platform: 'FACEBOOK' as const,
    clientAccountId: 'acc-5a',
    clientAccountName: 'Mission Logistics',
    submittedById: 'emp-5',
    submittedByName: 'Ethan Hunt',
    createdAt: new Date(Date.now() - 1050 * 60 * 4)
  },
  {
    id: 'sub-13',
    url: 'https://www.youtube.com/watch?v=NovaMarketingYt',
    platform: 'YOUTUBE' as const,
    clientAccountId: 'acc-5b',
    clientAccountName: 'Nova Marketing',
    submittedById: 'emp-5',
    submittedByName: 'Ethan Hunt',
    createdAt: new Date(Date.now() - 1050 * 60 * 14)
  },
  {
    id: 'sub-14',
    url: 'https://www.instagram.com/p/OmegaWatchmakersInsta',
    platform: 'INSTAGRAM' as const,
    clientAccountId: 'acc-5c',
    clientAccountName: 'Omega Watchmakers',
    submittedById: 'emp-5',
    submittedByName: 'Ethan Hunt',
    createdAt: new Date(Date.now() - 1050 * 60 * 24)
  }
];

// Add extra historical records to pad the database with 650 links to simulate the overview target progress card
const PADDED_SUBMISSIONS = [
  ...MOCK_SUBMISSIONS,
  ...Array.from({ length: 636 }).map((_, index) => {
    const empIndex = index % 5;
    const emp = MOCK_EMPLOYEES[empIndex];
    const accIndex = index % 3;
    const acc = emp.accounts[accIndex];
    const platformList: ('INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'FACEBOOK')[] = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'FACEBOOK'];
    const platform = platformList[index % 4];

    return {
      id: `pad-${index}`,
      url: `https://www.${platform.toLowerCase()}.com/mockPath/padLink_${index}`,
      platform,
      clientAccountId: acc.id,
      clientAccountName: acc.name,
      submittedById: emp.id,
      submittedByName: emp.name,
      createdAt: new Date(Date.now() - 1000 * 60 * (30 + index))
    };
  })
];

export default function AdminPage() {
  return (
    <div>
      <div className="bg-slate-950 border-b border-slate-800 py-3 px-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Simulation Portal
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured Admin Node</span>
        </div>
      </div>
      <AdminDashboard
        employees={MOCK_EMPLOYEES}
        submissions={PADDED_SUBMISSIONS}
      />
    </div>
  );
}
