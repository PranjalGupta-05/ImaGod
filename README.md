# 🎨 ImaGod — AI-Powered Creative Studio

## [DEMO VIDEO](https://drive.google.com/file/d/1J7sgcsiQw9Xe2mmh6Kj0MWvk28ZnV6ls/view?usp=sharing)
## [Project Live Link](https://ima-god.vercel.app)

> **Hackathon Track: Your Media-Savvy Startup**
>
> ImaGod is a full-stack, SaaS-style AI image creation and editing platform where **Cloudinary is the engine**, not just the file host. Every core feature — text-to-image generation, background removal, photo enhancement, generative replace, generative recolor, outpainting, and deblurring — runs through Cloudinary's AI and transformation pipeline in real time.

[![Built with Cloudinary](https://img.shields.io/badge/Built%20with-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](#cloudinary-integration)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#tech-stack)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#tech-stack)

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution--ImaGod)
- [Features at a Glance](#-features-at-a-glance)
- [How We Used Cloudinary (Deep Dive)](#-how-we-used-cloudinary-deep-dive)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [How to Test It](#-how-to-test-it)
- [API Reference](#-api-reference)
- [Credits & Monetisation](#-credits--monetisation)
- [License](#-license)

---

## 🔴 The Problem

Creative professionals, indie hackers, and social-media creators need AI image tools daily — but the landscape is fragmented:

| Pain Point | What Exists Today |
|---|---|
| **Tool sprawl** | Text-to-image on one site, background removal on another, upscaling on a third. |
| **No history** | Generated images vanish once you close the tab. |
| **No media intelligence** | Most wrappers just call an AI model and dump a PNG. No smart delivery, no responsive formats, no CDN. |
| **Cost opacity** | Subscription-based pricing with unused quotas. |

Creators shouldn't need five browser tabs and three subscriptions to go from an idea to a polished, download-ready image.

---

## 💡 Our Solution — ImaGod

ImaGod is a **single-platform creative studio** that bundles seven distinct AI-powered image operations into one cohesive product, with a pay-per-use credit system and a full media history — all powered end-to-end by **Cloudinary**.

> Think of it as *"Canva's AI tools meets a Cloudinary-native backend"* — every pixel is processed, stored, transformed, searched, and delivered through Cloudinary.

### Why This Is a "Media-Savvy Startup"

ImaGod isn't a static file uploader with a Cloudinary widget bolted on. Cloudinary is **structurally integral** to the product:

- **Without Cloudinary**, there is no image generation, no background removal, no enhancement, no outpainting — the product literally cannot function.
- We use **7 distinct Cloudinary capabilities** across the Upload, Admin, Search, URL-based Transformation, and Generation APIs.
- Every user's media history is **Cloudinary-native**: assets are tagged per user, searched via the Search API, and thumbnailed via on-the-fly URL transformations.

---

## ✨ Features at a Glance

| # | Feature | Description | Cloudinary Capability Used |
|---|---|---|---|
| 1 | **Text-to-Image Generation** | Type a natural-language prompt, pick a style (Cinematic, Anime, Cyberpunk, etc.) and aspect ratio — get an AI-generated image. | `POST /v2/generate/{cloud}/text_to_image` |
| 2 | **Background Removal** | Upload any photo, get a clean PNG with the background erased by AI. | `upload_stream` with `background_removal: 'cloudinary_ai'` |
| 3 | **Photo Enhancement & Upscaling** | Upload a photo; receive an AI-improved, upscaled version. | URL transforms: `e_improve`, `e_upscale`, `q_auto:best` |
| 4 | **Generative Replace** | Swap any object in a photo for something else using text prompts. | URL transform: `e_gen_replace:from_{X};to_{Y}` |
| 5 | **Generative Recolor** | Recolor a specific object in a photo to any target color. | URL transform: `e_gen_recolor:prompt_{X};to-color_{Y}` |
| 6 | **Generative Fill / Outpainting** | Extend an image to a new aspect ratio; AI fills the new canvas. | URL transform: `c_pad, g_center, b_gen_fill` |
| 7 | **AI Unblur / Deblur** | Sharpen blurry photos with three modes (Standard, Motion, Face). | URL transforms: `e_unsharp_mask`, `e_sharpen`, `e_improve`, `e_upscale` |
| 8 | **Media History & Gallery** | Browse, filter, and delete all past creations — fetched from Cloudinary's Search API. | `cloudinary.search` with tag-based queries |
| 9 | **Usage Analytics Dashboard** | Real-time breakdown of credits consumed per feature, auto-synced from Cloudinary. | `cloudinary.search` for retroactive usage sync |
| 10 | **Credit Purchase** | Buy credits via Razorpay checkout; credits never expire. | *(Razorpay — payments)* |

---

## 🔧 How We Used Cloudinary (Deep Dive)

### 1. AI Image Generation (Text-to-Image API v2)

```
POST https://api.cloudinary.com/v2/generate/{cloud_name}/text_to_image
```

We call Cloudinary's **Text-to-Image Generation API** directly. The prompt (optionally enriched with a style suffix like "cinematic composition, dramatic volumetric lighting…") is sent with quality preference `auto`, and the resulting managed asset is stored under `ImaGod/generated/{timestamp}`.

**Why Cloudinary and not a raw Stable Diffusion endpoint?**
Because Cloudinary stores the result as a *managed asset* — it's immediately available on the CDN, searchable, taggable, and transformable without any extra upload step.

> 📁 **Code**: [`server/controllers/imageController.js` → `generateImage()`](server/controllers/imageController.js)

### 2. AI Background Removal

```js
cloudinary.uploader.upload_stream({
    folder: 'ImaGod/bg-removal',
    background_removal: 'cloudinary_ai',
    tags: [userId]
});
```

We upload the user's image as a stream with the `background_removal: 'cloudinary_ai'` flag. Cloudinary processes it asynchronously, so we **poll** the asset status via `cloudinary.api.resource()` until `info.background_removal.cloudinary_ai.status === 'complete'`.

> 📁 **Code**: [`server/controllers/imageController.js` → `removeBg()` & `pollForResult()`](server/controllers/imageController.js)

### 3. Smart URL-Based Transformations

For Enhancement, Generative Replace, Generative Recolor, Generative Fill, and Unblur, we:

1. **Upload** the source image to a feature-specific folder (e.g., `ImaGod/enhance/`, `ImaGod/gen-fill/`)
2. **Construct a transformation URL** using `cloudinary.url()` with chained effects
3. **Return the URL** — Cloudinary processes the transformation on first request and caches it on the CDN

Example — **Generative Fill / Outpainting**:
```js
cloudinary.url(publicId, {
    transformation: [
        { width: 1280, height: 720, crop: 'pad', gravity: 'center', background: 'gen_fill' },
        { quality: 'auto:best' },
    ],
    format: 'jpg',
    secure: true,
});
```

This is powerful because **no intermediate file is written** — the transformation is expressed as a URL, and Cloudinary's edge network handles rendering, caching, and delivery.

### 4. Tag-Based User Media Library (Search API)

Every uploaded/generated asset is **tagged with the user's MongoDB `_id`**:

```js
cloudinary.uploader.add_tag(userId, [publicId]);
```

The History page then queries:
```js
cloudinary.search
    .expression(`public_id:ImaGod/* AND tags=${userId}`)
    .sort_by('created_at', 'desc')
    .max_results(50)
    .with_field('tags')
    .with_field('context')
    .execute();
```

This means Cloudinary **is** the media database — we don't duplicate asset metadata in MongoDB. The Search API gives us filtering by feature folder, pagination, and sorting for free.

### 5. Thumbnail Generation (On-the-Fly)

Gallery thumbnails are generated via URL transforms — no pre-processing needed:
```js
cloudinary.url(publicId, {
    transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
        { quality: 'auto', fetch_format: 'auto' },
    ],
    secure: true,
});
```

### 6. Asset Deletion with Ownership Verification

When a user deletes from history, we **verify tag ownership** before destroying:
```js
const resource = await cloudinary.api.resource(publicId, { tags: true });
if (!resource.tags || !resource.tags.includes(userId)) {
    return res.json({ success: false, message: 'Unauthorized' });
}
await cloudinary.uploader.destroy(publicId);
```

### 7. Retroactive Usage Sync

If a user's local usage counters are zero (e.g., after a data migration), the `/api/user/usage` endpoint **auto-syncs from Cloudinary** by counting assets per folder prefix:

```js
cloudinary.search
    .expression(`public_id:ImaGod/* AND tags=${userId}`)
    .max_results(500)
    .execute();
// Then count: ImaGod/generated/* → textToImage, ImaGod/bg-removal/* → removeBg, etc.
```

---

### Summary of Cloudinary APIs & SDKs Used

| Cloudinary API / Feature | Where We Use It |
|---|---|
| **Text-to-Image Generation API v2** | AI image generation from prompts |
| **Upload API** (`upload_stream`) | Background removal, enhance, replace, recolor, fill, unblur |
| **Background Removal Add-on** (`cloudinary_ai`) | AI background eraser |
| **URL-based Transformations** | Enhance (`e_improve`, `e_upscale`), Gen Replace (`e_gen_replace`), Gen Recolor (`e_gen_recolor`), Gen Fill (`b_gen_fill`, `c_pad`), Unblur (`e_unsharp_mask`, `e_sharpen`) |
| **Admin API** (`api.resource`) | Polling for async processing status, ownership verification |
| **Search API** (`cloudinary.search`) | User history, usage analytics sync, feature filtering |
| **Tag Management** (`uploader.add_tag`) | Per-user asset ownership |
| **Asset Deletion** (`uploader.destroy`) | History cleanup |
| **CDN Delivery** (automatic) | All generated/transformed images served via Cloudinary's global CDN |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (React + Vite)              │
│                                                         │
│  Home ─ Result ─ RemoveBg ─ Enhance ─ Unblur ─ AiEditor│
│  GenFill ─ History ─ Usage ─ BuyCredit                  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ AppContext   │  │ Framer Motion│  │  Razorpay JS  │  │
│  │ (state/API)  │  │ (animations) │  │  (checkout)   │  │
│  └──────┬──────┘  └──────────────┘  └───────────────┘  │
│         │  axios                                        │
└─────────┼───────────────────────────────────────────────┘
          │  REST API calls
          ▼
┌─────────────────────────────────────────────────────────┐
│                  Server (Express 5 + Node.js)           │
│                                                         │
│  Routes:  /api/user/*  ─  /api/image/*                  │
│  Auth:    JWT middleware                                 │
│  Upload:  Multer (memory storage)                       │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  userCtrl    │  │  imageCtrl   │  │ historyCtrl  │  │
│  │  (auth,pay,  │  │  (generate,  │  │ (search,     │  │
│  │   credits)   │  │   transform) │  │  delete)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          ▼                ▼                ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│   MongoDB    │  │    Cloudinary    │  │   Razorpay   │
│   Atlas      │  │  (AI + Media)   │  │  (Payments)  │
│              │  │                  │  │              │
│  • Users     │  │  • Generation    │  │  • Orders    │
│  • Credits   │  │  • Transforms   │  │  • Verify    │
│  • Txns      │  │  • Search/Tags  │  │              │
│  • Usage     │  │  • CDN Delivery │  │              │
└──────────────┘  └──────────────────┘  └──────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Page transitions & micro-animations |
| **GSAP** | Advanced scroll-driven animations |
| **Lenis** | Smooth scrolling |
| **Lucide React** | Icon library |
| **React Router v7** | Client-side routing |
| **Axios** | HTTP client |
| **React Toastify** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **Cloudinary SDK v2** | Image AI, transforms, search, uploads |
| **Mongoose 9 + MongoDB Atlas** | User data, credits, transactions |
| **Multer** | Multipart file upload handling (memory) |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT-based authentication |
| **Razorpay SDK** | Payment gateway integration |
| **dotenv** | Environment variable management |

---

## 📂 Project Structure

```
ImaGod-V2/
├── client/                          # React frontend (Vite)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, videos
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI primitives (Button, Card, GrainOverlay, etc.)
│   │   │   ├── effects/             # Visual effects components
│   │   │   ├── Navbar.jsx           # Navigation with auth state
│   │   │   ├── Footer.jsx           # Site footer
│   │   │   ├── Login.jsx            # Auth modal (login/register)
│   │   │   ├── ScrollMorphHero.jsx  # Animated landing hero
│   │   │   ├── VideoHero.jsx        # Video showcase section
│   │   │   └── Description.jsx      # Feature descriptions
│   │   ├── context/
│   │   │   └── AppContext.jsx       # Global state & all API methods
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Result.jsx           # Text-to-Image studio (chat UI)
│   │   │   ├── RemoveBg.jsx         # Background removal page
│   │   │   ├── Enhance.jsx          # Photo enhancement page
│   │   │   ├── Unblur.jsx           # AI deblur page
│   │   │   ├── AiEditor.jsx         # Gen Replace & Recolor page
│   │   │   ├── GenFill.jsx          # Outpainting / generative fill page
│   │   │   ├── History.jsx          # Media gallery with Cloudinary search
│   │   │   ├── Usage.jsx            # Usage analytics dashboard
│   │   │   └── BuyCredit.jsx        # Credit purchase & pricing
│   │   ├── App.jsx                  # Root component with routes
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── .env                         # Frontend env vars (VITE_*)
│   └── package.json
│
├── server/                          # Express backend
│   ├── config/
│   │   ├── cloudinary.js            # Cloudinary SDK initialization
│   │   └── mongodb.js               # Mongoose connection
│   ├── controllers/
│   │   ├── imageController.js       # All 7 image AI endpoints
│   │   ├── userController.js        # Auth, credits, payments, usage
│   │   └── historyController.js     # Cloudinary Search API for history
│   ├── middlewares/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── userModel.js             # User schema (credits, usageLogs)
│   │   └── transactionModel.js      # Payment transaction schema
│   ├── routes/
│   │   ├── imageRoutes.js           # /api/image/* routes
│   │   └── userRoutes.js            # /api/user/* routes
│   ├── .env                         # Backend env vars
│   ├── package.json
│   └── server.js                    # Express app entry point
│
├── .env.example                     # Root env reference
├── .gitignore
└── README.md                        # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB Atlas** cluster (free tier works)
- **Cloudinary** account (free tier — [sign up](https://cloudinary.com/users/register_free))
  - Ensure the **Cloudinary AI Background Removal** add-on is enabled in your Cloudinary dashboard
- **Razorpay** account (test mode — [sign up](https://dashboard.razorpay.com/signup))

### 1. Clone the Repository

```bash
git clone https://github.com/PranjalGupta-05/ImaGod-V2.git
cd ImaGod-V2
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

Copy the example files and fill in your credentials:

```bash
# From the project root
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>
JWT_SECRET=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
RAZORPAY_KEY_ID=rzp_test_<your-test-key>
RAZORPAY_KEY_SECRET=<your-test-secret>
CURRENCY=INR
```

**`client/.env`**
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_<your-test-key>
```

> **Where to find Cloudinary credentials:**
> Dashboard → [cloudinary.com/console](https://console.cloudinary.com/) → copy **Cloud Name**, **API Key**, **API Secret**.

### 4. Start the Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run server        # Starts with nodemon on port 4000

# Terminal 2 — Frontend
cd client
npm run dev           # Starts Vite dev server on port 5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Optional | Server port (default: `4000`) |
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Your Cloudinary API secret |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay Key ID (use `rzp_test_*` for testing) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay Key Secret |
| `CURRENCY` | Optional | Payment currency (default: `INR`) |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_BACKEND_URL` | ✅ | Backend API URL (e.g., `http://localhost:4000`) |
| `VITE_RAZORPAY_KEY_ID` | ✅ | Razorpay public key for client-side checkout |

---

## 🧪 How to Test It

### Quick-Start Testing Checklist

After starting both servers, follow this sequence to exercise every Cloudinary-powered feature:

#### Step 1: Register & Login
1. Open [http://localhost:5173](http://localhost:5173)
2. Click **Login** in the navbar → switch to **Sign Up**
3. Register with any name, email, and password
4. You start with **5 free credits**

#### Step 2: Text-to-Image Generation
1. Navigate to the **Result** page (click "Generate" in the navbar or hero CTA)
2. Type a prompt, e.g.: `A mystical forest library with floating glowing orbs`
3. Select a style (Cinematic, Anime, etc.) and aspect ratio
4. Click **Send** — watch the loading steps
5. **✅ Verify**: An AI-generated image appears, rendered and hosted on Cloudinary's CDN
6. You can download the image or copy its Cloudinary URL

#### Step 3: Background Removal
1. Go to `/remove-bg`
2. Upload any photo with a distinct foreground subject
3. Click **Remove Background**
4. **✅ Verify**: The result is a clean PNG with a transparent background — processed by `cloudinary_ai`

#### Step 4: Photo Enhancement
1. Go to `/enhance`
2. Upload a low-quality or small image
3. Click **Enhance**
4. **✅ Verify**: The result image is visibly sharper, brighter, and upscaled — powered by `e_improve` + `e_upscale`

#### Step 5: Generative Replace (AI Editor)
1. Go to `/ai-editor`
2. Upload a photo (e.g., a photo with a red car)
3. In the **"Replace"** mode:
   - **From**: `red car`
   - **To**: `blue sports car`
4. Click **Apply**
5. **✅ Verify**: The specified object is replaced with the new description — via `e_gen_replace`

#### Step 6: Generative Recolor (AI Editor)
1. Still on `/ai-editor`, switch to **Recolor** mode
2. Upload a photo
3. Enter the **object** to recolor (e.g., `shirt`) and the **target color** (e.g., `purple`)
4. **✅ Verify**: The object's color changes — via `e_gen_recolor`

#### Step 7: Generative Fill / Outpainting
1. Go to `/gen-fill`
2. Upload any photo
3. Select a wider aspect ratio (e.g., `16:9` on a portrait photo)
4. **✅ Verify**: The image is extended with AI-generated content that seamlessly continues the scene — via `b_gen_fill` + `c_pad`

#### Step 8: AI Unblur
1. Go to `/unblur`
2. Upload a blurry photo
3. Select a mode: **Standard**, **Motion**, or **Face**
4. **✅ Verify**: The result is visibly sharper — via layered `e_unsharp_mask` + `e_sharpen` transforms

#### Step 9: Media History
1. Go to `/history`
2. **✅ Verify**: All images from steps 2–8 appear in a gallery, with thumbnails generated on-the-fly by Cloudinary
3. Filter by feature type (Text-to-Image, BG Removal, etc.)
4. Delete an item — confirm it's removed from Cloudinary (can verify in your Cloudinary Media Library dashboard)

#### Step 10: Usage Analytics
1. Go to `/usage`
2. **✅ Verify**: A dashboard shows per-feature credit consumption (e.g., 1 Text-to-Image, 1 BG Removal, etc.)
3. The first load auto-syncs from Cloudinary's Search API if local counters are zero

#### Step 11: Buy Credits (Razorpay Test Mode)
1. Go to `/buycredit`
2. Select any plan (Basic / Advanced / Business)
3. Complete payment with Razorpay **test card**: `4111 1111 1111 1111`, any future expiry, any CVV
4. **✅ Verify**: Credits are added to your account

### Verifying Cloudinary Assets Directly

You can independently verify that Cloudinary is doing real work:

1. Log into your [Cloudinary Console](https://console.cloudinary.com/)
2. Navigate to **Media Library** → you should see folders:
   - `ImaGod/generated/` — AI-generated images
   - `ImaGod/bg-removal/` — Background removal originals
   - `ImaGod/enhance/` — Enhanced image originals
   - `ImaGod/gen-replace/` — Generative replace originals
   - `ImaGod/gen-recolor/` — Recolor originals
   - `ImaGod/gen-fill/` — Outpainting originals
   - `ImaGod/unblur/` — Deblurred originals
3. Each asset should have a **tag** matching the user's MongoDB `_id`
4. Click any asset → check the **Derived Images** tab to see the cached transformations

---

## 📡 API Reference

### Auth & User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/user/register` | ✗ | Create account |
| `POST` | `/api/user/login` | ✗ | Login, receive JWT |
| `GET` | `/api/user/credits` | ✓ | Get credit balance & user info |
| `GET` | `/api/user/usage` | ✓ | Get per-feature usage stats |
| `POST` | `/api/user/pay-razor` | ✓ | Initiate Razorpay order |
| `POST` | `/api/user/verify-razor` | ✓ | Verify payment & add credits |
| `GET` | `/api/user/history` | ✓ | Fetch media history (Cloudinary Search) |
| `POST` | `/api/user/history/delete` | ✓ | Delete a history item |

### Image AI (all require auth)

| Method | Endpoint | Body | Cloudinary Feature |
|---|---|---|---|
| `POST` | `/api/image/generate-image` | `{ prompt }` | Text-to-Image Gen API v2 |
| `POST` | `/api/image/remove-bg` | `FormData: image` | `background_removal: cloudinary_ai` |
| `POST` | `/api/image/enhance` | `FormData: image` | `e_improve` + `e_upscale` |
| `POST` | `/api/image/gen-replace` | `FormData: image, from, to` | `e_gen_replace` |
| `POST` | `/api/image/gen-recolor` | `FormData: image, prompt, color` | `e_gen_recolor` |
| `POST` | `/api/image/gen-fill` | `FormData: image, aspectRatio` | `b_gen_fill` + `c_pad` |
| `POST` | `/api/image/unblur` | `FormData: image, mode` | `e_unsharp_mask` + `e_sharpen` |

---

## 💳 Credits & Monetisation

ImaGod uses a **credit-based pay-per-use** model:

| Plan | Credits | Price (USD) |
|---|---|---|
| Free (on signup) | 5 | $0 |
| Basic | 100 | $10 |
| Advanced | 500 | $50 |
| Business | 5,000 | $250 |

Each AI operation consumes **1 credit**. Credits never expire. Payments are processed via Razorpay (supports test mode for development).

---

## 📄 License

This project was built for a hackathon submission. All rights reserved by the author.

---

<p align="center">
  <b>Built with ❤️ and Cloudinary</b><br/>
  <i>ImaGod — Where every pixel is powered by Cloudinary.</i>
</p>
