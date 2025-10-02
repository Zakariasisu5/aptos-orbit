# 🌍 GlobePayX

**GlobePayX** is a decentralized, multi-currency remittance and payroll platform built on the Aptos blockchain. It enables seamless peer-to-peer payments and payroll processing — all with a modern, human-first Web3 experience.

---

## 🚀 Features

- 🔐 **Authentication & Wallet Connect**
  - Social/email login (mocked)
  - Multi-wallet support: MetaMask, Trust Wallet, Binance, OKX, Coinbase, Petra, Martian, Pontem
  - Auth gating before accessing core features

- 💸 **Send & Receive Money**
  - Stablecoin transfers (USDC, EURC, GHS-stable)
  - QR code generation and copy-to-clipboard
  - Live FX rate preview

<!-- Forex feature removed -->

- 👥 **Payroll Automation**
  - CSV upload or manual entry
  - Batch stablecoin payouts
  - Progress tracker with animated feedback

- 🧾 **Transaction History**
  - Filterable transaction table
  - Explorer links for transparency
  - Audit-ready event logging
  - 

<!-- Treasury feature removed -->

- 🎨 **Human-First UI/UX**
  - Dark mode-first design
  - Animated sponsor and testimonial carousels
  - Background bubbles, glassmorphism, and subtle motion
  - Mobile-first responsiveness

---

## 🧱 Tech Stack

- **Frontend:** React + Vite + TailwindCSS + Zustand
- **Blockchain:** Aptos + Move smart contracts
- **Wallets:** Aptos Wallet Adapter + Web3Modal/RainbowKit
- **Data:** React Query + Axios
- **Animations:** Framer Motion + Lottie
- **Charts:** Recharts

---

## 📦 Project Structure

- `pages/` — Core screens (Dashboard, Send, Receive, Payroll, Transactions)
- `components/` — UI elements, layout, modals, carousels, charts
- `hooks/` — Custom hooks for balances, transactions, FX, payroll
- `store/` — Zustand slices for wallet, UI, settings
- `services/` — Blockchain and API logic
- `styles/` — Tailwind config and theme
- `router.jsx` — Route definitions and auth gating

---

## 🔗 Smart Contract Modules (Move)

- `Remittance.move` — P2P transfers
- `Payroll.move` — Batch payments
<!-- Move modules for Forex and Treasury removed or deprecated -->
- `Audit.move` — Event logging
- `Identity.move` — Optional user mapping
- `Fees.move` — Fee abstraction and sponsorship

---

## 🛠 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-org/globepayx-frontend.git
cd globepayx-frontend

# Install dependencies
npm install

# Start development server
npm run dev
