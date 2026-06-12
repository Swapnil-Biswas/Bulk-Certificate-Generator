# CertGen: Enterprise Certificate Synthesis & Verification Engine

CertGen is a high-performance, full-stack Next.js application designed for the professional generation, management, and blockchain-backed verification of digital credentials. It combines a sophisticated canvas-based design studio with cryptographic anchoring on the Polygon network to ensure absolute trust and immutability.

## 🚀 Live Demo
[certificategenerator.space](https://www.certificategenerator.space)

---

## ✨ Core Features

### 🎨 1. High-Performance Studio Editor
*   **Canvas-Based Design:** Powered by `React-Konva`, providing a fluid, desktop-grade design experience.
*   **Dynamic Text Layers:** Support for multiple text fields with customizable typography, colors, and alignments.
*   **Precision Controls:** Drag-and-drop placement, resizing, and property management for every design element.
*   **Font Library:** Integrated with Google Fonts and FontSource for a wide range of professional styles.

### 📦 2. Scalable Bulk Generation
*   **Data Injection:** Generate hundreds of unique certificates instantly by uploading CSV or TXT registries.
*   **Placeholder Protocol:** Use `{{name}}` placeholders in your design to automatically map data from your registry.
*   **Batch Export:** Export your entire batch as high-quality PNG or PDF ZIP archives.

### 🛡️ 3. Blockchain-Backed Verification
*   **Polygon Anchoring:** Every batch is anchored to the Polygon blockchain using Merkle Root technology, providing immutable proof of issuance.
*   **Dynamic QR Codes:** Automatically embed a unique verification QR code into every certificate.
*   **Verification Portal:** A public-facing registry (`/verify/[cert_id]`) where third parties can scan and confirm the authenticity of any credential.
*   **Cryptographic Security:** Uses SHA-256 hashing and Merkle Proofs to detect even the slightest modification to certificate data.

### 🔐 4. Secure Authentication & Admin
*   **Google OAuth:** Seamless sign-in and sign-up using the "Google Auth Engine."
*   **Identity Management:** Full credentials-based auth with password reset and email verification flows.
*   **Command Center:** A robust admin dashboard for managing node entities (users), approving access, and auditing global registry output.
*   **Approval Protocol:** Multi-tier security where all new users require administrative approval before accessing the design studio.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TailwindCSS |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | NextAuth.js (Auth.js), Google OAuth, JWT |
| **Canvas Engine** | Konva.js, React-Konva |
| **Blockchain** | Solidity (Smart Contracts), Ethers.js, Polygon Network |
| **Cryptography** | CryptoJS, MerkleTreeJS |
| **Infrastructure** | PM2, Cloudflare Tunnels, Resend (Email) |

---

## 🛠️ Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/certgen.git
cd certgen
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/certgen"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"

# Email
RESEND_API_KEY="your-resend-key"

# Blockchain (Optional for local)
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"
POLYGON_PRIVATE_KEY="your-private-key"
POLYGON_CONTRACT_ADDRESS="your-contract-address"
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

---

## 📜 Smart Contract
The verification logic is handled by the `CertGenRegistry.sol` contract (found in `/contracts`). It maps Merkle roots to timestamps, ensuring that once a certificate is issued, its record is permanent and unchangeable.

## ⚖️ License
This project is proprietary. © 2026 CERTGEN SYSTEMS INC. All Rights Reserved.
