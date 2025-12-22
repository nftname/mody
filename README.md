# 🌟 NNM Market - Premium NFT Marketplace

> **The world's first decentralized exchange for Visual Identity Assets on Polygon**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=nextdotjs)](https://nextjs.org/)
[![Polygon](https://img.shields.io/badge/Polygon-mainnet-purple?style=flat&logo=polygon)](https://polygon.technology/)
[![Web3Modal](https://img.shields.io/badge/Web3Modal-v4-blue?style=flat&logo=web3.js)](https://web3modal.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

--- 

## 📋 Table of Contents 

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**NNM Market** is a revolutionary Web3 platform that enables users to mint, trade, and own sovereign visual identity NFTs on the Polygon blockchain. Our marketplace empowers individuals and brands to secure their digital identities as immutable, tradeable assets.

### Why NNM Market? 

✨ **Immutable Ownership** - Your visual identity is permanently recorded on the blockchain  
🚀 **Low Gas Fees** - Built on Polygon for affordable transactions  
🔐 **True Decentralization** - No central authority, just smart contracts  
💎 **Premium Assets** - Limited, exclusive digital identity tokens  
🌍 **Global Accessibility** - Available to anyone with a Web3 wallet  

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: Bootstrap 5.3 + Custom CSS
- **Charts**: [Chart.js](https://www.chartjs.org/) + [Recharts](https://recharts.org/)

### Web3 & Blockchain
- **Wallet Integration**: [Web3Modal v4](https://web3modal.com/) - Multi-chain wallet connector
- **Smart Contract Interaction**: [Ethers.js v6](https://docs.ethers.org/) - Web3 library
- **Blockchain**: [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- **Network**: [Polygon](https://polygon.technology/) - L2 scaling solution

### Storage & Backend
- **IPFS Gateway**: [Pinata](https://www.pinata.cloud/) - Decentralized file storage
- **API Routes**: Next.js API routes for backend logic

### Development Tools
- **Linting**: ESLint 8
- **Package Manager**: npm
- **Build System**: Webpack (Next.js 16)

---

## ✨ Features

### 🪙 NFT Minting System
- **Three Tier Classes**: Immortal, Elite, Founders
- **Instant Verification**: Check name availability in real-time
- **Smart Contract Integration**: Direct blockchain transactions
- **Transaction Tracking**: Multi-step minting process with status updates

### 🔐 Web3 Authentication
- **Multi-Wallet Support**: MetaMask, Trust Wallet, Uniswap Wallet, and more
- **Network Detection**: Automatic Polygon mainnet switching
- **Session Management**: Wagmi-powered wallet state management
- **Account Abstraction Ready**: Compatible with modern wallet standards

### 📊 Dashboard & Analytics
- **Market Ticker**: Real-time NFT market statistics
- **Asset Gallery**: Browse all listed NFT identities
- **Price Charts**: Interactive charts for market trends
- **Individual Asset Pages**: Detailed asset information with bidding system

### 🛒 Trading Features
- **Buy/Sell Listings**: Direct peer-to-peer marketplace
- **Bidding System**: Place offers on assets you're interested in
- **Balance Management**: Real-time wallet balance display
- **Transaction History**: Track all your marketplace activity

### 🎨 Premium UI/UX
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Eye-friendly interface optimized for Web3
- **Smooth Animations**: Fade-in effects and hover states
- **Accessibility**: WCAG-compliant components

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or higher
- **npm** 9+ or yarn
- **MetaMask** or compatible Web3 wallet
- **PINATA_JWT** for IPFS operations

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nftname/NNM-MARKET.git
cd NNM-MARKET
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
# Pinata API Configuration
PINATA_JWT=your_pinata_jwt_here
NEXT_PUBLIC_GATEWAY_URL=https://your-gateway.mypinata.cloud
NEXT_PUBLIC_PINATA_GATEWAY=https://your-gateway.mypinata.cloud
```

4. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

The production build will be optimized with:
- Static site generation (SSG) where possible
- Server-side rendering (SSR) for dynamic routes
- Image optimization
- Code splitting

---

## 📁 Project Structure

```
NNM-MARKET/
├── src/
│   ├── app/
│   │   ├── api/                 # Backend API routes
│   │   │   ├── mint-prep/       # NFT preparation endpoint
│   │   │   └── ngx/             # NGX widget endpoint
│   │   ├── asset/[id]/          # Individual asset pages
│   │   ├── dashboard/           # User dashboard
│   │   ├── explore.css          # Explore page styles
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout with SEO
│   │   ├── market/              # Marketplace page
│   │   ├── mint/                # NFT minting page
│   │   ├── ngx/                 # NGX page
│   │   ├── page.tsx             # Home page
│   │   └── style.css            # App styles
│   ├── components/              # Reusable React components
│   │   ├── Footer.tsx           # Footer component
│   │   ├── LegalModal.tsx       # Legal terms modal
│   │   ├── MarketTicker.tsx     # Market statistics ticker
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── NGXWidget.tsx        # NGX widget component
│   │   ├── SupportBot.tsx       # Support chatbot
│   │   └── Web3ModalProvider.tsx # Web3Modal setup
│   ├── context/
│   │   └── Web3Modal.tsx        # Web3 context configuration
│   ├── data/
│   │   └── assets.ts            # Mock asset database
│   ├── lib/
│   │   └── ngx-engine.ts        # NGX engine utilities
│   └── types/
│       └── ethereum.ts          # Ethereum provider types
├── public/                      # Static assets
│   └── favicon.svg              # Site icon
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── .env.local                   # Environment variables (git-ignored)
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

---

## 💻 Development

### Available Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Type checking
npx tsc --noEmit
```

### Key Configuration Files

**next.config.js** - Webpack configuration for Web3 polyfills
- Handles `pino-pretty`, `lokijs`, `encoding` libraries
- Configures Node.js module fallbacks
- Optimized for Polygon/Web3 development

**tsconfig.json** - TypeScript strict mode enabled
- Path aliases configured (`@/*` for `src/*`)
- React 18 JSX support

**package.json** - Latest dependencies
- Next.js 16 with experimental webpack support
- Wagmi 2.x with latest provider support
- Ethers.js v6 for smart contract interactions

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com/)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
vercel env add PINATA_JWT
vercel env add NEXT_PUBLIC_GATEWAY_URL
vercel env add NEXT_PUBLIC_PINATA_GATEWAY
```

### Self-Hosted (Docker)

```bash
# Build Docker image
docker build -t nnm-market .

# Run container
docker run -p 3000:3000 \
  -e PINATA_JWT=$PINATA_JWT \
  -e NEXT_PUBLIC_GATEWAY_URL=$GATEWAY_URL \
  nnm-market
```

### Environment Variables for Production

```env
# Pinata Configuration
PINATA_JWT=your_production_jwt
NEXT_PUBLIC_GATEWAY_URL=https://production-gateway.mypinata.cloud
NEXT_PUBLIC_PINATA_GATEWAY=https://production-gateway.mypinata.cloud

# Optional
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Coding Standards

- Follow ESLint configuration
- Use TypeScript for type safety
- Components should be functional (React hooks)
- Document complex logic with comments
- Test on Polygon Mumbai testnet before mainnet

---

## 📋 Security

⚠️ **Important**: Never commit private keys, JWT tokens, or API keys!

- Use `.env.local` for sensitive data (git-ignored)
- Always use environment variables for secrets
- Enable contract verification on PolygonScan
- Regular security audits recommended for production

---

## 🐛 Troubleshooting

### "wallet_switchEthereumChain" Error
Ensure MetaMask is connected to Polygon mainnet. The app will automatically prompt to switch networks.

### IPFS Upload Fails
- Verify Pinata JWT is valid
- Check gateway URL is accessible
- Ensure rate limits haven't been exceeded

### Build Errors with webpack
Run with explicit webpack flag:
```bash
npm run build -- --webpack
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethers.js v6](https://docs.ethers.org/v6/)
- [Web3Modal v4](https://web3modal.com/)
- [Polygon Docs](https://polygon.technology/developers)
- [Pinata IPFS](https://www.pinata.cloud/)
- [Solidity Smart Contracts](https://solidity-by-example.org/)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Support

Have questions or found a bug?

- 📧 **Email**: support@nnm.market
- 🐦 **Twitter**: [@NNMMarket](https://twitter.com/NNMMarket)
- 💬 **Discord**: [Join Community](https://discord.gg/nnm)
- 🐛 **Issues**: [GitHub Issues](https://github.com/nftname/NNM-MARKET/issues)

---

## 👨‍💻 Team

**NNM Market** is built with ❤️ by the NNM Team

---

<div align="center">

**[⬆ Back to Top](#-nnm-market---premium-nft-marketplace)**

Made with 🚀 for Web3

</div>


NNM-MARKET/
├── src/
│   ├── app/
│   │   ├── api/                 # (Backend API routes)
│   │   │   ├── mint-prep/
│   │   │   │   └── route.ts     # 🔥 (معدل جذرياً) "مصنع الصور الذهبية" - هنا يتم رسم الـ SVG وتحويله لـ Buffer ورفعه مباشرة لـ Pinata
│   │   │   └── ngx/             # NGX widget endpoint
│   │   ├── asset/
│   │   │   └── [id]/            # 🎯 (الصفحة الديناميكية) هنا يتم عرض الكرت الفردي بناءً على رقمه في الرابط
│   │   ├── dashboard/
│   │   │   └── page.tsx         # 🚀 (جديد/معدل) "لوحة التحكم/المعرض" - يحتوي على المحرك الذي يمسح البلوك تشين ويجلب كروت المستخدم
│   │   ├── market/              # Marketplace page
│   │   ├── mint/
│   │   │   └── page.tsx         # ⚙️ (معدل) صفحة الصك - تحتوي على ذكاء "الأدمن" (النقطة الخضراء) ومنطق الدفع للعقد
│   │   ├── ngx/                 # NGX page
│   │   ├── page.tsx             # Home page (الصفحة الرئيسية)
│   │   ├── globals.css          # Global styles
│   │   └── layout.tsx           # Root layout
│   ├── components/              # (المكونات القابلة لإعادة الاستخدام)
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ... (وبقية المكونات المذكورة في الـ README)
│   ├── data/
│   │   ├── abi.json             # 🔑 (أساسي) "الخريطة" التي نستخدمها للتحدث مع عقدك الذكي
│   │   └── config.ts            # ⚙️ (أساسي) ملف الإعدادات (عناوين العقود، الروابط)
│   ├── lib/
│   │   └── ngx-engine.ts        # (المحرك الصاروخ الأصلي) NGX engine utilities
│   └── types/
│       └── ...
├── public/                      # Static assets
├── .env.local                   # 🤫 ملف المفاتيح السرية (Pinata JWT وغيرها)
├── next.config.js               # إعدادات السيرفر
├── package.json                 # قائمة المكتبات
└── README.md                    # ملف الشرح الأصلي

ملخص التحديثات في الخريطة:
​src/app/api/mint-prep/route.ts: أصبح هو القلب النابض لإنشاء الصور الذهبية ورفعها بشكل صحيح (Buffer) لتظهر في المحفظة.
​src/app/dashboard/page.tsx: تم تفعيله ليصبح "المحرك" الذي يقرأ من العقد الذكي مباشرة ويعرض ممتلكات المستخدم.
​src/app/mint/page.tsx: تم تطويره ليتعرف على الأدمن ويتعامل مع مدفوعات العقد بذكاء.
​src/app/asset/[id]/: تأكدنا أنه هو المسار الصحيح للصفحة الديناميكية المستقبلية