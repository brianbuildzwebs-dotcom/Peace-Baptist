import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { refreshPushSubscriptionIfNeeded, registerServiceWorker } from '@/lib/pushNotifications'
import '@/lib/pwaInstall'

if ('serviceWorker' in navigator) {
  registerServiceWorker()
    .then(() => refreshPushSubscriptionIfNeeded())
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
