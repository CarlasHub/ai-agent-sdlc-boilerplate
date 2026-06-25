import { createProjectBuilderApp } from './features/project-builder/app.js';

const root = document.querySelector('#app');

if (root) {
  createProjectBuilderApp(root).init();
}
