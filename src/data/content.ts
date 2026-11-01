export const TOTAL_FRAMES = 189;
export const FRAME_PATH = (n: number) =>
  `/frames/frame_${String(n).padStart(3, '0')}.png`;

export const siteConfig = {
  name: 'Vaigunthan SL',
  title: 'Vaigunthan SL — Cloud-Enabled Full-Stack Developer',
  description:
    '3rd-year B.Tech CSBS student, AWS Certified Cloud Practitioner, full-stack developer with international student mobility experience at INTI International University, Malaysia.',
  url: 'https://vaigunthansl.vercel.app',
};

// Only the 10 authorized skills in 3 distinct branches
export const skillTree = {
  root: 'SKILLS',
  branches: [
    {
      name: 'TECHNICAL',
      skills: [
        { name: 'Java', id: '01' },
        { name: 'JavaScript', id: '02' },
        { name: 'HTML', id: '03' },
        { name: 'CSS', id: '04' },
      ],
    },
    {
      name: 'CLOUD',
      skills: [
        { name: 'AWS', id: '05' },
        { name: 'Cloud Computing', id: '06' },
      ],
    },
    {
      name: 'PEOPLE',
      skills: [
        { name: 'Leadership', id: '07' },
        { name: 'Creativity', id: '08' },
        { name: 'Team Collaboration', id: '09' },
        { name: 'Communication', id: '10' },
      ],
    },
  ],
};

export const experience = [
  {
    role: 'GenAI & Cloud Computing Intern',
    company: 'IBM SkillsBuild',
    period: 'Jun – Jul 2026',
    description:
      'Trained in generative AI, prompt engineering, cloud service models (IaaS / PaaS / SaaS), AWS fundamentals, cloud security, and virtualization concepts.',
    certificate: '/images/ibm-skillsbuild-cert.webp',
  },
  {
    role: 'Python Programming Intern',
    company: 'InternPe',
    period: 'Dec 2025 – Jan 2026',
    description:
      'Developed foundational Python programs, structured logical algorithms, and practiced software debugging workflows.',
    certificate: null,
  },
];

export type Project = {
  title: string;
  tagline: string;
  description: string;
  image: string;
  tech: string[];
  hasLiveDemo: boolean;
  liveNote?: string;
  liveUrl?: string;
  codeUrl: string;
};

export const projects: Project[] = [
  {
    title: 'PocketBot',
    tagline: 'WhatsApp AI Assistant',
    description:
      'Multilingual WhatsApp assistant with live news, student resources, gold price tracking, and medicine reminders.',
    image: '/images/project-pocketbot.webp',
    tech: ['Python', 'FastAPI', 'Twilio', 'PostgreSQL', 'Railway'],
    hasLiveDemo: false,
    liveNote: 'Runs inside WhatsApp via Twilio. No web demo exists.',
    codeUrl: 'https://github.com/vaigunthan314/pocketbot',
  },
  {
    title: 'PathForge',
    tagline: 'Learning Roadmap Platform',
    description:
      'Platform generating personalized career roadmaps with skill-gap analysis and context-aware AI tutor via Groq API.',
    image: '/images/project-pathforge.webp',
    tech: ['React', 'Spring Boot', 'Firebase', 'Groq API', 'Render'],
    hasLiveDemo: true,
    liveUrl: 'https://pathforage.onrender.com/',
    codeUrl: 'https://github.com/vaigunthan314/pathforage',
  },
  {
    title: 'CampusCode',
    tagline: 'Hackathon Arena Website',
    description:
      'Cinematic website recreation featuring black slit reveal, responsive layout (375px to 1920px), and 3D cube model.',
    image: '/images/project-pathforge.webp',
    tech: ['GSAP', 'ScrollTrigger', 'Three.js', 'TypeScript'],
    hasLiveDemo: true,
    liveUrl: 'https://campuscode-sooty.vercel.app/',
    codeUrl: 'https://github.com/vaigunthan314/campuscode',
  },
];

export const education = [
  {
    institution: 'Knowledge Institute of Technology',
    degree: 'B.Tech Computer Science & Business Systems',
    period: '2024 – Present',
    detail: 'CGPA 7.905 / 10',
    certificate: null,
    malaysiaCta: false,
  },
  {
    institution: 'INTI International University, Malaysia',
    degree: 'Bachelor of Computer Science (Hons)',
    period: '12 Jan – 10 May 2026',
    detail: 'Student Mobility Exchange — 80.5%',
    certificate: '/images/inti-exchange-cert.webp',
    malaysiaCta: true,
  },
];

export const certifications = [
  {
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    date: 'September 2026 – September 2029',
    validationId: 'ce176d70d50141388b72b5b0b2f1acd0',
    verificationUrl: 'https://aws.amazon.com/verification',
    image: '/images/aws-certified.webp',
  },
  {
    title: 'IBM SkillsBuild — GenAI & Cloud Computing',
    issuer: 'IBM',
    date: 'July 2026',
    validationId: '',
    verificationUrl:
      'https://www.credly.com/badges/1df1c148-ab8b-411c-a1d9-966508eb1c70/linked_in_profile',
    image: '/images/ibm-skillsbuild-cert.webp',
  },
];

export const achievements = [
  'AWS Certified Cloud Practitioner (Validation: ce176d70d50141388b72b5b0b2f1acd0)',
  'NPTEL Organizational Behaviour — Silver + Elite (84%)',
  '2nd Prize, Paper Presentation on SDG 11',
  'Associate Office Bearer, ACID (2026 – Present)',
  '10+ events including hackathons, presentations, and competitions',
];

export const contact = {
  email: 'vaigunthan20@gmail.com',
  linkedin: 'https://linkedin.com/in/vaigunthansl',
  github: 'https://github.com/vaigunthan314',
  resumePath: '/Vaigunthan_SL_Resume.pdf',
};

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
];
