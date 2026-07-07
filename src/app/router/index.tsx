import { createBrowserRouter } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { ShieldLayout, CitizenLayout } from '../layouts/CitizenLayout';
import { InvestigatorLayout } from '../layouts/InvestigatorLayout';

import { Home } from '../../pages/public/Home';
import { Login } from '../../pages/public/Login';
import { Register } from '../../pages/public/Register';
import { ShieldHome } from '../../pages/citizen/ShieldHome';
import { Dashboard } from '../../pages/investigator/Dashboard';
import { Alerts } from '../../pages/investigator/Alerts';
import { CaseList } from '../../pages/investigator/CaseList';
import { CaseDetail } from '../../pages/investigator/CaseDetail';
import { Clusters } from '../../pages/investigator/Clusters';
import { ClusterDetail } from '../../pages/investigator/ClusterDetail';
import { FraudNetwork } from '../../pages/investigator/FraudNetwork';
import { EntityList } from '../../pages/investigator/EntityList';
import { EntityDetail } from '../../pages/investigator/EntityDetail';
import { GeospatialMap } from '../../pages/investigator/GeospatialMap';
import { Assistant } from '../../pages/investigator/Assistant';
import { AnalyzeResult } from '../../pages/citizen/AnalyzeResult';
import { ReportHistory } from '../../pages/citizen/ReportHistory';
import { DemoWorkflow } from '../../components/common/DemoWorkflow';
import { Outlet } from 'react-router-dom';

import { Platform } from '../../pages/public/Platform';
import { HowItWorks } from '../../pages/public/HowItWorks';
import { FraudAwareness } from '../../pages/public/FraudAwareness';
import { About } from '../../pages/public/About';

function RootLayout() {
  return (
    <>
      <Outlet />
      <DemoWorkflow />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <PublicLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'login', element: <Login /> },
          { path: 'register', element: <Register /> },
          { path: 'platform', element: <Platform /> },
          { path: 'how-it-works', element: <HowItWorks /> },
          { path: 'fraud-awareness', element: <FraudAwareness /> },
          { path: 'about', element: <About /> },
        ],
      },
      {
        // PUBLIC: Shield analysis — no login required
        path: '/shield',
        element: <ShieldLayout />,
        children: [
          { index: true, element: <ShieldHome /> },
          { path: 'result/:id', element: <AnalyzeResult /> },
        ],
      },
      {
        // PROTECTED: citizen-specific pages requiring login
        path: '/citizen',
        element: <CitizenLayout />,
        children: [
          { path: 'reports', element: <ReportHistory /> },
          { path: 'assistant', element: <Assistant /> },
        ],
      },
      {
        path: '/intelligence',
        element: <InvestigatorLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'alerts', element: <Alerts /> },
          { path: 'cases', element: <CaseList /> },
          { path: 'cases/:id', element: <CaseDetail /> },
          { path: 'clusters', element: <Clusters /> },
          { path: 'clusters/:id', element: <ClusterDetail /> },
          { path: 'network', element: <FraudNetwork /> },
          { path: 'entities', element: <EntityList /> },
          { path: 'entities/:id', element: <EntityDetail /> },
          { path: 'map', element: <GeospatialMap /> },
          { path: 'assistant', element: <Assistant /> },
        ],
      }
    ]
  }
]);
