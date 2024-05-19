import App from './app';
import { createElement } from './lib/dom/client';
import { router } from './lib/router';
import { routes } from './routes';

const app = document.getElementById('app');
router(app, routes);