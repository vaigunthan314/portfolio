# Vaigunthan SL — Award-Level 3D Scroll Portfolio

A high-performance, award-level scroll portfolio featuring a frame-scrubbed hero sequence, smooth Lenis inertia scrolling, GSAP ScrollTrigger timeline reveals, an interactive React Three Fiber wireframe, and a strict flat-color aesthetic with custom micro-interactions.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS v4, Custom Design System
- **Animation & Scroll**: GSAP 3 + ScrollTrigger, Lenis Smooth Scroll
- **3D**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Image Processing**: Sharp (Node.js script for WebP conversion)
- **Palette**: Flat solid colors only (#0a0a0a, #f4f3ef, #8a8a85, #d93025)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Convert Frames (if regenerating)
The original 236 JPEG frames have already been processed into optimized WebP images (`/public/frames/frame-0001.webp` ... `frame-0236.webp`):
```bash
npm run frames
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production & Linting
```bash
npm run lint
npm run build
```

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. In the Vercel Dashboard, click **"Add New Project"** and import the repository.
3. Configure the build settings (defaults will work out of the box):
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. Click **Deploy**.

> Note: `./assests/frames-src/` is in `.gitignore` so your Git repository and Vercel build payload remain small and under size limits. Only the converted WebP frames in `public/frames` are tracked and deployed.

---

## 📝 TODO: Items You Need to Replace / Customize

All site content is centralized in [`src/data/content.ts`](file:///Users/vaigunthansl/Desktop/portfolio/src/data/content.ts):

1. **Project Links**:
   - `PocketBot`:
     - `liveUrl`: Replace `#` with your deployed WhatsApp link or Railway URL.
     - `codeUrl`: Replace `#` with your GitHub repository link.
   - `PathForge`:
     - `liveUrl`: Replace `#` with your deployed Render URL.
     - `codeUrl`: Replace `#` with your GitHub repository link.
2. **Resume PDF**:
   - The file was automatically copied from `./assests/Vaigunthan_SL_Resume.pdf` to [`public/Vaigunthan_SL_Resume.pdf`](file:///Users/vaigunthansl/Desktop/portfolio/public/Vaigunthan_SL_Resume.pdf).
   - If you ever update your resume, simply place the new PDF at `public/Vaigunthan_SL_Resume.pdf`.
3. **Domain / URL Configuration**:
   - In `src/data/content.ts`, update `siteConfig.url` once your custom domain or Vercel URL is live.
