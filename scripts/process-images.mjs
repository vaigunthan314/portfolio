import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC_DIR = join(ROOT, 'assests', 'Images');
const OUT_DIR = join(ROOT, 'public', 'images');

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const imagesToProcess = [
  {
    src: 'WhatsApp Image 2026-11-01 at 17.26.41.jpeg',
    out: 'vaigunthan-profile.webp',
    maxWidth: 1600,
    purpose: 'Portrait / Profile in About section'
  },
  {
    src: 'WhatsApp Image 2026-11-01 at 17.29.44.jpeg',
    out: 'aws-certified.webp',
    maxWidth: 1080,
    purpose: 'AWS Certification credential in Education/Certifications & OG preview'
  },
  {
    src: 'WhatsApp Image 2026-11-01 at 17.26.29.jpeg',
    out: 'ibm-skillsbuild-cert.webp',
    maxWidth: 1080,
    purpose: 'IBM SkillsBuild Internship Certificate in Experience & Education'
  },
  {
    src: 'WhatsApp Image 2026-11-01 at 17.26.39.jpeg',
    out: 'inti-exchange-cert.webp',
    maxWidth: 1600,
    purpose: 'INTI International University Student Mobility Certificate in Education'
  }
];

async function run() {
  for (const item of imagesToProcess) {
    const srcPath = join(SRC_DIR, item.src);
    const outPath = join(OUT_DIR, item.out);
    const meta = await sharp(srcPath).metadata();
    
    let pipeline = sharp(srcPath);
    if (meta.width && meta.width > item.maxWidth) {
      pipeline = pipeline.resize({ width: item.maxWidth });
    }
    await pipeline.webp({ quality: 80 }).toFile(outPath);
    console.log(`Processed: ${item.out} (${item.purpose})`);
  }

  // Also generate an OG image derived from the AWS certification / profile in public/og-image.jpg
  await sharp(join(SRC_DIR, 'WhatsApp Image 2026-11-01 at 17.29.44.jpeg'))
    .resize({ width: 1200, height: 630, fit: 'contain', background: '#0a0a0a' })
    .jpeg({ quality: 85 })
    .toFile(join(ROOT, 'public', 'og-image.jpg'));
  console.log('Generated public/og-image.jpg');

  // Also create sleek project mockups for PocketBot and PathForge with flat solid colors
  const pocketBotSvg = `
  <svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#0a0a0a"/>
    <rect x="40" y="40" width="1120" height="620" fill="#141414" stroke="#8a8a85" stroke-width="2"/>
    <rect x="40" y="40" width="1120" height="50" fill="#1e1e1e" stroke="#8a8a85" stroke-width="2"/>
    <circle cx="80" cy="65" r="8" fill="#d93025"/>
    <circle cx="110" cy="65" r="8" fill="#8a8a85"/>
    <circle cx="140" cy="65" r="8" fill="#8a8a85"/>
    <text x="180" y="70" font-family="monospace" font-size="16" fill="#f4f3ef">PocketBot — WhatsApp AI Assistant Terminal [Railway :: FastAPI :: Twilio]</text>
    
    <rect x="80" y="130" width="480" height="110" fill="#0a0a0a" stroke="#8a8a85" stroke-width="1"/>
    <text x="100" y="165" font-family="monospace" font-size="16" fill="#d93025">USER @ WHATSAPP &gt;</text>
    <text x="100" y="195" font-family="sans-serif" font-size="18" fill="#f4f3ef">Check gold prices in INR and set medicine reminder at 8 PM</text>
    
    <rect x="640" y="270" width="480" height="150" fill="#0a0a0a" stroke="#d93025" stroke-width="1.5"/>
    <text x="660" y="305" font-family="monospace" font-size="16" fill="#d93025">POCKETBOT &gt; FastAPI Engine</text>
    <text x="660" y="340" font-family="sans-serif" font-size="16" fill="#f4f3ef">✓ Live 24K Gold: ₹7,850/g (+0.4%)</text>
    <text x="660" y="370" font-family="sans-serif" font-size="16" fill="#f4f3ef">✓ Medicine reminder scheduled for 20:00 via Twilio</text>
    <text x="660" y="400" font-family="sans-serif" font-size="15" fill="#8a8a85">Stored in PostgreSQL database instance on Railway</text>

    <rect x="80" y="450" width="1040" height="170" fill="#0a0a0a" stroke="#8a8a85" stroke-width="1"/>
    <text x="110" y="490" font-family="monospace" font-size="16" fill="#8a8a85">ARCHITECTURE STACK</text>
    <text x="110" y="530" font-family="sans-serif" font-weight="bold" font-size="22" fill="#f4f3ef">Python 3.11  •  FastAPI Webhooks  •  Twilio Messaging API  •  PostgreSQL  •  Railway</text>
    <text x="110" y="570" font-family="sans-serif" font-size="16" fill="#8a8a85">Multilingual Natural Language Processing, Scheduled Reminders, Real-time Commodities &amp; Student Portals</text>
  </svg>`;
  await sharp(Buffer.from(pocketBotSvg)).webp({ quality: 85 }).toFile(join(OUT_DIR, 'project-pocketbot.webp'));
  console.log('Generated public/images/project-pocketbot.webp');

  const pathForgeSvg = `
  <svg width="1200" height="700" viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#0a0a0a"/>
    <rect x="40" y="40" width="1120" height="620" fill="#141414" stroke="#8a8a85" stroke-width="2"/>
    <rect x="40" y="40" width="1120" height="50" fill="#1e1e1e" stroke="#8a8a85" stroke-width="2"/>
    <circle cx="80" cy="65" r="8" fill="#d93025"/>
    <circle cx="110" cy="65" r="8" fill="#8a8a85"/>
    <circle cx="140" cy="65" r="8" fill="#8a8a85"/>
    <text x="180" y="70" font-family="monospace" font-size="16" fill="#f4f3ef">PathForge — AI Personalized Learning Platform [React :: Spring Boot :: Groq API]</text>
    
    <rect x="80" y="130" width="500" height="290" fill="#0a0a0a" stroke="#8a8a85" stroke-width="1"/>
    <text x="100" y="170" font-family="monospace" font-size="16" fill="#d93025">DYNAMIC CAREER ROADMAP</text>
    <text x="100" y="210" font-family="sans-serif" font-weight="bold" font-size="20" fill="#f4f3ef">Target: Cloud &amp; AI Systems Engineer</text>
    <rect x="100" y="235" width="460" height="30" fill="#1e1e1e"/>
    <rect x="100" y="235" width="370" height="30" fill="#d93025"/>
    <text x="110" y="256" font-family="monospace" font-size="14" fill="#f4f3ef">SKILL-GAP COMPLETION: 82%</text>
    <text x="100" y="300" font-family="sans-serif" font-size="15" fill="#f4f3ef">Milestone 1: Distributed Architecture &amp; Microservices (Done)</text>
    <text x="100" y="335" font-family="sans-serif" font-size="15" fill="#f4f3ef">Milestone 2: LLM Context Caching &amp; Retrieval (Done)</text>
    <text x="100" y="370" font-family="sans-serif" font-size="15" fill="#8a8a85">Milestone 3: Kubernetes Production Orchestration (In Progress)</text>

    <rect x="620" y="130" width="500" height="290" fill="#0a0a0a" stroke="#d93025" stroke-width="1.5"/>
    <text x="640" y="170" font-family="monospace" font-size="16" fill="#d93025">CONTEXT-AWARE AI TUTOR (GROQ API)</text>
    <rect x="640" y="195" width="460" height="70" fill="#141414"/>
    <text x="655" y="225" font-family="sans-serif" font-size="15" fill="#f4f3ef">"How does Spring Boot reactive handling scale compared</text>
    <text x="655" y="250" font-family="sans-serif" font-size="15" fill="#f4f3ef">to traditional thread-per-request models?"</text>
    <text x="640" y="300" font-family="sans-serif" font-size="15" fill="#8a8a85">Groq Llama 3 70B inference latency: 142ms</text>
    <text x="640" y="335" font-family="sans-serif" font-size="15" fill="#f4f3ef">Contextual breakdown delivered with benchmark code.</text>
    <text x="640" y="375" font-family="monospace" font-size="13" fill="#d93025">Persisted via Firebase Auth &amp; H2/JPA cache</text>

    <rect x="80" y="450" width="1040" height="170" fill="#0a0a0a" stroke="#8a8a85" stroke-width="1"/>
    <text x="110" y="490" font-family="monospace" font-size="16" fill="#8a8a85">ARCHITECTURE STACK</text>
    <text x="110" y="530" font-family="sans-serif" font-weight="bold" font-size="22" fill="#f4f3ef">React 18 SPA  •  Spring Boot 3 REST API  •  Groq Cloud LLM  •  Firebase  •  Render</text>
    <text x="110" y="570" font-family="sans-serif" font-size="16" fill="#8a8a85">Automated Skill-Gap Graph Analysis, Interactive Prompting, Dynamic Learning Path Generation</text>
  </svg>`;
  await sharp(Buffer.from(pathForgeSvg)).webp({ quality: 85 }).toFile(join(OUT_DIR, 'project-pathforge.webp'));
  console.log('Generated public/images/project-pathforge.webp');
}

run().catch(console.error);
