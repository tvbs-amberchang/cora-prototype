// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: App entry point — Router + Layout + Routes only

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import DashboardPage from '@/pages/dashboard';
import PeopleViewPage from '@/pages/people';
import AudiencePage from '@/pages/audience';
import CampaignsPage from '@/pages/campaigns';
import JourneysPage from '@/pages/journeys';
import DeliveryPage from '@/pages/delivery';
import DataCorePage from '@/pages/data';
import SystemAdminPage from '@/pages/settings';

export function App() {
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/people" element={<PeopleViewPage />} />
          <Route path="/audience" element={<AudiencePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/journeys" element={<JourneysPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/data" element={<DataCorePage />} />
          <Route path="/settings" element={<SystemAdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
