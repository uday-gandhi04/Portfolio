import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { projects } from '../src/data/projects.js';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const PUBLIC = join(ROOT, 'public');
const SITE = 'https://udaygandhi.is-a.dev';

const FEATURED_IDS = ['stemify', 'notshazam', 'moboxd', 'ovacare'];

const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);

const urlFor = (project) => `${SITE}/projects/${project.id}/`;

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function projectSchema(project, url, description) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: project.seoTitle,
        description,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${SITE}/#person` },
        mainEntity: { '@id': `${url}#software` },
      },
      {
        '@type': 'SoftwareSourceCode',
        '@id': `${url}#software`,
        name: project.name,
        description,
        author: { '@id': `${SITE}/#person` },
        ...(project.github ? { codeRepository: project.github } : {}),
        ...(project.programmingLanguages?.length ? { programmingLanguage: project.programmingLanguages } : {}),
        mainEntityOfPage: { '@id': `${url}#page` },
      },
    ],
  };
}

function renderProject(project) {
  const url = urlFor(project);
  const title = project.seoTitle;
  const description = project.seoDescription;
  const overview = project.seoOverview || project.details || project.description;

  const metrics = (project.metrics || [])
    .map(
      (m) => `
    <div class="metric">
      <strong>${esc(m.value)}</strong>
      <span>${esc(m.label)}</span>
    </div>
  `,
    )
    .join('');

  const highlights = (project.highlights || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('');

  const stack = (project.stack || [])
    .map((item) => `<li>${esc(item)}</li>`)
    .join('');

  const links = [
    project.github &&
      `<a class="button primary" href="${esc(project.github)}" target="_blank" rel="noopener noreferrer">Source code ↗</a>`,
    project.demo &&
      `<a class="button" href="${esc(project.demo)}" target="_blank" rel="noopener noreferrer">Live demo ↗</a>`,
  ].filter(Boolean).join('');

  const disclaimer = project.medicalDisclaimer
    ? `<aside class="disclaimer">
        <strong>Research limitation:</strong>
        ${esc(project.medicalDisclaimer)}
       </aside>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#10211d">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="author" content="Uday Gandhi">
  <meta name="robots" content="index,follow">

  <link rel="canonical" href="${url}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/project-case-study.css">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Uday's Stack">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/og-image.png">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/og-image.png">

  <script type="application/ld+json">${safeJson(projectSchema(project, url, description))}</script>
</head>

<body>
  <header class="site-header">
    <a class="brand" href="/">
      UDAY'S STACK <small>by Uday Gandhi</small>
    </a>
    <nav>
      <a href="/">Portfolio</a>
      <a href="/about/">My Journey</a>
      <a href="/resume.pdf">Résumé</a>
    </nav>
  </header>

  <main class="shell">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/projects/">Projects</a>
      <span>/</span>
      <span>${esc(project.name)}</span>
    </nav>

    <header class="project-hero">
      <p class="eyebrow">
        PROJECT CASE STUDY · ${esc(project.category || 'SOFTWARE PROJECT')}
      </p>

      <h1>${esc(project.name)}</h1>
      <p class="subtitle">${esc(project.subtitle)}</p>
      <p class="lead">${esc(project.description)}</p>

      <p class="byline">
        Project by <a href="/about/">Uday Gandhi</a>
        · ${esc(project.status || '')}
      </p>

      <div class="actions">${links}</div>
    </header>

    ${metrics ? `
      <section class="metrics" aria-label="Project highlights">
        ${metrics}
      </section>
    ` : ''}

    <div class="columns">
      <article class="article">
        <section>
          <p class="kicker">01 · OVERVIEW</p>
          <h2>What the project does</h2>
          <p>${esc(overview)}</p>
        </section>

        <section>
          <p class="kicker">02 · IMPLEMENTATION</p>
          <h2>Features and engineering work</h2>
          <ul class="feature-list">${highlights}</ul>
        </section>

        ${disclaimer}
      </article>

      <aside class="side">
        <section class="side-card">
          <p class="kicker">TECHNOLOGY</p>
          <h2>Tools and stack</h2>
          <ul class="stack">${stack}</ul>
        </section>

        <section class="side-card">
          <p class="kicker">ABOUT THE AUTHOR</p>
          <h2>Uday Gandhi</h2>
          <p>
            Computer Science graduate with Honors in Data Science,
            building full-stack software and exploring applied AI/ML.
          </p>
          <a href="/about/">Explore my journey ↗</a>
        </section>
      </aside>
    </div>

    <section class="more">
      <p class="kicker">CONTINUE EXPLORING</p>
      <h2>More from Uday's Stack</h2>
      <div class="more-links">
        <a href="/projects/">All project case studies ↗</a>
        <a href="/about/">The full journey ↗</a>
        <a href="/resume.pdf">Download résumé ↓</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <span>© Uday Gandhi · Uday's Stack</span>
    <a href="mailto:udaygandhi2004@gmail.com">Get in touch ↗</a>
  </footer>
</body>
</html>`;
}

function renderIndex(items) {
  const title = 'Software Engineering & AI/ML Projects | Uday Gandhi';
  const description =
    'Explore software engineering and applied AI/ML projects by Uday Gandhi, including PyTorch audio source separation, music fingerprinting, full-stack development and computer vision research.';

  const cards = items
    .map(
      (p) => `
    <article class="project-card">
      <p class="kicker">${esc(p.category || 'PROJECT')}</p>
      <h2>
        <a href="/projects/${esc(p.id)}/">${esc(p.name)}</a>
      </h2>
      <p class="subtitle">${esc(p.subtitle)}</p>
      <p>${esc(p.description)}</p>
      <a href="/projects/${esc(p.id)}/">Read case study ↗</a>
    </article>
  `,
    )
    .join('');

  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/projects/#page`,
    url: `${SITE}/projects/`,
    name: title,
    description,
    author: { '@id': `${SITE}/#person` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: p.name,
        url: urlFor(p),
      })),
    },
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#10211d">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="author" content="Uday Gandhi">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${SITE}/projects/">
  <link rel="stylesheet" href="/project-case-study.css">
  <script type="application/ld+json">${safeJson(data)}</script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">UDAY'S STACK <small>by Uday Gandhi</small></a>
    <nav>
      <a href="/">Portfolio</a>
      <a href="/about/">My Journey</a>
      <a href="/resume.pdf">Résumé</a>
    </nav>
  </header>

  <main class="shell">
    <nav class="breadcrumbs"><a href="/">Home</a><span>/</span><span>Projects</span></nav>
    <header class="project-hero">
      <p class="eyebrow">SELECTED WORK · SOFTWARE ENGINEERING · APPLIED AI/ML</p>
      <h1>Projects by Uday Gandhi</h1>
      <p class="lead">
        A selection of full-stack products, audio engineering systems,
        deep-learning applications and computer-vision research prototypes.
      </p>
    </header>

    <section class="project-grid" aria-label="Project case studies">
      ${cards}
    </section>

    <section class="more">
      <h2>Explore the story behind the work.</h2>
      <div class="more-links">
        <a href="/about/">Read my journey ↗</a>
        <a href="/resume.pdf">Download résumé ↓</a>
        <a href="mailto:udaygandhi2004@gmail.com">Get in touch ↗</a>
      </div>
    </section>
  </main>
</body>
</html>`;
}

const featured = FEATURED_IDS.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

if (featured.length !== FEATURED_IDS.length) {
  throw new Error('A featured project ID is missing from projects.js');
}

for (const project of featured) {
  const folder = join(PUBLIC, 'projects', project.id);
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, 'index.html'), renderProject(project), 'utf8');
}

await mkdir(join(PUBLIC, 'projects'), { recursive: true });
await writeFile(join(PUBLIC, 'projects', 'index.html'), renderIndex(featured), 'utf8');

const urls = [
  `${SITE}/`,
  `${SITE}/about/`,
  `${SITE}/projects/`,
  ...featured.map(urlFor),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

await writeFile(join(PUBLIC, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Generated ${featured.length} static project pages and sitemap.`);
