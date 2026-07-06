import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import './lib/i18n';
import { registerServiceWorker } from './lib/pwa';

const target = document.getElementById('app');
if (!target) throw new Error('Missing #app root element');

const app = mount(App, { target });

registerServiceWorker();

export default app;
