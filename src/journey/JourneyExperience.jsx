import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import JourneyWorld from './JourneyWorld.jsx';
import './journey.css';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = [
  {
    id: 'opening',
    label: 'THE BEGINNING',
    eyebrow: 'UDAY GANDHI · SOFTWARE · AI/ML',
    title: <>The making<br />of a builder.</>,
    body: "I like understanding how things work — and then building them. I move between software engineering, full-stack products and applied AI/ML, following ideas far enough to turn them into something real.",
    note: 'A journey through the things I have built, the systems I have explored, and the direction I am heading.',
    align: 'left',
  },
  {
    id: 'foundation',
    label: 'FOUNDATIONS',
    eyebrow: '01 / FOUNDATIONS · 2022—2026',
    title: <>Every system<br />starts somewhere.</>,
    body: 'Computer Science gave me the foundations. An Honors specialization in Data Science pushed me to think about algorithms, data and the systems behind the interface.',
    facts: [
      ['B.Tech', 'Computer Science'],
      ['Honors', 'Data Science'],
      ['8.81 / 10', 'CGPA'],
      ['8.73 / 10', 'Honors CGPA'],
    ],
    footer: 'Shri Ramdeobaba College of Engineering and Management · Nagpur',
    align: 'right',
  },
  {
    id: 'cognizant',
    label: 'COLLABORATION',
    eyebrow: '02 / PROFESSIONAL EXPERIENCE · JAN—MAY 2026',
    title: <>Software is built<br />by people, too.</>,
    body: 'During my final-semester internship at Cognizant, I joined a six-person team building a MERN-stack Library Management System with distinct Member, Librarian and Manager experiences.',
    bullets: [
      'Built the home pages for all three roles and additional application pages.',
      'Rotated Scrum Master responsibilities with teammates and frequently took on the role.',
      'Worked across a shared product, where coordination mattered as much as implementation.',
    ],
    footer: 'Cognizant · MERN Stack Developer Intern · Chennai, India',
    align: 'left',
  },
  {
    id: 'moboxd',
    label: 'PRODUCT ENGINEERING',
    eyebrow: '03 / FULL-STACK DEVELOPMENT',
    title: <>From an idea<br />to a product.</>,
    body: 'MoBoxd is a social platform inspired by Letterboxd, reimagined for everyday moments. It brings together feeds, posts, reviews and ranking battles in one full-stack application.',
    bullets: [
      'React, Vite and Bootstrap on the frontend.',
      'Node.js, Express and MongoDB on the backend.',
      'Authentication, image uploads, content visibility, reviews and ranking experiences.',
    ],
    footer: 'A product is more than its features — it is how the pieces work together.',
    links: [
      {
        label: 'Explore MoBoxd on GitHub',
        href: 'https://github.com/uday-gandhi04/MoBoxd',
      },
    ],
    align: 'right',
  },
  {
    id: 'notshazam',
    label: 'MUSIC FINGERPRINTING',
    eyebrow: '04 / MUSIC FINGERPRINTING',
    title: <>Finding patterns<br />hidden in sound.</>,
    body: 'NotShazam transforms audio into compact fingerprints, indexes them and matches query clips against a song library. It explores the engineering behind fast identification rather than relying on a pre-existing music API.',
    facts: [
      ['350+', 'Songs in library'],
      ['11M+', 'Indexed hashes'],
      ['<200 ms', 'Reported matching latency'],
    ],
    footer: 'Audio processing · Spectrograms · Fingerprint matching · MongoDB',
    links: [
      {
        label: 'Explore NotShazam on GitHub',
        href: 'https://github.com/uday-gandhi04/Definitely-Not-Shazam',
      },
    ],
    align: 'left',
  },
  {
    id: 'stemify',
    label: 'FLAGSHIP · APPLIED AI/ML',
    eyebrow: '05 / DEEP LEARNING · PYTORCH',
    title: <>Teaching machines<br />to separate sound.</>,
    body: 'Stemify is my flagship AI/ML project: an audio source-separation application built around a phase-aware U-Net-family model. It takes mixed audio and works to isolate vocals and instruments into separate stems.',
    bullets: [
      'Built the model workflow with PyTorch, from preprocessing through inference and post-processing.',
      'Explored phase-aware audio separation and signal-processing techniques.',
      'Wrapped the workflow in a Flask application for usable, on-demand processing.',
    ],
    footer: 'This project brought together software engineering, signal processing and deep learning.',
    links: [
      {
        label: 'Explore Stemify on GitHub',
        href: 'https://github.com/uday-gandhi04/Stemify-Audio_Separation_App',
      },
    ],
    align: 'right',
    featured: true,
  },
  {
    id: 'ovacare',
    label: 'RESEARCH & EXPLORATION',
    eyebrow: '06 / COMPUTER VISION · HEALTH RESEARCH',
    title: <>There is always<br />another problem.</>,
    body: 'OvaCare explores ultrasound image analysis through ovarian follicle segmentation and PCOS-related classification research. It combines image preprocessing, segmentation and model experimentation.',
    bullets: [
      'Worked with PyTorch and OpenCV-based image-processing workflows.',
      'Explored segmentation, mask filtering, detection and measurement.',
      'A research prototype only — not clinically validated and not a substitute for medical assessment.',
    ],
    footer: 'Other experiments include automated video dubbing, Shakespeare.GPT and gesture-based mathematics.',
    links: [
      {
        label: 'Explore OvaCare on GitHub',
        href: 'https://github.com/uday-gandhi04/OvaCare',
      },
    ],
    align: 'left',
  },
  {
    id: 'beyond',
    label: 'BEYOND CODE',
    eyebrow: '07 / CREATIVE CURIOSITY',
    title: <>Not everything<br />starts with code.</>,
    body: 'I also enjoy 3D modelling, Blender, photography, video editing and games. These interests shape how I think about composition, interaction and the experience of using something I have built.',
    footer: 'Different tools. Different mediums. The same curiosity to make things.',
    align: 'right',
  },
  {
    id: 'future',
    label: "WHAT'S NEXT",
    eyebrow: '08 / THE DIRECTION AHEAD',
    title: <>Building towards<br />intelligent systems.</>,
    body: "My long-term direction is AI/ML engineering. I also enjoy building the software that makes intelligent systems useful, reliable and accessible. I am open to strong software engineering opportunities while continuing to deepen my work in AI/ML.",
    footer: 'I am interested in building both.',
    align: 'left',
    closing: true,
  },
];

function getTitleLines(node) {
  const lines = [[]];

  function visit(value) {
    if (
      value === null ||
      value === undefined ||
      typeof value === 'boolean'
    ) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (React.isValidElement(value)) {
      if (value.type === 'br') {
        lines.push([]);
        return;
      }

      visit(value.props.children);
      return;
    }

    lines[lines.length - 1].push(String(value));
  }

  visit(node);

  return lines
    .map((parts) => parts.join(''))
    .filter((line) => line.length > 0);
}

function ChapterContent({ chapter }) {
  const titleLines = getTitleLines(chapter.title);

  return (
    <div
      className={`journey-copy ${
        chapter.align === 'right' ? 'is-right' : 'is-left'
      }${chapter.featured ? ' is-featured' : ''}${
        chapter.closing ? ' is-closing' : ''
      }`}
    >
      <p className="journey-eyebrow">
        <span
          className="journey-eyebrow-line"
          aria-hidden="true"
        />
        {chapter.eyebrow}
      </p>

      <h2
        className="journey-title"
        aria-label={titleLines.join(' ')}
      >
        {titleLines.map((line, index) => (
          <span
            className="journey-title-mask"
            aria-hidden="true"
            key={`${chapter.id}-line-${index}`}
          >
            <span className="journey-title-line">
              {line}
            </span>
          </span>
        ))}
      </h2>

      <p className="journey-body">
        {chapter.body}
      </p>

      {chapter.note && (
        <p className="journey-note">
          {chapter.note}
        </p>
      )}

      {chapter.facts && (
        <div
          className={`journey-facts${chapter.facts.length === 3 ? ' journey-facts--three' : ''}`}
        >
          {chapter.facts.map(([value, label]) => (
            <div className="journey-fact" key={`${value}-${label}`}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {chapter.bullets && (
        <ul className="journey-bullets">
          {chapter.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {chapter.footer && (
        <p className="journey-footnote">{chapter.footer}</p>
      )}

      {chapter.links && (
        <div className="journey-links">
          {chapter.links.map((link) => (
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              key={link.href}
            >
              {link.label}
              <span>↗</span>
            </a>
          ))}
        </div>
      )}

      {chapter.closing && (
        <div className="journey-closing-actions">
          <a
            className="journey-primary-action"
            href="/resume.pdf"
            download="Uday_Gandhi_Resume.pdf"
          >
            Download résumé <span>↓</span>
          </a>

          <a
            href="https://github.com/uday-gandhi04"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>

          <a
            href="https://www.linkedin.com/in/uday-gandhi-46314624b/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>

          <a href="mailto:udaygandhi2004@gmail.com">
            Get in touch ↗
          </a>
        </div>
      )}
    </div>
  );
}

export default function JourneyExperience() {
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef({ value: 0 });
  const chapterRefs = useRef([]);

  const [activeChapter, setActiveChapter] = useState(0);

  const chapterCount = CHAPTERS.length;

  useEffect(() => {
    const scroller = scrollRef.current;
    const track = trackRef.current;

    if (!scroller || !track) return undefined;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduceMotion) {
      progressRef.current.value = 0;
      return undefined;
    }

    const context = gsap.context(() => {
      ScrollTrigger.create({
        scroller,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progressRef.current.value = self.progress;
        },
      });

      chapterRefs.current.forEach((section, index) => {
        if (!section) return;

        ScrollTrigger.create({
          trigger: section,
          scroller,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveChapter(index),
          onEnterBack: () => setActiveChapter(index),
        });

        const copy = section.querySelector('.journey-copy');
        if (!copy) return;

        const eyebrow = copy.querySelector('.journey-eyebrow');
        const eyebrowLine = copy.querySelector('.journey-eyebrow-line');
        const titleLines = copy.querySelectorAll('.journey-title-line');
        const body = copy.querySelector('.journey-body');
        const note = copy.querySelector('.journey-note');
        const facts = copy.querySelectorAll('.journey-fact');
        const bullets = copy.querySelectorAll('.journey-bullets li');
        const footnote = copy.querySelector('.journey-footnote');
        const links = copy.querySelectorAll(
          '.journey-links a, .journey-closing-actions a',
        );

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: copy,
            scroller,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });

        timeline.fromTo(
          eyebrow,
          {
            autoAlpha: 0,
            y: 14,
            letterSpacing: '0.27em',
          },
          {
            autoAlpha: 1,
            y: 0,
            letterSpacing: '0.17em',
            duration: 0.35,
            ease: 'none',
          },
          0,
        );

        timeline.fromTo(
          eyebrowLine,
          {
            scaleX: 0,
            transformOrigin: 'left center',
          },
          {
            scaleX: 1,
            duration: 0.35,
            ease: 'none',
          },
          0,
        );

        timeline.fromTo(
          titleLines,
          {
            yPercent: 112,
            rotateX: -10,
            autoAlpha: 0,
            transformOrigin: 'left bottom',
          },
          {
            yPercent: 0,
            rotateX: 0,
            autoAlpha: 1,
            stagger: 0.16,
            duration: 0.72,
            ease: 'power3.out',
          },
          0.08,
        );

        if (body) {
          timeline.fromTo(
            body,
            {
              y: 20,
              autoAlpha: 0,
              filter: 'blur(5px)',
            },
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
              duration: 0.65,
              ease: 'power2.out',
            },
            0.48,
          );
        }

        if (note) {
          timeline.fromTo(
            note,
            {
              y: 16,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.45,
            },
            0.78,
          );
        }

        if (facts.length) {
          timeline.fromTo(
            facts,
            {
              y: 18,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.10,
              duration: 0.48,
              ease: 'power2.out',
            },
            0.95,
          );
        }

        if (bullets.length) {
          timeline.fromTo(
            bullets,
            {
              x: -16,
              autoAlpha: 0,
            },
            {
              x: 0,
              autoAlpha: 1,
              stagger: 0.12,
              duration: 0.45,
              ease: 'power2.out',
            },
            0.92,
          );
        }

        if (footnote) {
          timeline.fromTo(
            footnote,
            {
              y: 12,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.4,
              ease: 'power2.out',
            },
            1.18,
          );
        }

        if (links.length) {
          timeline.fromTo(
            links,
            {
              y: 12,
              autoAlpha: 0,
            },
            {
              y: 0,
              autoAlpha: 1,
              stagger: 0.10,
              duration: 0.4,
              ease: 'power2.out',
            },
            1.28,
          );
        }
      });
    }, track);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => context.revert();
  }, [chapterCount]);

  const jumpToChapter = (index) => {
    const scroller = scrollRef.current;
    const section = chapterRefs.current[index];

    if (!scroller || !section) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    scroller.scrollTo({
      top: section.offsetTop,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <div
      className="journey-experience"
      aria-label="Uday Gandhi's career and project journey"
    >
      <div className="journey-world" aria-hidden="true">
        <Canvas
          dpr={[1, 1.35]}
          camera={{
            position: [0, 3.6, 13],
            fov: 42,
            near: 0.1,
            far: 150,
          }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
          }}
          fallback={<div className="journey-canvas-fallback" />}
        >
          <JourneyWorld progressRef={progressRef} />
          <AdaptiveDpr pixelated />
        </Canvas>
      </div>

      <div className="journey-vignette" aria-hidden="true" />

      <div className="journey-scroll" ref={scrollRef}>
        <div className="journey-track" ref={trackRef}>
          {CHAPTERS.map((chapter, index) => (
            <section
              className={`journey-chapter${chapter.featured ? ' chapter-featured' : ''}${chapter.closing ? ' chapter-closing' : ''}`}
              data-chapter={chapter.id}
              aria-label={chapter.label}
              key={chapter.id}
              ref={(element) => {
                chapterRefs.current[index] = element;
              }}
            >
              <div className="journey-chapter-inner">
                <ChapterContent chapter={chapter} />
              </div>

              {index === 0 && (
                <span className="journey-scroll-cue">
                  <i />
                  SCROLL TO EXPLORE
                </span>
              )}

              {index === chapterCount - 1 && (
                <span className="journey-endmark">
                  UDAY GANDHI · UDAY'S STACK
                </span>
              )}
            </section>
          ))}
        </div>
      </div>

      {/* Minimal chapter progress: no duplicate counters or labels. */}
      <nav
        className="journey-rail"
        aria-label="Jump to a journey chapter"
      >
        <div className="journey-rail-items">
          {CHAPTERS.map((chapter, index) => (
            <button
              type="button"
              key={chapter.id}
              className={index === activeChapter ? 'active' : ''}
              onClick={() => jumpToChapter(index)}
              aria-label={`Go to ${chapter.label}`}
              aria-current={
                index === activeChapter ? 'step' : undefined
              }
              title={chapter.label}
            >
              <span className="journey-rail-dot" />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}