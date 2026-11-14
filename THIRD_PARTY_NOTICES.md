# Third-party notices

CertGen itself is proprietary (see [LICENSE](LICENSE)). It is built with the third-party software listed below, each of which remains under its own license. This list covers the packages CertGen depends on directly; their own dependencies are listed in `package-lock.json`, and every installed package carries its license text in `node_modules/<package>/`.

Versions are those installed when this file was generated.

## Runtime dependencies

| Package | Version | License |
| :--- | :--- | :--- |
| `@gsap/react` | 2.1.2 | [GSAP Standard License](https://gsap.com/standard-license) (no charge) |
| `@next-auth/prisma-adapter` | 1.0.7 | ISC |
| `@prisma/client` | 6.9.0 | Apache-2.0 |
| `bcrypt` | 6.0.0 | MIT |
| `crypto-js` | 4.2.0 | MIT |
| `ethers` | 6.16.0 | MIT |
| `file-saver` | 2.0.5 | MIT |
| `framer-motion` | 12.40.0 | MIT |
| `gsap` | 3.15.1 | [GSAP Standard License](https://gsap.com/standard-license) (no charge) |
| `jspdf` | 4.2.1 | MIT |
| `jszip` | 3.10.1 | (MIT OR GPL-3.0-or-later) |
| `konva` | 10.3.0 | MIT |
| `lucide-react` | 1.16.0 | ISC |
| `merkletreejs` | 0.6.0 | MIT |
| `next` | 16.2.6 | MIT |
| `next-auth` | 4.24.14 | ISC |
| `papaparse` | 5.5.3 | MIT |
| `prisma` | 6.9.0 | Apache-2.0 |
| `qrcode` | 1.5.4 | MIT |
| `react` | 19.2.4 | MIT |
| `react-dom` | 19.2.4 | MIT |
| `react-dropzone` | 15.0.0 | MIT |
| `react-konva` | 19.2.4 | MIT |
| `resend` | 6.12.3 | MIT |
| `use-image` | 1.1.4 | MIT |
| `zod` | 4.4.3 | MIT |

## Development dependencies

| Package | Version | License |
| :--- | :--- | :--- |
| `@tailwindcss/postcss` | 4.3.0 | MIT |
| `@types/bcrypt` | 6.0.0 | MIT |
| `@types/crypto-js` | 4.2.2 | MIT |
| `@types/file-saver` | 2.0.7 | MIT |
| `@types/node` | 20.19.41 | MIT |
| `@types/papaparse` | 5.5.2 | MIT |
| `@types/qrcode` | 1.5.6 | MIT |
| `@types/react` | 19.2.15 | MIT |
| `@types/react-dom` | 19.2.3 | MIT |
| `babel-plugin-react-compiler` | 1.0.0 | MIT |
| `eslint` | 9.39.4 | MIT |
| `eslint-config-next` | 16.2.6 | MIT |
| `tailwindcss` | 4.3.0 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |

## Fonts

The typefaces offered in the editor are self-hosted through [Fontsource](https://fontsource.org). Inter, Instrument Serif and JetBrains Mono (the interface fonts) are loaded through `next/font` and are also under the SIL Open Font License 1.1.

| Font | Package | License |
| :--- | :--- | :--- |
| abril-fatface | `@fontsource/abril-fatface` | OFL-1.1 |
| alex-brush | `@fontsource/alex-brush` | OFL-1.1 |
| allura | `@fontsource/allura` | OFL-1.1 |
| bebas-neue | `@fontsource/bebas-neue` | OFL-1.1 |
| cinzel | `@fontsource/cinzel` | OFL-1.1 |
| cormorant-garamond | `@fontsource/cormorant-garamond` | OFL-1.1 |
| courgette | `@fontsource/courgette` | OFL-1.1 |
| dancing-script | `@fontsource/dancing-script` | OFL-1.1 |
| great-vibes | `@fontsource/great-vibes` | OFL-1.1 |
| josefin-sans | `@fontsource/josefin-sans` | OFL-1.1 |
| kaushan-script | `@fontsource/kaushan-script` | OFL-1.1 |
| lobster | `@fontsource/lobster` | OFL-1.1 |
| lora | `@fontsource/lora` | OFL-1.1 |
| marck-script | `@fontsource/marck-script` | OFL-1.1 |
| merriweather | `@fontsource/merriweather` | OFL-1.1 |
| montserrat | `@fontsource/montserrat` | OFL-1.1 |
| oswald | `@fontsource/oswald` | OFL-1.1 |
| pacifico | `@fontsource/pacifico` | OFL-1.1 |
| parisienne | `@fontsource/parisienne` | OFL-1.1 |
| playfair-display | `@fontsource/playfair-display` | OFL-1.1 |
| poppins | `@fontsource/poppins` | OFL-1.1 |
| raleway | `@fontsource/raleway` | OFL-1.1 |
| sacramento | `@fontsource/sacramento` | OFL-1.1 |
| satisfy | `@fontsource/satisfy` | Apache-2.0 |
| tangerine | `@fontsource/tangerine` | OFL-1.1 |

## Notes

- **GSAP** is not under an open-source license. It is used under GreenSock's Standard License, which permits use at no charge.
- **JSZip** is dual-licensed; CertGen uses it under the MIT License.
- **Solidity contract.** `contracts/CertGenRegistry.sol` is original to this project and is released under the MIT License.
