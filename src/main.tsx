import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import App from './App.tsx';
import './index.css';
import { fetchAndApplyLeadData } from './fetchLeadData';

// Initialize PostHog
// Se você não quiser configurar variáveis de ambiente no seu provedor de hospedagem (Vercel, Netlify, etc.),
// você pode colocar a sua chave pública do PostHog diretamente abaixo:
const POSTHOG_KEY_FALLBACK = 'phc_vTyEzLTT5BdDNKaeEWmqCyYtGkWytJwq3Ukdi4gXHgmK'; 

const posthogKey = (import.meta as any).env.VITE_POSTHOG_KEY || POSTHOG_KEY_FALLBACK;
const posthogHost = (import.meta as any).env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

if (typeof window !== 'undefined') {
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic capture to wait for lead data
    });
  } else {
    console.warn("PostHog Warning: VITE_POSTHOG_KEY is not defined. Page views and clicks will not be tracked.");
  }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const leadId = params.get('lead');
  
  if (leadId) {
    await fetchAndApplyLeadData(leadId);
  }

  // Capture the pageview explicitly after lead data is loaded
  if (typeof window !== 'undefined' && posthogKey) {
    if (leadId) {
      // Register lead_id as super property for all subsequent events
      posthog.register({
        lead_id: leadId,
      });
    }
    posthog.capture('$pageview');
    console.log(`PostHog: Pageview captured successfully${leadId ? ` for lead: ${leadId}` : ''}`);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PostHogProvider client={posthog}>
        <App />
      </PostHogProvider>
    </StrictMode>,
  );
}

init();
