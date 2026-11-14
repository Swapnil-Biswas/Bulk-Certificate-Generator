<div align="center">

<img src="app/icon.svg" width="88" height="88" alt="CertGen logo">

# CertGen

**Design a certificate once. Generate one for everyone on your list. Let anyone verify it.**

[Live site](https://www.certificategenerator.space) · [How it works](#how-it-works) · [Features](#features) · [Run it locally](#run-it-locally) · [License](#license)

![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?logo=postgresql&logoColor=white)
![Polygon](https://img.shields.io/badge/Polygon-optional%20anchoring-7b3fe4?logo=polygon&logoColor=white)
![License](https://img.shields.io/badge/license-proprietary-critical)

<br>

<img src="docs/screenshots/landing.png" alt="CertGen landing page: One design. Every name. Verifiably real." width="100%">

</div>

---

## Contents

- [What CertGen is](#what-certgen-is)
- [See it in action](#see-it-in-action)
- [How it works](#how-it-works)
- [Features](#features)
  - [The editor](#1-the-editor)
  - [Recipient lists and bulk generation](#2-recipient-lists-and-bulk-generation)
  - [Exporting](#3-exporting)
  - [Verification](#4-verification)
  - [Dashboard, templates and history](#5-dashboard-templates-and-history)
  - [Accounts and the admin panel](#6-accounts-and-the-admin-panel)
  - [Light and dark themes](#7-light-and-dark-themes)
- [How verification works under the hood](#how-verification-works-under-the-hood)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Run it locally](#run-it-locally)
- [Environment variables](#environment-variables)
- [Deploying](#deploying)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Limits](#limits)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What CertGen is

CertGen is a web app for people who have to hand out a lot of certificates: event organisers, course instructors, hackathon teams, HR and community groups.

You bring your own certificate artwork as an image, with the recipient's name left blank. In the editor you place a text box where the name should go, load a list of recipients, and export one finished certificate per person as PNG or PDF. If you add a QR code to the design, every certificate gets its own code that links to a public page confirming the certificate is real and unaltered.

Three things set it apart from a mail-merge:

- **It works on your design.** There is no template language to learn and no layout to rebuild. Any PNG or JPG is a valid starting point.
- **What you see is what you export.** The preview canvas and the exporter share the same rendering code, so the file matches the screen at the image's original resolution.
- **Every certificate is checkable.** Each one is fingerprinted when it is issued. Anyone can scan the QR code or paste the certificate ID to confirm it, with no account needed.

---

## See it in action

Paste a list of names, step through each person's certificate on the canvas, then export the whole batch:

<div align="center">
<img src="docs/screenshots/demo-bulk.gif" alt="Animation: pasting twelve names into the editor, previewing each recipient's certificate, and opening the export menu" width="100%">
</div>

---

## How it works

```mermaid
flowchart LR
    A["🖼️ Upload your design<br/>PNG or JPG, name left blank"] --> B["✏️ Place fields<br/>text, placeholders, QR code"]
    B --> C["📋 Add recipients<br/>CSV, TXT or pasted names"]
    C --> D["📦 Export<br/>ZIP of PDFs or PNGs"]
    D --> E["✅ Verify<br/>scan the QR or paste the ID"]
```

1. **Upload your design.** Export the certificate from Canva, Figma, Illustrator or anything else as an image. Leave blank whatever changes per person.
2. **Place fields.** Add a text field where the name goes and type `{{name}}` into it. Choose the font, size, colour and alignment. Optionally add a QR code.
3. **Add recipients.** Import a CSV or a text file, or paste names straight in. Each column header becomes a placeholder you can use.
4. **Export.** Download every certificate in one ZIP, as PDF or PNG, each file named after its recipient.
5. **Verify.** Recipients, employers and anyone else can confirm a certificate on its public verification page.

---

## Features

### 1. The editor

The editor is a canvas built on [Konva](https://konvajs.org). Your image is the background; fields sit on top of it.

<img src="docs/screenshots/editor-design.png" alt="The editor's Design tab with a text field selected, showing font, size, colour, alignment and shrink-to-fit controls" width="100%">

| Control | What it does |
| :--- | :--- |
| **Background** | Upload or replace the certificate image (PNG or JPG, up to 12 MB). The image's pixel size is shown underneath. |
| **Text field** | A box whose content can be fixed text, a placeholder such as `{{name}}`, or a mix like `Awarded to {{name}}`. |
| **QR code field** | Reserves a square for the verification QR code. Each exported certificate gets its own code. |
| **Font** | 25 bundled typefaces, from clean sans-serifs (Inter, Poppins, Montserrat) to scripts (Great Vibes, Allura, Pacifico) and display serifs (Playfair Display, Cinzel). They are self-hosted, so exports don't depend on a font CDN. |
| **Maximum size, colour, alignment** | Standard text styling. Left, centre and right alignment are measured inside the field's box. |
| **Shrink long text to fit** | Keeps text on one line and reduces its size only when it would overflow the box, so "Li Na" and "Maximilian Alexander von Hohenzollern" both look right. Turn it off for a fixed size that wraps. |
| **Zoom and fit** | The canvas fits the window automatically and refits on resize. Zoom in for precise placement. |

Drag a field to move it, drag its side handles to change the box width, and drag a corner to scale the text.

**Keyboard shortcuts**

| Shortcut | Action |
| :--- | :--- |
| `Ctrl/⌘ + S` | Save the template |
| `Ctrl/⌘ + D` | Duplicate the selected field |
| `Delete` / `Backspace` | Remove the selected field |
| `Arrow keys` | Nudge the selected field by 1 px (`Shift` for 10 px) |
| `Ctrl/⌘ + +` / `-` | Zoom in / out |
| `Ctrl/⌘ + 0` | Fit to screen |
| `Esc` | Deselect |

The editor shows a **Saved / Unsaved** indicator next to the template name, and works in both themes:

<img src="docs/screenshots/editor-dark.png" alt="The editor in dark theme, previewing a recipient's certificate" width="100%">

### 2. Recipient lists and bulk generation

Open the **Recipients** tab and either import a file or paste names.

<img src="docs/screenshots/editor-recipients.png" alt="The Recipients tab with twelve names loaded and the third recipient previewed on the canvas" width="100%">

**A CSV with a header row** gives you one placeholder per column:

```csv
name,course,date
Aarav Sharma,Product Design,14 March 2026
Sofia Martinez,Data Analysis,14 March 2026
```

With that list, `{{name}}`, `{{course}}` and `{{date}}` can all be used in text fields.

**A plain list** (a `.txt` file or pasted text, one name per line) fills `{{name}}`:

```text
Aarav Sharma
Sofia Martinez
```

Things worth knowing:

- **Matching is forgiving.** Capital letters and extra spaces are ignored, so `{{ Name }}` fills from a `name` column.
- **Live preview.** Click any row, or use the arrows under the canvas, to see that person's actual certificate before exporting.
- **Missing columns are flagged.** If a placeholder in the design has no matching column, the editor warns you before you export rather than printing `{{course}}` on 400 certificates.
- **One certificate per row**, up to 5,000 rows per batch.

### 3. Exporting

<img src="docs/screenshots/editor-export.png" alt="The Export menu offering Export all as PDF, Export all as PNG, Download PDF and Download PNG" width="100%">

| Option | Result |
| :--- | :--- |
| **Export all as PDF / PNG** | One ZIP containing a file per recipient, named after them. |
| **Download PDF / PNG** | Only the certificate currently on the canvas. |

- **Rendered in your browser.** Certificates are drawn on your own machine, at the background image's original pixel size. Upload at the resolution you want to print: 2000–3500 px wide suits most A4 and Letter certificates.
- **Safe file names.** Two people with the same name get numbered files so neither is overwritten, and non-English names are kept as written.
- **Progress and cancel.** A progress dialog shows how far the batch has got, and you can stop it.
- **No silent failures.** If the batch can't be recorded on the server, the export stops with a clear message instead of producing certificates whose QR codes verify nothing.

### 4. Verification

Add a QR code field to the design and every exported certificate carries a unique code that opens its verification page. Bulk exports always create verification records, with or without a QR code.

<img src="docs/screenshots/verify.png" alt="Public verification page reading 'This certificate is authentic' with the recipient's name, certificate ID and the checks performed" width="100%">

The page is public and needs no account. It shows who the certificate was issued to, which template and date, and the result of each check:

| Check | Meaning |
| :--- | :--- |
| **Details unchanged** | The recipient details on record still produce the SHA-256 fingerprint taken when the certificate was issued. |
| **Part of the issued batch** | That fingerprint is included in the batch's Merkle root. |
| **Anchored on Polygon** | The batch's Merkle root is recorded on the Polygon blockchain. This appears only when the operator has configured on-chain anchoring; the first two checks apply either way. |

A certificate can come back as **authentic**, **revoked** (issued, but later marked invalid) or **could not be verified** (the record no longer matches its fingerprint). An unknown ID gets a plain "no certificate with this ID" page with a box to try another.

People can also paste a certificate ID on the home page, and signed-in users have a lookup under **Verification** in the dashboard.

### 5. Dashboard, templates and history

**Overview** shows totals for certificates generated, batches, saved templates and verifiable certificates, plus your recent batches and templates.

<img src="docs/screenshots/dashboard-light.png" alt="Dashboard overview with totals, recent batches and saved templates" width="100%">

**Templates** stores each design with its background and fields so you can reuse it for the next cohort. Templates can be filtered by category (Participation, Achievement, Workshop, Appreciation, Custom), searched, duplicated and deleted.

<img src="docs/screenshots/templates.png" alt="Templates page with four saved certificate designs" width="100%">

**History** lists every batch you have exported with its format, size and status.

<img src="docs/screenshots/history.png" alt="History page listing exported batches" width="100%">

Open a batch to see its fingerprint, every recipient in it, and a verification link for each certificate:

<img src="docs/screenshots/history-batch.png" alt="A batch's detail page showing its Merkle root fingerprint and a verify link for every certificate" width="100%">

### 6. Accounts and the admin panel

New accounts are reviewed before they can use the app. This keeps a public deployment from being used by strangers to issue "verified" certificates.

```mermaid
stateDiagram-v2
    [*] --> Registered: Sign up (email + password, or Google)
    Registered --> EmailConfirmed: Click the link in the confirmation email
    EmailConfirmed --> Approved: Administrator approves
    EmailConfirmed --> Rejected: Administrator rejects
    Approved --> Blocked: Administrator blocks
    Blocked --> Approved: Administrator restores
    Approved --> [*]: Can sign in and generate
```

<img src="docs/screenshots/login.png" alt="Login page with email, password and Google sign-in" width="100%">

- **Email and password** sign-up with a confirmation email (link valid for 24 hours). Passwords must be at least 8 characters and are stored as bcrypt hashes.
- **Google sign-in.** Google has already confirmed the address, so those accounts skip the email step, but still wait for approval.
- **Password reset** by email (link valid for 1 hour).
- **Sessions** are signed JWTs. Middleware protects `/dashboard` and `/admin`, and redirects accounts that are not yet approved back to the login page with an explanation.

Administrators get a panel at `/admin`:

<img src="docs/screenshots/admin.png" alt="Admin panel listing users with their approval status, email status, certificate counts and Approve / Reject actions" width="100%">

From here an administrator can approve or reject sign-ups, block and restore accounts, change roles, mark an email address as confirmed, resend the confirmation email, and delete accounts. The list can be filtered by status and searched. The panel refuses to demote, block or delete the last remaining administrator, so you can't lock yourself out.

### 7. Light and dark themes

The dashboard, editor and admin panel support light, dark and "follow my system". Switching themes sweeps the new one out from the button you pressed, using the browser's View Transitions API. Browsers without it get a short cross-fade, and devices set to reduce motion get an instant swap.

<div align="center">
<img src="docs/screenshots/demo-theme.gif" alt="Animation: the dashboard switching from light to dark and back with a circular reveal" width="100%">
</div>

---

## How verification works under the hood

Verification rests on two ideas: a **fingerprint** for each certificate, and a **Merkle tree** that ties every fingerprint in a batch to a single value.

```mermaid
sequenceDiagram
    autonumber
    participant E as Editor (browser)
    participant S as Server
    participant D as Database
    participant P as Polygon (optional)
    participant V as Anyone verifying

    E->>S: Export batch (recipient rows)
    S->>S: Give each row an ID and SHA-256 hash
    S->>S: Build a Merkle tree, compute the root and a proof per certificate
    S->>D: Store batch, root, and each certificate with its hash and proof
    S-->>E: Certificate IDs, in row order
    E->>E: Render each certificate with a QR code for its ID
    S-)P: anchorBatch(root) in the background
    P--)S: Transaction hash, saved on the batch
    V->>S: Open /verify/{id}
    S->>D: Load the certificate and its batch
    S->>S: Recompute the hash, check the Merkle proof against the root
    S->>P: isAnchored(root), if the batch was anchored
    S-->>V: Authentic, revoked, or could not be verified
```

**At issue time** ([`app/api/history/route.ts`](app/api/history/route.ts))

1. Each recipient row gets a random certificate ID.
2. The server computes `SHA-256(id + JSON of the row)`. That hash is the certificate's fingerprint.
3. All fingerprints in the batch go into a Merkle tree. The tree's root is a single hash that depends on every certificate in the batch.
4. The batch, its root, and every certificate with its fingerprint and Merkle proof are stored in one database transaction.
5. If on-chain credentials are configured, the root is sent to the `CertGenRegistry` contract in the background and the transaction hash is saved on the batch.

**At verification time** ([`app/verify/[id]/page.tsx`](app/verify/%5Bid%5D/page.tsx))

1. The stored details are hashed again and compared with the fingerprint. Any edit to the record changes the hash.
2. The certificate's Merkle proof is checked against the batch root, proving it belongs to that batch.
3. If the batch was anchored, the contract is asked whether that root is on-chain.

### The smart contract

[`contracts/CertGenRegistry.sol`](contracts/CertGenRegistry.sol) is a small registry:

| Function | Purpose |
| :--- | :--- |
| `anchorBatch(bytes32 root, string batchURI)` | Records a Merkle root with the block timestamp. Only the contract's admin can call it, and a root can be anchored once. |
| `isAnchored(bytes32 root)` | Returns whether the root is recorded, when, and its batch reference. Anyone can call it. |
| `transferOwnership(address newAdmin)` | Hands the admin role to another address. |

Only the 32-byte root goes on-chain, never names or other personal details. One transaction covers a whole batch, whether it holds 5 certificates or 5,000.

> [!NOTE]
> **On-chain anchoring is optional.** Without the three `POLYGON_*` variables, CertGen skips it and verification relies on the fingerprint and Merkle checks against the database. That still detects any change to an individual record, but it relies on trusting the operator's database. Anchoring adds a public, timestamped record that the operator cannot quietly rewrite.

---

## Architecture

```mermaid
flowchart TB
    subgraph Browser
        UI["Next.js pages<br/>React 19 + Tailwind CSS"]
        Canvas["Editor canvas<br/>Konva"]
        Export["Exporter<br/>jsPDF + JSZip + qrcode"]
    end

    subgraph Server["Next.js server"]
        MW["Middleware<br/>session + approval checks"]
        API["Route handlers<br/>/api/*"]
        Auth["NextAuth<br/>credentials + Google"]
        Verify["/verify/[id]<br/>server-rendered"]
    end

    DB[("PostgreSQL<br/>via Prisma")]
    Mail["Resend<br/>transactional email"]
    Chain["Polygon<br/>CertGenRegistry"]

    UI --> MW --> API
    Canvas --> Export
    Export -->|"record batch"| API
    API --> DB
    Auth --> DB
    Verify --> DB
    API --> Mail
    API -.->|"optional"| Chain
    Verify -.->|"optional"| Chain
```

A few design decisions explain the shape:

- **Rendering happens in the browser.** The server never draws a certificate. That keeps the server small and means your artwork is only uploaded when you save a template.
- **One rendering path.** [`lib/editor/certificate.ts`](lib/editor/certificate.ts) holds the shared logic for the on-screen canvas and the exporter, which is why the preview matches the file.
- **Positions are stored in image pixels.** Fields are saved relative to the background's own size, so a template looks the same at any zoom level or screen size.
- **Template backgrounds are stored with the template** in the database, so a saved template opens anywhere without a separate file store.

### Data model

```mermaid
erDiagram
    User ||--o{ CertificateTemplate : owns
    User ||--o{ CertificateBatch : exports
    CertificateBatch ||--o{ Certificate : contains
    User ||--o{ Account : "signs in with"

    User {
        string id PK
        string email UK
        string role "ADMIN | MEMBER"
        string approvalStatus "PENDING | APPROVED | REJECTED | BLOCKED"
        datetime emailVerified
    }
    CertificateTemplate {
        string id PK
        string name
        string category
        string imagePath "background image"
        json fields "text and QR fields"
        json canvasMeta
    }
    CertificateBatch {
        string id PK
        string name
        int count
        string format "PNG | PDF"
        string merkleRoot
        string transactionHash "set when anchored"
    }
    Certificate {
        string id PK
        json metadata "the recipient's row"
        string hash UK "SHA-256 fingerprint"
        json merkleProof
        string status "VALID or revoked"
    }
```

The full schema is in [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Tech stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 with the React Compiler, TypeScript |
| **Styling and motion** | Tailwind CSS 4, GSAP, Framer Motion, View Transitions API |
| **Editor** | Konva and react-konva |
| **Export** | jsPDF (PDF), JSZip (archives), qrcode (QR codes), PapaParse (CSV), FileSaver |
| **Fonts** | 25 families self-hosted through Fontsource |
| **Database** | PostgreSQL with Prisma ORM |
| **Authentication** | NextAuth.js (credentials and Google OAuth), bcrypt, Zod validation |
| **Email** | Resend |
| **Verification** | SHA-256 (crypto-js), merkletreejs, ethers.js, Solidity contract on Polygon |
| **Hosting (live site)** | PM2 behind a Cloudflare Tunnel |

---

## Run it locally

### Prerequisites

- **Node.js 20 or newer** (developed on Node 22)
- **PostgreSQL** (any recent version)
- Optional: a [Resend](https://resend.com) API key for emails, Google OAuth credentials for Google sign-in, and a Polygon wallet and deployed contract for on-chain anchoring

### 1. Clone and install

```bash
git clone https://github.com/Swapnil-Biswas/Bulk-Certificate-Generator.git
cd Bulk-Certificate-Generator
npm install
```

### 2. Configure the environment

Create a `.env` file in the project root. The minimum to start is:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/certgen"
NEXTAUTH_SECRET="a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret with `openssl rand -base64 32`. See [Environment variables](#environment-variables) for everything else.

### 3. Create the database tables

```bash
npx prisma db push
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create the first administrator

Every new account waits for an administrator's approval, so the very first administrator has to be promoted by hand. Register through the app, then run this against your database:

```sql
UPDATE "User"
SET role = 'ADMIN', "approvalStatus" = 'APPROVED', "emailVerified" = NOW()
WHERE email = 'you@example.com';
```

Log in, and approve everyone else from `/admin`.

> [!TIP]
> Without a `RESEND_API_KEY`, confirmation emails can't be sent. During local development, confirm accounts from the admin panel with **Mark email as confirmed**.

### Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Environment variables

| Variable | Required | Purpose |
| :--- | :---: | :--- |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign session tokens. |
| `NEXTAUTH_URL` | Yes | Public base URL of the site. Also used to build the links in emails, so it must be the address users actually visit. |
| `AUTH_TRUST_HOST` | Behind a proxy | Set to `true` when the app runs behind a reverse proxy or tunnel. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | For Google sign-in | OAuth credentials from Google Cloud. The redirect URI is `{NEXTAUTH_URL}/api/auth/callback/google`. |
| `RESEND_API_KEY` | For email | Sends confirmation, password-reset and contact-form emails. |
| `EMAIL_FROM` | No | Sender shown on emails, for example `CertGen <noreply@mail.example.com>`. The domain must be verified in the Resend account that owns the API key. |
| `CONTACT_EMAIL` | No | Where contact-form messages go. When unset, they go to every administrator. |
| `POLYGON_RPC_URL` | For anchoring | RPC endpoint. Defaults to the Polygon Amoy testnet. |
| `POLYGON_PRIVATE_KEY` | For anchoring | Key of the wallet that deployed `CertGenRegistry`. It pays the gas for each anchored batch. |
| `POLYGON_CONTRACT_ADDRESS` | For anchoring | Address of the deployed `CertGenRegistry` contract. |

> [!WARNING]
> Never commit `.env`. It is already listed in `.gitignore`. Keep `POLYGON_PRIVATE_KEY` in a wallet used only for this purpose and holding only enough funds for gas.

### Enabling on-chain anchoring

1. Deploy [`contracts/CertGenRegistry.sol`](contracts/CertGenRegistry.sol) to Polygon (Amoy testnet or mainnet) with any Solidity toolchain, for example [Remix](https://remix.ethereum.org). The deploying wallet becomes the contract's admin.
2. Set `POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY` and `POLYGON_CONTRACT_ADDRESS`.
3. Restart the app. New bulk batches are anchored in the background, and their verification pages gain the "Anchored on Polygon" check.

---

## Deploying

CertGen is a standard Next.js app and runs anywhere Node.js and PostgreSQL are available.

```bash
npm ci
npx prisma db push
npm run build
npm run start        # listens on port 3000
```

The live site runs the production build under [PM2](https://pm2.keymetrics.io) and is published through a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/):

```bash
pm2 start npm --name certgen -- start
pm2 save
```

Before going live, check that:

- `NEXTAUTH_URL` is the public address, otherwise email links point to the wrong place.
- The sending domain in `EMAIL_FROM` is verified in Resend.
- The Google OAuth client lists the production redirect URI.
- At least one administrator account exists.

---

## Project structure

```text
.
├── app/
│   ├── page.tsx                  Landing page
│   ├── login, register, reset-password, verify-email
│   ├── dashboard/                Signed-in area
│   │   ├── page.tsx              Overview
│   │   ├── certificates/         The editor
│   │   ├── templates/            Saved designs
│   │   ├── history/              Batches and their certificates
│   │   ├── verification/         Certificate lookup
│   │   └── settings/             Profile, appearance, password
│   ├── admin/                    User management (administrators only)
│   ├── verify/[id]/              Public verification page
│   ├── platform/, resources/, legal/, contact/   Marketing and help pages
│   └── api/                      Route handlers
├── components/
│   ├── editor/                   The certificate editor
│   ├── landing/                  Marketing site sections
│   ├── auth/                     Shared login and sign-up UI
│   ├── logo.tsx                  The CertGen mark
│   └── theme-provider.tsx        Theme state and the switch animation
├── lib/
│   ├── editor/certificate.ts     Shared rendering for canvas and export
│   ├── auth/                     NextAuth configuration and session helpers
│   ├── blockchain/polygon.ts     Anchoring and on-chain lookup
│   ├── utils/crypto.ts           SHA-256 and Merkle tree helpers
│   ├── email/                    Resend client and email templates
│   └── templates.ts              Template validation
├── contracts/CertGenRegistry.sol Merkle root registry
├── prisma/schema.prisma          Database schema
├── middleware.ts                 Route protection
└── docs/screenshots/             Images used in this README
```

---

## API reference

All routes live under `/api`. Unless noted, they require a signed-in, approved account.

| Method | Route | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Create an account and send the confirmation email. Public. |
| `GET` `POST` | `/api/auth/[...nextauth]` | NextAuth sign-in, sign-out, session and OAuth callbacks. Public. |
| `POST` | `/api/auth/forgot-password` | Email a password-reset link. Public. |
| `POST` | `/api/auth/reset-password` | Set a new password using a reset token. Public. |
| `POST` | `/api/auth/resend-verification` | Send a fresh confirmation email. Public. |
| `POST` | `/api/contact` | Deliver a contact-form message. Public. |
| `GET` `POST` | `/api/templates` | List your templates, or save a new one. |
| `GET` `PATCH` `DELETE` | `/api/templates/[id]` | Read, update or delete a template. |
| `GET` | `/api/templates/[id]/image` | A template's background image. |
| `POST` | `/api/templates/[id]/duplicate` | Copy a template. |
| `POST` | `/api/history` | Record an export. For a bulk export this creates the fingerprints, the Merkle tree and the verification records. |
| `PATCH` `DELETE` | `/api/admin/users/[id]` | Approve, reject, block, change role, confirm email, or delete a user. Administrators only. |

---

## Limits

| Limit | Value |
| :--- | :--- |
| Recipients per batch | 5,000 |
| Background image | PNG or JPG, up to 12 MB |
| Fields per template | 200 |
| Email confirmation link | Valid for 24 hours |
| Password reset link | Valid for 1 hour |
| Password length | 8 to 128 characters |

---

## Troubleshooting

<details>
<summary><b>The name is cut off or too small</b></summary>

Widen the text box with its side handles. With "Shrink long text to fit" on, a wider box lets long names stay larger.
</details>

<details>
<summary><b>A placeholder shows as <code>{{name}}</code> in the export</b></summary>

No column in your list matches it. Check the header row of your CSV, or use the placeholder buttons in the Recipients tab to insert the exact name.
</details>

<details>
<summary><b>A template opens without its background</b></summary>

Templates saved with an early version of the editor did not store the image. Upload the background again and save; the fields stay in place.
</details>

<details>
<summary><b>Confirmation or reset emails never arrive</b></summary>

Check the spam folder first. If nothing is being sent at all, the usual cause is that the domain in <code>EMAIL_FROM</code> is not verified in the Resend account that owns <code>RESEND_API_KEY</code>. In the meantime, an administrator can confirm an account from the admin panel.
</details>

<details>
<summary><b>"Your account is waiting for approval" at login</b></summary>

An administrator has to approve each new account at <code>/admin</code>. On a fresh install, promote the first administrator by hand as described in <a href="#5-create-the-first-administrator">Create the first administrator</a>.
</details>

<details>
<summary><b>The verification page doesn't show "Anchored on Polygon"</b></summary>

Anchoring only happens when all three <code>POLYGON_*</code> variables are set and the wallet has funds for gas. Batches exported before that are not anchored retroactively. The other two checks still apply.
</details>

<details>
<summary><b>A large export seems stuck</b></summary>

Certificates are rendered in your browser, so a few thousand high-resolution files can take a minute or two. Keep the tab open and in the foreground until the download starts.
</details>

---

## License

**CertGen is proprietary software. Copyright © 2026 Swapnil Biswas. All rights reserved.**

The source is published so it can be read and evaluated. You may not copy, modify, redistribute, host or sell it, in whole or in part, without written permission. The full terms are in [`LICENSE`](LICENSE).

- The smart contract [`contracts/CertGenRegistry.sol`](contracts/CertGenRegistry.sol) is released separately under the **MIT License**, as marked in the file.
- CertGen is built on open-source software. Those packages remain under their own licenses, listed in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
- The sample certificates and names in the screenshots are fictional demo data.

For licensing questions, use the [contact form](https://www.certificategenerator.space/contact).

<div align="center">
<br>
<img src="app/icon.svg" width="36" height="36" alt="">

Made by Swapnil 🙂
</div>
