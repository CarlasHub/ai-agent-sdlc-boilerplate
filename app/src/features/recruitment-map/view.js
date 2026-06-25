import { clearElement } from '../../lib/dom.js';

export function createRecruitmentMapView(root) {
  return {
    render(data) {
      clearElement(root);

      const section = document.createElement('section');
      section.className = 'empty-state';
      section.setAttribute('aria-labelledby', 'project-title');

      section.innerHTML = `
        <p class="kicker">Fictional public demo data only</p>
        <h1 id="project-title">Impressive Recruitment Maps Agent Demo</h1>
        <p>Starter scaffold loaded with ${data.length} fictional recruitment regions.</p>
      `;

      root.append(section);
    }
  };
}
