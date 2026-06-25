import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import App from './App.tsx';
import './index.css';
import { fetchAndApplyLeadData } from './fetchLeadData';

// Initialize PostHog
if (typeof window !== 'undefined') {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // Disable automatic capture to wait for lead data
    });
  } else {
    console.warn("PostHog Warning: VITE_POSTHOG_KEY is not defined in environment variables. Page views and clicks will not be tracked.");
  }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const leadId = params.get('lead');
  
  if (leadId) {
    await fetchAndApplyLeadData(leadId);
  }

  // Capture the pageview explicitly after lead data is loaded
  if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
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
