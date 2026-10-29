import React, { useEffect, useRef, useState } from 'react';
import './styles.css';
import './project-card-overrides.css';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import World from './world/World.jsx';
import { projects, hqProject } from './data/projects.js';

function getWorldTimePhase(date) {
  const hours = date.getHours() + date.getMinutes() / 60;
  if (hours >= 5 && hours < 7.5) return { label: 'DAWN', icon: '🌅' };
  if (hours >= 7.5 && hours < 16.5) return { label: 'DAY', icon: '☀' };
  if (hours >= 16.5 && hours < 19.5) return { label: 'SUNSET', icon: '🌇' };
  return { label: 'NIGHT', icon: '☾' };
}

function ProjectGallery({ images = [] }) {
  if (!images.length) return null;

  return (
    <section className="project-gallery" aria-label="Project images">
      <h3>Selected work</h3>
      <div className="project-gallery-grid">
        {images.map((image) => (
          <a
            className="project-gallery-item"
            href={image.src}
            target="_blank"
            rel="noreferrer"
            key={image.src}
            title={`Open ${image.title} in a new tab`}
          >
            <img
              src={image.src}
              alt={image.title}
              loading="lazy"
              onError={(event) => {
                event.currentTarget
                  .closest('.project-gallery-item')
                  ?.classList.add('image-unavailable');
              }}
            />
            <span>{image.title}</span>
          </a>
        ))}
      </div>
      <p className="gallery-hint">
        Select an image to view it at full size.
      </p>
    </section>
  );
}

function ProjectLinks({ links = [] }) {
  if (!links.length) return null;

  return (
    <section className="related-links">
      <h3>Related repositories</h3>
      <div className="related-links-list">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
          >
            {link.label}<span>↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ArcadeProjects({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="subproject-section">
      <h3>Inside the arcade</h3>
      <div className="subproject-list">
        {items.map((item) => (
          <div className="subproject-item" key={item.name}>
            <span className="subproject-symbol">▸</span>

            <span className="subproject-copy">
              <strong>{item.name}</strong>
              <small>{item.description}</small>
            </span>

            {item.github ? (
              <a
                href={item.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`${item.name} repository`}
              >
                ↗
              </a>
            ) : (
              <span className="subproject-pending">
                Link pending
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricStrip({ metrics = [] }) {
  if (!metrics.length) return null;
  return (
    <div className="project-metrics" aria-label="Project highlights">
      {metrics.map((metric) => (
        <div className="project-metric" key={`${metric.value}-${metric.label}`}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  );
}

function HighlightList({ items = [], title = 'Highlights' }) {
  if (!items.length) return null;
  return (
    <section className="project-section">
      <h3>{title}</h3>
      <ul className="project-highlights">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function ProfileDetails({ profile }) {
  if (!profile) return null;

  return (
    <div className="hq-profile-content">
      <div className="hq-location">⌖ {profile.location}</div>

      <section className="project-section">
        <h3>Education</h3>
        <div className="profile-info-card">
          <strong>{profile.education.degree}</strong>
          <p>{profile.education.institution}</p>
          <div className="profile-meta-row">
            <span>{profile.education.period}</span>
            <span>CGPA <b>{profile.education.cgpa}</b></span>
          </div>
          <p className="profile-secondary">{profile.education.honorsCgpa}</p>
        </div>
      </section>

      <section className="project-section">
        <h3>Experience</h3>
        <div className="profile-info-card">
          <div className="profile-role-row">
            <strong>{profile.experience.role}</strong>
            <span>{profile.experience.period}</span>
          </div>
          <p>{profile.experience.company} · {profile.experience.location}</p>
          <ul className="project-highlights compact">
            {profile.experience.highlights.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="project-section">
        <h3>Technical toolbox</h3>
        <div className="hq-skill-groups">
          {profile.skillGroups.map((group) => (
            <div className="hq-skill-group" key={group.label}>
              <strong>{group.label}</strong>
              <div className="tech-list">
                {group.items.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="project-section">
        <h3>Achievements & certifications</h3>
        <ul className="project-highlights compact">
          {profile.achievements.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="project-section">
        <h3>Find me online</h3>
        <div className="hq-contact-links">
          {profile.contactLinks.map((link) => (
            <a key={link.label} href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel={link.url.startsWith('mailto:') ? undefined : 'noreferrer'}>
              {link.label}<span>↗</span>
            </a>
          ))}
          {profile.resumeUrl && (
            <a
              className="resume-download-link"
              href={profile.resumeUrl}
              download="Uday_Gandhi_Resume.pdf"
              aria-label="Download Uday Gandhi's résumé as a PDF"
            >
              Download résumé <span aria-hidden="true">↓</span>
            </a>
          )}
        </div>
      </section>
    </div>
  );
}

function ProjectPanel({ project, onClose }) {
  if (!project) return null;
  const isProfile = Boolean(project.profile);

  return (
    <aside className={`project-panel${isProfile ? ' project-panel-profile' : ''}`} aria-label={`${project.name} details`}>
      <div className="panel-topline">
        <span className="eyebrow">{isProfile ? 'ABOUT / RÉSUMÉ' : 'PROJECT SPOTLIGHT'}</span>
        <button className="icon-button" onClick={onClose} aria-label="Close details">×</button>
      </div>

      <div className="project-heading">
        <span className="project-emblem" style={{ '--accent': project.accent || '#79d7d2' }}>
          {project.icon || '✦'}
        </span>
        <div>
          <h2>{project.name}</h2>
          <p>{project.subtitle}</p>
        </div>
      </div>

      <div className="project-badges">
        {project.category && <span className="project-category">{project.category}</span>}
        {project.status && <span className="project-status">{project.status}</span>}
      </div>

      <p className="project-description">{project.description}</p>

      {isProfile ? (
        <ProfileDetails profile={project.profile} />
      ) : (
        <>
          <MetricStrip metrics={project.metrics} />
          <HighlightList items={project.highlights} title="What I built" />

          {project.details && (
            <section className="project-section project-notes">
              <h3>How it works</h3>
              <p className="project-details">{project.details}</p>
            </section>
          )}

          {project.stack?.length > 0 && (
            <section className="project-section">
              <h3>Tech & tools</h3>
              <div className="tech-list">
                {project.stack.map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          )}

          {project.medicalDisclaimer && (
            <p className="medical-disclaimer">{project.medicalDisclaimer}</p>
          )}

          <ProjectGallery images={project.gallery} />
          <ArcadeProjects items={project.subProjects} />
          <ProjectLinks links={project.relatedLinks} />

          {(project.github || project.demo || project.galleryLink) && (
            <div className="panel-actions">
              {project.github && (
                <a className="action-button primary" href={project.github} target="_blank" rel="noreferrer">
                  GitHub repository <span>↗</span>
                </a>
              )}
              {project.demo && (
                <a className="action-button secondary" href={project.demo} target="_blank" rel="noreferrer">
                  Live demo <span>↗</span>
                </a>
              )}
              {project.galleryLink && (
                <a className="action-button secondary" href={project.galleryLink} target="_blank" rel="noreferrer">
                  Browse Blender project files <span>↗</span>
                </a>
              )}
            </div>
          )}
          <p className="panel-footnote">Details reflect the information currently available; unfinished projects are labelled accordingly.</p>
        </>
      )}
    </aside>
  );
}

function ProjectsDrawer({ onChoose, onClose }) {
  return (
    <div
      className="drawer-backdrop"
      onClick={onClose}
    >
      <section
        className="projects-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label="All projects"
      >
        <div className="drawer-header">
          <div>
            <span className="eyebrow">THE NEIGHBOURHOOD</span>
            <h2>Explore projects</h2>
          </div>

          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close project list"
          >
            ×
          </button>
        </div>

        <div className="drawer-list">
          {[...projects, hqProject].map((project) => (
            <button
              key={project.id}
              className="drawer-project"
              onClick={() => onChoose(project)}
            >
              <span
                className="drawer-dot"
                style={{
                  background: project.accent || '#80d4d4',
                }}
              />

              <span>
                <strong>{project.name}</strong>
                <small>{project.subtitle}</small>
              </span>

              <span className="drawer-arrow">↗</span>
            </button>
          ))}
        </div>

        <p className="drawer-note">
          Choose a project here or click a building in the town.
        </p>
      </section>
    </div>
  );
}

/*
 * Touch-and-hold driving controls.
 * Pointer capture prevents steering from getting stuck if
 * the finger moves outside the button before being released.
 */
function DrivingControls({ keysRef }) {
  function controlProps(key) {
    const release = (event) => {
      event.preventDefault();
      keysRef.current.delete(key);
    };

    return {
      onPointerDown: (event) => {
        event.preventDefault();

        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // The control still works if pointer capture is unavailable.
        }

        keysRef.current.add(key);
      },
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
      onContextMenu: (event) => event.preventDefault(),
    };
  }

  return (
    <div className="touch-controls">
      <div className="steering-pad">
        <button
          {...controlProps('a')}
          aria-label="Steer left"
        >
          ←
        </button>

        <button
          {...controlProps('d')}
          aria-label="Steer right"
        >
          →
        </button>
      </div>

      <div className="pedal-pad">
        <button
          className="reverse"
          {...controlProps('s')}
          aria-label="Reverse"
        >
          REV
        </button>

        <button
          className="brake"
          {...controlProps(' ')}
          aria-label="Brake"
        >
          STOP
        </button>

        <button
          className="accelerate"
          {...controlProps('w')}
          aria-label="Accelerate"
        >
          GO ↑
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [viewMode, setViewMode] = useState('iso');
  const [localTime, setLocalTime] = useState(() => new Date());
  const [transitioning, setTransitioning] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [nearbyProject, setNearbyProject] = useState(null);
  const [carSpeed, setCarSpeed] = useState(0);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  const carRef = useRef(null);
  const keysRef = useRef(new Set());

  useEffect(() => {
    const timer = window.setInterval(() => setLocalTime(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const worldPhase = getWorldTimePhase(localTime);
  const localTimeText = localTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  useEffect(() => {
    const drivingKeys = [
      'w', 'a', 's', 'd',
      'arrowup', 'arrowdown',
      'arrowleft', 'arrowright',
      ' ',
    ];

    const keyDown = (event) => {
      const key = event.key.toLowerCase();

      if (key === 'escape') {
        if (selectedProject) {
          setSelectedProject(null);
          setTransitioning(true);
        } else if (showDirectory) {
          setShowDirectory(false);
        } else if (viewMode === 'drive') {
          setViewMode('iso');
          setTransitioning(true);
        }

        keysRef.current.clear();
        return;
      }

      if (
        viewMode === 'drive' &&
        key === 'e' &&
        nearbyProject &&
        !selectedProject &&
        !showDirectory
      ) {
        event.preventDefault();
        keysRef.current.clear();
        setSelectedProject(nearbyProject);
        setTransitioning(true);
        return;
      }

      if (viewMode === 'drive' && drivingKeys.includes(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
    };

    const keyUp = (event) => {
      keysRef.current.delete(event.key.toLowerCase());
    };

    const clearKeys = () => keysRef.current.clear();

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearKeys);

    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, [
    viewMode,
    nearbyProject,
    selectedProject,
    showDirectory,
  ]);

  const changeView = (nextMode) => {
    if (nextMode === viewMode) return;

    keysRef.current.clear();
    setSelectedProject(null);
    setShowDirectory(false);
    setTransitioning(true);
    setViewMode(nextMode);
  };

  /*
   * Selecting via a building or the All Projects directory
   * uses the isometric project-detail camera.
   */
  const chooseProject = (project) => {
    keysRef.current.clear();
    setSelectedProject(project);
    setShowDirectory(false);

    if (viewMode === 'drive') {
      setViewMode('iso');
    }

    setTransitioning(true);
  };

  /*
   * Nearby inspection keeps Driving POV active.
   * The World component pauses the car while the panel is open.
   */
  const inspectNearbyProject = () => {
    if (!nearbyProject) return;

    keysRef.current.clear();
    setSelectedProject(nearbyProject);
    setShowDirectory(false);
    setTransitioning(true);
  };

  const closeProject = () => {
    setSelectedProject(null);
    setTransitioning(true);
  };

  const returnToTown = () => {
    keysRef.current.clear();
    setSelectedProject(null);
    setNearbyProject(null);
    setShowDirectory(false);
    setTransitioning(true);
    setViewMode('iso');
  };

  return (
    <main className={`app-shell${viewMode === 'drive' ? ' is-driving' : ''}`}>
      <div className="scene-wrap">
        <Canvas
          shadows
          dpr={[1, 1.6]}
          camera={{
            position: [0, 31, 37],
            fov: 42,
            near: 0.1,
            far: 160,
          }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <World
            projects={projects}
            hqProject={hqProject}
            onSelect={chooseProject}
            onNearbyProject={setNearbyProject}
            onSpeedChange={setCarSpeed}
            drivePaused={Boolean(selectedProject || showDirectory)}
            viewMode={viewMode}
            carRef={carRef}
            keysRef={keysRef}
            selectedProject={selectedProject}
            labelsVisible={
              !selectedProject &&
              !showDirectory &&
              viewMode === 'iso'
            }
            transitioning={transitioning}
            setTransitioning={setTransitioning}
          />

          <AdaptiveDpr pixelated />
          <Preload all />
        </Canvas>
      </div>

      <header className="topbar">
        <button
          className="brand-mark"
          onClick={returnToTown}
          aria-label="Return to town overview"
        >
          <span className="brand-cube">U</span>
          <span>
            <strong>UDAY'S STACK</strong>
            <small>AN INTERACTIVE PORTFOLIO</small>
          </span>
        </button>

        <nav className="top-actions" aria-label="Portfolio navigation">
          <button
            className="nav-button"
            onClick={() => setShowDirectory(true)}
          >
            All projects <span>↗</span>
          </button>

          <button
            className="nav-button"
            onClick={() => chooseProject(hqProject)}
          >
            About / Resume
          </button>
        </nav>
      </header>

      <section className="hero-copy" aria-label="Introduction">
        <span className="eyebrow">
          <span className="status-dot" />
          OPEN WORLD · SOFTWARE · AI
        </span>

        <h1>
          A little world
          <br />
          <em>of things I've built.</em>
        </h1>

        <p>Explore the projects, one building at a time.</p>
      </section>

      <div className="view-switcher" aria-label="Change camera view">
        <span className="switcher-label">CAMERA POV</span>

        <div className="switcher-buttons">
          <button
            className={viewMode === 'iso' ? 'active' : ''}
            onClick={() => changeView('iso')}
            aria-pressed={viewMode === 'iso'}
          >
            <span>▦</span> Isometric
          </button>

          <button
            className={viewMode === 'drive' ? 'active' : ''}
            onClick={() => changeView('drive')}
            aria-pressed={viewMode === 'drive'}
          >
            <span>◉</span> Driving POV
          </button>
        </div>
      </div>

      <div
        className="world-clock"
        aria-label={`Local time ${localTimeText}, ${worldPhase.label.toLowerCase()}`}
        title="The town's lighting follows your device's local clock"
      >
        <span className="world-clock-icon" aria-hidden="true">
          {worldPhase.icon}
        </span>
        <span className="world-clock-copy">
          <time dateTime={localTime.toISOString()}>{localTimeText}</time>
          <small>{worldPhase.label} · LOCAL TIME</small>
        </span>
      </div>

      {viewMode === 'iso' &&
        !selectedProject &&
        !showDirectory &&
        showHelp && (
          <div className="hint-card">
            <span className="hint-icon">⌖</span>
            <div>
              <strong>Pick a building to explore</strong>
              <small>
                Drag to orbit · Scroll to zoom · Click a landmark
              </small>
            </div>
            <button
              className="hint-close"
              onClick={() => setShowHelp(false)}
              aria-label="Dismiss hint"
            >
              ×
            </button>
          </div>
        )}

      {viewMode === 'iso' &&
        !selectedProject &&
        !showDirectory &&
        showHelp && (
          <div className="map-legend">
            <span>
              <i className="legend-dot aqua" />
              Clickable projects
            </span>
            <span>
              <i className="legend-dot gold" />
              Your HQ
            </span>
          </div>
        )}

      {viewMode === 'drive' && (
        <div className="driving-hud">
          <span className="live-dot" />
          <strong>DRIVING MODE</strong>
          <span className="speed-readout">
            {carSpeed} km/h
          </span>
          <small>WASD / ARROWS · SPACE BRAKE</small>
          <button onClick={() => changeView('iso')}>
            Exit drive ↗
          </button>
        </div>
      )}

      {viewMode === 'drive' &&
        nearbyProject &&
        !selectedProject &&
        !showDirectory && (
          <button
            className="inspect-prompt"
            onClick={inspectNearbyProject}
          >
            <span className="inspect-prompt-icon">
              {nearbyProject.icon || '↗'}
            </span>
            <span className="inspect-prompt-copy">
              <strong>{nearbyProject.name}</strong>
              <small>Nearby project · Tap to inspect</small>
            </span>
            <kbd>E</kbd>
          </button>
        )}

      {viewMode === 'drive' &&
        !selectedProject &&
        !showDirectory && (
        <DrivingControls keysRef={keysRef} />
      )}

      <footer className="bottom-bar">
        <span>© {new Date().getFullYear()} Uday Gandhi</span>
        <span className="bottom-center">
          A portfolio, reimagined as a small town.
        </span>
        <span>
          <a
            href="https://github.com/uday-gandhi04"
            target="_blank"
            rel="noreferrer"
          >
            GITHUB ↗
          </a>
        </span>
      </footer>

      <ProjectPanel
        project={selectedProject}
        onClose={closeProject}
      />

      {showDirectory && (
        <ProjectsDrawer
          onChoose={chooseProject}
          onClose={() => setShowDirectory(false)}
        />
      )}
    </main>
  );
}