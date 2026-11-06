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

function renderDetailedHowItWorks(project) {
  switch (project.id) {
    case 'stemify':
      return `
        <section>
          <p class="kicker">03 · HOW IT WORKS</p>
          <h2>From a mixed track to individual stems</h2>

          <p>
            Stemify processes an uploaded audio track through a
            phase-aware deep learning pipeline. Its DeepMultiSourceUNet
            model estimates individual sources from the mixed recording,
            producing separated audio stems.
          </p>

          <ol class="feature-list">
            <li>
              <strong>Audio input:</strong>
              The user uploads a WAV or MP3 recording through the Flask
              web interface.
            </li>

            <li>
              <strong>Audio preparation:</strong>
              The input is prepared for the model's audio-separation
              workflow.
            </li>

            <li>
              <strong>Deep learning inference:</strong>
              The phase-aware DeepMultiSourceUNet model processes
              the mixed audio and estimates its individual sources.
            </li>

            <li>
              <strong>Multi-source separation:</strong>
              The model produces separate stems for vocals, drums,
              bass and other instruments.
            </li>

            <li>
              <strong>Output delivery:</strong>
              The Flask application makes the separated audio outputs
              available for download.
            </li>
          </ol>

          <h3>Training approach</h3>

          <p>
            The model is trained using the MUSDB18 dataset. Its
            composite objective combines mean squared error,
            phase consistency, source independence and magnitude-sum
            terms to guide the separation process.
          </p>
        </section>`;
    case 'notshazam':
      return `
        <section>
          <p class="kicker">03 · HOW IT WORKS</p>
          <h2>Matching a sound against a fingerprint library</h2>

          <p>
            NotShazam identifies audio by converting music into
            compact fingerprints and comparing those fingerprints
            against an indexed song collection stored in MongoDB.
          </p>

          <ol class="feature-list">
            <li>
              <strong>Build the fingerprint library:</strong>
              Songs are processed to generate compact audio
              fingerprints. These fingerprints are stored and indexed
              in MongoDB alongside their associated track information.
            </li>

            <li>
              <strong>Capture a query:</strong>
              A short audio clip is supplied for identification.
            </li>

            <li>
              <strong>Generate query fingerprints:</strong>
              The query audio is processed into fingerprint
              representations compatible with the indexed library.
            </li>

            <li>
              <strong>Search for a match:</strong>
              The generated fingerprints are compared against
              the stored collection to identify matching patterns
              and candidate tracks.
            </li>

            <li>
              <strong>Return the result:</strong>
              The matching catalog entry is retrieved and presented
              as the identified song.
            </li>
          </ol>

          <h3>Why fingerprinting matters</h3>

          <p>
            Instead of comparing entire audio recordings directly,
            the system uses compact fingerprint representations
            to make matching against a large indexed collection
            more practical.
          </p>

          <aside class="disclaimer">
            <strong>Current scope:</strong>
            NotShazam identifies tracks that have already been
            fingerprinted and added to its database. It does not
            currently recognise arbitrary songs outside its
            indexed library.
          </aside>
        </section>`;
    case 'ovacare':
      return `
        <section>
          <p class="kicker">03 · HOW IT WORKS</p>
          <h2>From ultrasound images to structured analysis</h2>

          <p>
            OvaCare processes ovarian ultrasound images through
            an image-analysis pipeline that combines follicle
            segmentation, measurement and PCOS-related classification
            experiments.
          </p>

          <ol class="feature-list">
            <li>
              <strong>Image upload:</strong>
              An ultrasound image is submitted through the Next.js
              interface and sent to the Flask backend along with
              its pixel-to-millimetre calibration information.
            </li>

            <li>
              <strong>Image preprocessing:</strong>
              The image is validated, converted to grayscale
              and adaptively upscaled to prepare it for segmentation.
            </li>

            <li>
              <strong>Follicle segmentation:</strong>
              The SAM ViT-H model generates candidate segmentation
              masks for potential follicle regions.
            </li>

            <li>
              <strong>Detection refinement:</strong>
              Candidate masks pass through filtering stages
              that consider size, shape, image brightness,
              border proximity, overlap and spatial clustering.
            </li>

            <li>
              <strong>Follicle measurement:</strong>
              The system calculates Equivalent Circular Diameter
              (ECD) and converts image measurements into
              millimetres using the supplied calibration factor.
            </li>

            <li>
              <strong>Analysis and visualisation:</strong>
              The project combines its segmentation and
              classification workflow to generate follicle
              overlays, measurement summaries and experimental
              PCOS-related analysis outputs.
            </li>
          </ol>

          <h3>Visualising the results</h3>

          <p>
            Detected regions are displayed with size-based colour
            classifications and measurement overlays. The
            application also organises analysis results into
            statistics, visualisations and detailed result views.
          </p>

          <aside class="disclaimer">
            <strong>Research limitation:</strong>
            OvaCare is an experimental research prototype.
            Its outputs are not clinically validated diagnoses
            or medical recommendations, and must not replace
            assessment by a qualified healthcare professional.
          </aside>
        </section>`;
    default:
      return `
        <section>
          <p class="kicker">03 · PRODUCT DESIGN</p>
          <h2>How it works</h2>
          <p>${esc(project.details || project.description)}</p>
        </section>`;
  }
}

function renderProject(project) {
  if (project.id === 'moboxd') {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#10211d">

  <title>MoBoxd: Full-Stack Social Platform | Uday Gandhi</title>

  <meta name="description"
    content="Explore MoBoxd, a full-stack social platform built by Uday Gandhi with React, Node.js, Express, MongoDB, image posts, reviews and ranking battles.">

  <meta name="author" content="Uday Gandhi">
  <meta name="robots" content="index,follow">

  <link rel="canonical"
    href="https://udaygandhi.is-a.dev/projects/moboxd/">

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/project-case-study.css">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Uday's Stack">
  <meta property="og:title"
    content="MoBoxd: Full-Stack Social Platform | Uday Gandhi">
  <meta property="og:description"
    content="A Letterboxd-inspired social platform for sharing everyday moments, publishing posts and reviews, and competing in ranking battles.">
  <meta property="og:url"
    content="https://udaygandhi.is-a.dev/projects/moboxd/">
  <meta property="og:image"
    content="https://udaygandhi.is-a.dev/og-image.png">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title"
    content="MoBoxd: Full-Stack Social Platform | Uday Gandhi">
  <meta name="twitter:description"
    content="A full-stack social platform built with React, Node.js, Express and MongoDB.">
  <meta name="twitter:image"
    content="https://udaygandhi.is-a.dev/og-image.png">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://udaygandhi.is-a.dev/projects/moboxd/#page",
        "url": "https://udaygandhi.is-a.dev/projects/moboxd/",
        "name": "MoBoxd: Full-Stack Social Platform | Uday Gandhi",
        "isPartOf": {
          "@id": "https://udaygandhi.is-a.dev/#website"
        },
        "about": {
          "@id": "https://udaygandhi.is-a.dev/#person"
        },
        "mainEntity": {
          "@id": "https://udaygandhi.is-a.dev/projects/moboxd/#software"
        }
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": "https://udaygandhi.is-a.dev/projects/moboxd/#software",
        "name": "MoBoxd",
        "description": "A Letterboxd-inspired social platform for sharing everyday moments, publishing posts and reviews, and competing in ranking battles.",
        "author": {
          "@id": "https://udaygandhi.is-a.dev/#person"
        },
        "codeRepository": "https://github.com/uday-gandhi04/MoBoxd",
        "programmingLanguage": "JavaScript",
        "runtimePlatform": "Web browser",
        "mainEntityOfPage": {
          "@id": "https://udaygandhi.is-a.dev/projects/moboxd/#page"
        }
      }
    ]
  }
  </script>
</head>

<body>
  <header class="site-header">
    <a class="brand" href="/">
      UDAY'S STACK
      <small>by Uday Gandhi</small>
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
      <span>MoBoxd</span>
    </nav>

    <header class="project-hero">
      <p class="eyebrow">PROJECT CASE STUDY · FULL-STACK PRODUCT</p>

      <h1>MoBoxd</h1>

      <p class="subtitle">A social platform for everyday moments</p>

      <p class="lead">
        A Letterboxd-inspired social platform for sharing everyday
        moments, publishing posts and reviews, and competing in
        ranking battles with different visibility options.
      </p>

      <p class="byline">
        Project by <a href="/about/">Uday Gandhi</a>
        · Full-stack product
      </p>

      <div class="actions">
        <a class="button primary"
          href="https://github.com/uday-gandhi04/MoBoxd"
          target="_blank"
          rel="noopener noreferrer">
          Source code ↗
        </a>

        <a class="button"
          href="https://moboxd.onrender.com/"
          target="_blank"
          rel="noopener noreferrer">
          Live demo ↗
        </a>
      </div>
    </header>

    <section class="metrics" aria-label="Project highlights">
      <div class="metric">
        <strong>MERN</strong>
        <span>Full-stack application</span>
      </div>

      <div class="metric">
        <strong>3 modes</strong>
        <span>Ranking visibility</span>
      </div>

      <div class="metric">
        <strong>Live</strong>
        <span>Hosted demonstration</span>
      </div>
    </section>

    <div class="columns">
      <article class="article">
        <section>
          <p class="kicker">01 · OVERVIEW</p>
          <h2>What the project does</h2>

          <p>
            MoBoxd is a social platform inspired by Letterboxd,
            adapted for sharing everyday moments rather than
            maintaining a static catalogue. Users can publish
            image-based posts, interact with content, write reviews,
            and participate in ranking battles.
          </p>
        </section>

        <section>
          <p class="kicker">02 · IMPLEMENTATION</p>
          <h2>Features and engineering work</h2>

          <ul class="feature-list">
            <li>
              Authentication and account-based social interactions.
            </li>
            <li>
              Image posts with captions, categories and author ratings.
            </li>
            <li>
              Reviews and ranking battles with public, follower-only,
              and private/shared-link visibility.
            </li>
            <li>
              Separate frontend and backend, with Cloudinary handling
              uploaded media.
            </li>
          </ul>
        </section>

        <section>
          <p class="kicker">03 · PRODUCT DESIGN</p>
          <h2>How it works</h2>

          <p>
            The application is organised around a social feed.
            Users publish content, interact with posts, write reviews,
            and create ranking battles with different visibility rules.
            This makes content access and social interactions part
            of the product's core functionality.
          </p>
        </section>
      </article>

      <aside class="side">
        <section class="side-card">
          <p class="kicker">TECHNOLOGY</p>
          <h2>Stack and tools</h2>

          <ul class="stack">
            <li>React</li>
            <li>Vite</li>
            <li>Bootstrap 5</li>
            <li>Node.js</li>
            <li>Express</li>
            <li>MongoDB</li>
            <li>Cloudinary</li>
            <li>JWT</li>
          </ul>
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

        ${renderDetailedHowItWorks(project)}

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
