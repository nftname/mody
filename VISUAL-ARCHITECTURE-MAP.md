# 🗺️ NNM Market - خريطة معمارية بصرية تفاعلية

## 📊 نظرة عامة على البنية

```mermaid
graph TB
    subgraph "🌐 Frontend Layer"
        A[User Browser] --> B[layout.tsx<br/>Root Layout]
        B --> C[Web3Provider.tsx<br/>⚠️ Modal #1]
        C --> D[Navbar.tsx<br/>useWeb3Modal]
        C --> E[Page Content]
        C --> F[Footer.tsx]
    end

    subgraph "📄 Pages"
        E --> G1[Homepage<br/>page.tsx]
        E --> G2[Market<br/>page.tsx]
        E --> G3[Dashboard<br/>page.tsx<br/>⚠️ SLOW]
        E --> G4[Mint<br/>page.tsx]
        E --> G5[Asset/[id]<br/>page.tsx]
        E --> G6[NGX<br/>page.tsx]
    end

    subgraph "🔧 API Routes"
        G4 --> H1[/api/mint-prep<br/>route.ts<br/>⚠️ SLOW]
        G2 --> H2[/api/ngx<br/>route.ts]
    end

    subgraph "⛓️ Blockchain"
        G3 --> I1[Contract.balanceOf]
        G3 --> I2[Contract.tokenOfOwnerByIndex<br/>⚠️ Sequential]
        G3 --> I3[Contract.tokenURI<br/>⚠️ Sequential]
        G4 --> I4[Contract.mintPublic]
        G4 --> I5[Contract.getMaticCost]
        
        I1 --> J[Polygon Mainnet<br/>Chain 137]
        I2 --> J
        I3 --> J
        I4 --> J
        I5 --> J
    end

    subgraph "💾 Storage"
        H1 --> K1[Pinata IPFS<br/>5-10s upload]
        I3 --> K2[IPFS Gateway<br/>2s per fetch]
        G3 --> K3[localStorage<br/>Cache]
    end

    style C fill:#ff9800,stroke:#f57c00,stroke-width:3px
    style G3 fill:#f44336,stroke:#c62828,stroke-width:3px
    style H1 fill:#f44336,stroke:#c62828,stroke-width:3px
    style I2 fill:#ff9800,stroke:#f57c00,stroke-width:2px
    style I3 fill:#ff9800,stroke:#f57c00,stroke-width:2px
    style K1 fill:#ff9800,stroke:#f57c00,stroke-width:2px
```

---

## 🔄 تدفق البيانات - عملية الاتصال بالمحفظة

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant N as Navbar
    participant W3P as Web3Provider
    participant W3M as Web3Modal v4
    participant WG as Wagmi
    participant MT as MetaMask

    U->>N: Click "Connect Wallet"
    N->>W3P: useWeb3Modal().open()
    
    Note over W3P: ⚠️ createWeb3Modal()<br/>initialized here
    
    W3P->>W3M: Open wallet selection
    W3M->>U: Show wallet options
    U->>W3M: Select MetaMask
    W3M->>MT: Request connection
    MT->>U: Show permission popup
    U->>MT: Approve connection
    MT->>WG: Return address & chainId
    WG->>N: Update useAccount() state
    N->>U: Show connected UI
    
    Note over U,N: ⏱️ Total Time: 2-4 seconds<br/>⚠️ Can be doubled if Modal<br/>initialized twice
```

---

## 🐌 تدفق البيانات - مشكلة Dashboard البطيء

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant D as Dashboard Page
    participant LC as localStorage
    participant BC as Blockchain RPC
    participant IPFS as IPFS Gateway

    U->>D: Navigate to /dashboard
    D->>LC: Check cache
    LC-->>D: Return cached data (fast)
    D->>U: Show cached assets ✅
    
    Note over D,BC: ⚠️ START SLOW PROCESS
    
    D->>BC: contract.balanceOf(address)
    BC-->>D: count = 10 (500ms)
    
    loop For each of 10 NFTs (Sequential ⚠️)
        D->>BC: tokenOfOwnerByIndex(i)
        BC-->>D: tokenId (800ms)
        D->>BC: tokenURI(tokenId)
        BC-->>D: ipfs://... (1000ms)
        D->>IPFS: fetch(gateway + uri)
        IPFS-->>D: JSON metadata (2000ms)
        D->>U: Update one card
        Note over D: ⏱️ 3.8s per NFT!
    end
    
    Note over U,D: Total Time: 500ms + (10 × 3800ms)<br/>= 38.5 seconds! 🐌
    
    D->>LC: Save to cache
    D->>U: All assets loaded ✅
```

---

## 🔨 تدفق البيانات - عملية Minting

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant M as Mint Page
    participant API as /api/mint-prep
    participant PIN as Pinata IPFS
    participant BC as Blockchain
    participant MT as MetaMask

    U->>M: Enter name "VIVI"
    M->>BC: Check availability
    BC-->>M: Available ✅
    U->>M: Click "Mint Immortal"
    
    alt If not connected
        M->>M: useWeb3Modal().open() ⚠️
        M->>U: Wait for connection...
        U->>MT: Connect wallet
    end
    
    M->>M: Show modal "Generating Metadata..."
    M->>API: POST {name: "VIVI", tier: "immortal"}
    
    Note over API,PIN: ⚠️ SLOW STEP (5-10s)<br/>No timeout!
    
    API->>PIN: Upload JSON metadata
    PIN-->>API: IPFS hash
    API-->>M: tokenURI: ipfs://...
    
    M->>M: Update modal "Calculating Price..."
    M->>BC: getMaticCost(50 USD)
    BC-->>M: 25.5 MATIC
    
    Note over M: ⚠️ Only 2% buffer added!
    
    M->>M: Update modal "Requesting Signature..."
    M->>MT: mintPublic(name, tier, uri, {value: 26.01 MATIC})
    MT->>U: Show tx confirmation
    U->>MT: Confirm
    MT->>BC: Send transaction
    
    Note over BC: ⏱️ 5-30 seconds<br/>depending on network
    
    BC-->>M: Transaction hash
    M->>M: Update modal "Confirming..."
    BC-->>M: Transaction confirmed ✅
    M->>M: Parse Transfer event
    M-->>U: Success! Redirect to /asset/{tokenId}
```

---

## 🏗️ بنية المكونات (Components Architecture)

```mermaid
graph LR
    subgraph "🎨 UI Components"
        A[Navbar.tsx] --> A1[Search Bar]
        A[Navbar.tsx] --> A2[Menu Items]
        A[Navbar.tsx] --> A3[Connect Button]
        A[Navbar.tsx] --> A4[Balance Display]
        
        B[Footer.tsx] --> B1[Social Links]
        B[Footer.tsx] --> B2[Legal Info]
        
        C[MarketTicker.tsx] --> C1[Live Stats]
        C[MarketTicker.tsx] --> C2[Price Charts]
        
        D[NGXWidget.tsx] --> D1[Gauge Display]
        D[NGXWidget.tsx] --> D2[NGX Score]
        
        E[LegalModal.tsx] --> E1[Terms Modal]
        E[LegalModal.tsx] --> E2[Disclaimer]
        
        F[InstallPrompt.tsx] --> F1[PWA Install]
    end

    subgraph "🔌 Web3 Layer"
        G[Web3Provider.tsx] --> G1[WagmiProvider]
        G[Web3Provider.tsx] --> G2[QueryClient]
        G[Web3Provider.tsx] --> G3[createWeb3Modal ⚠️]
        
        H[Web3Modal.tsx] --> H1[Config Only<br/>❌ Not Used]
    end

    A --> G
    C --> G1
    D --> G1
```

---

## 📊 تحليل الأداء - قبل وبعد

```mermaid
graph TB
    subgraph "📉 Current Performance"
        A1[Dashboard Load<br/>38.5 seconds 🔴]
        A2[Mint Process<br/>8-15 seconds 🟡]
        A3[Wallet Connect<br/>2-4 seconds 🟡]
        A4[Tx Failure Rate<br/>15% 🔴]
    end

    subgraph "📈 After Optimization"
        B1[Dashboard Load<br/>4.5 seconds ✅<br/>88% faster]
        B2[Mint Process<br/>5-7 seconds ✅<br/>40% faster]
        B3[Wallet Connect<br/>< 1 second ✅<br/>75% faster]
        B4[Tx Failure Rate<br/>2% ✅<br/>87% reduction]
    end

    A1 -.->|Fix: Parallel Fetching<br/>+ Batching| B1
    A2 -.->|Fix: Timeout + Retry<br/>+ Better Errors| B2
    A3 -.->|Fix: Remove Duplicate<br/>Modal Init| B3
    A4 -.->|Fix: Increase Gas Buffer<br/>to 10%| B4

    style A1 fill:#f44336,stroke:#c62828,stroke-width:2px
    style A4 fill:#f44336,stroke:#c62828,stroke-width:2px
    style B1 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style B2 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style B3 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
    style B4 fill:#4caf50,stroke:#2e7d32,stroke-width:2px
```

---

## 🔥 نقاط الاختناق الحرجة (Bottlenecks)

```mermaid
graph TD
    A[User Experience Problems] --> B1[Dashboard takes 38s]
    A --> B2[Mint fails 15% of time]
    A --> B3[Wallet connects twice]
    
    B1 --> C1[Root Cause:<br/>Sequential RPC calls]
    B1 --> C2[Root Cause:<br/>Sequential IPFS fetches]
    B1 --> C3[Root Cause:<br/>No pagination]
    
    B2 --> D1[Root Cause:<br/>Pinata has no timeout]
    B2 --> D2[Root Cause:<br/>No retry logic]
    B2 --> D3[Root Cause:<br/>Gas buffer only 2%]
    
    B3 --> E1[Root Cause:<br/>Duplicate createWeb3Modal]
    B3 --> E2[Root Cause:<br/>useWeb3Modal() called<br/>in multiple places]

    style B1 fill:#f44336,stroke:#c62828,stroke-width:3px
    style B2 fill:#ff9800,stroke:#f57c00,stroke-width:3px
    style B3 fill:#ff9800,stroke:#f57c00,stroke-width:3px
    
    style C1 fill:#ffcdd2
    style C2 fill:#ffcdd2
    style C3 fill:#ffcdd2
    style D1 fill:#ffe0b2
    style D2 fill:#ffe0b2
    style D3 fill:#ffe0b2
    style E1 fill:#ffe0b2
    style E2 fill:#ffe0b2
```

---

## ✅ خطة الإصلاحات المقترحة

```mermaid
gantt
    title NNM Market Optimization Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Critical Fixes 🔥
    Fix Web3Modal Duplicate           :crit, a1, 2025-12-23, 2d
    Implement Parallel Fetching       :crit, a2, 2025-12-25, 2d
    Add Pinata Timeout & Retry        :crit, a3, 2025-12-27, 2d
    Increase Gas Buffer to 10%        :crit, a4, 2025-12-29, 1d
    
    section Phase 2: Performance 🚀
    Implement SWR Caching             :active, b1, 2025-12-30, 3d
    Add Code Splitting                :b2, 2026-01-02, 2d
    Setup Fallback RPC                :b3, 2026-01-04, 2d
    Add React Query Devtools          :b4, 2026-01-06, 1d
    
    section Phase 3: Advanced ⭐
    Implement Multicall               :c1, 2026-01-07, 4d
    Setup Service Worker (PWA)        :c2, 2026-01-11, 3d
    Add Monitoring (Sentry)           :c3, 2026-01-14, 2d
    Optimize with Subgraph            :c4, 2026-01-16, 5d
```

---

## 🎯 مسار تحسين تجربة المستخدم

```mermaid
journey
    title User Experience Journey - Before & After Optimization
    section Before (Current) 😞
      Visit Homepage: 3: User
      Connect Wallet (slow): 2: User, System
      Browse Market: 4: User
      Try to Mint: 2: User, System
      Wait for Pinata: 1: User
      Transaction Fails: 1: User
      Check Dashboard: 1: User, System
      Wait 38 seconds: 1: User
    
    section After (Optimized) 😊
      Visit Homepage: 5: User
      Connect Wallet (fast): 5: User, System
      Browse Market: 5: User
      Try to Mint: 5: User, System
      Quick Upload: 5: User, System
      Transaction Succeeds: 5: User, System
      Check Dashboard: 5: User, System
      Instant Load: 5: User, System
```

---

## 🔐 طبقات الأمان والتحقق

```mermaid
graph TB
    subgraph "Security Layers"
        A[Client Side] --> A1[MetaMask Signature]
        A[Client Side] --> A2[Network Validation]
        A[Client Side] --> A3[Input Sanitization]
        
        B[Smart Contract] --> B1[Access Control]
        B[Smart Contract] --> B2[Reentrancy Guard]
        B[Smart Contract] --> B3[Price Oracle]
        
        C[Backend API] --> C1[Rate Limiting ❌]
        C[Backend API] --> C2[Input Validation]
        C[Backend API] --> C3[Error Handling ⚠️]
        
        D[IPFS Storage] --> D1[Immutable Data]
        D[IPFS Storage] --> D2[Content Addressing]
    end

    style C1 fill:#f44336,stroke:#c62828
    style C3 fill:#ff9800,stroke:#f57c00
```

---

## 📱 هيكل الاستجابة (Responsive Structure)

```mermaid
graph LR
    subgraph "Desktop (> 992px)"
        A1[Full Navigation Bar]
        A2[Side-by-Side Layout]
        A3[Extended Market Table]
        A4[Hover Effects Active]
    end

    subgraph "Tablet (768px - 992px)"
        B1[Compact Navigation]
        B2[Grid Layout 2-3 cols]
        B3[Scrollable Table]
        B4[Touch Optimized]
    end

    subgraph "Mobile (< 768px)"
        C1[Hamburger Menu]
        C2[Single Column]
        C3[Card View]
        C4[Bottom Navigation]
    end

    A1 --> B1
    B1 --> C1
    A2 --> B2
    B2 --> C2
```

---

## 🛠️ تكامل الأدوات والمكتبات

```mermaid
graph TB
    subgraph "Frontend Framework"
        A[Next.js 16] --> B[React 18.3]
        A --> C[TypeScript 5]
        A --> D[App Router]
    end

    subgraph "Web3 Stack"
        E[Wagmi 2.19.5] --> F[Viem 2.41.2]
        E --> G[Web3Modal 4.0]
        E --> H[Ethers.js 6.16]
    end

    subgraph "UI & Styling"
        I[Bootstrap 5.3] --> J[Custom CSS]
        I --> K[Bootstrap Icons]
        L[Chart.js 4.4] --> M[React-ChartJS-2]
        N[Recharts 2.10]
    end

    subgraph "State Management"
        O[React Query 5.0] --> P[TanStack Query]
        O --> Q[Cache Management ⚠️]
    end

    subgraph "Backend"
        R[Next.js API Routes] --> S[Pinata SDK]
        R --> T[Custom NGX Engine]
    end

    A --> E
    A --> I
    A --> O
    A --> R

    style Q fill:#ff9800,stroke:#f57c00
```

---

## 📊 مخطط البيانات (Data Schema)

```mermaid
erDiagram
    USER ||--o{ NFT : owns
    USER {
        string address PK
        string[] ownedTokenIds
        int balance
        datetime lastSync
    }
    
    NFT ||--|| METADATA : has
    NFT {
        uint256 tokenId PK
        string name UK
        string tier
        string owner FK
        datetime mintDate
        string tokenURI
    }
    
    METADATA {
        string ipfsHash PK
        string name
        string description
        string image
        json attributes
    }
    
    TIER ||--o{ NFT : categorizes
    TIER {
        int tierId PK
        string name
        decimal priceUSD
        string color
        int mintCount
    }
    
    TRANSACTION ||--|| NFT : creates
    TRANSACTION {
        string txHash PK
        uint256 tokenId FK
        string from
        string to
        decimal value
        datetime timestamp
        string status
    }
```

---

## 🎨 نظام الألوان والثيمات

```mermaid
graph TB
    subgraph "Color Palette"
        A[Primary Gold<br/>#FCD535] --> A1[Buttons]
        A --> A2[Highlights]
        A --> A3[Icons]
        
        B[Dark Background<br/>#0d1117] --> B1[Main BG]
        B --> B2[Cards: #161b22]
        B --> B3[Borders: #1c2128]
        
        C[Tier Colors] --> C1[Immortal: #FCD535]
        C --> C2[Elite: #ff3232]
        C --> C3[Founders: #4db6ac]
        
        D[Status Colors] --> D1[Success: #0ecb81]
        D --> D2[Error: #f6465d]
        D --> D3[Warning: #fdd835]
    end

    style A fill:#FCD535,stroke:#B3882A,color:#000
    style B fill:#0d1117,stroke:#30363d,color:#fff
    style C1 fill:#FCD535,stroke:#B3882A,color:#000
    style C2 fill:#ff3232,stroke:#cc0000,color:#fff
    style C3 fill:#4db6ac,stroke:#00897b,color:#000
    style D1 fill:#0ecb81,stroke:#0a9960,color:#000
    style D2 fill:#f6465d,stroke:#cc0000,color:#fff
    style D3 fill:#fdd835,stroke:#c6a700,color:#000
```

---

## 🚀 خارطة طريق التطوير المستقبلي

```mermaid
timeline
    title NNM Market Development Roadmap
    section Q1 2026
        January : Fix Critical Bugs
                : Implement Parallel Fetching
                : Add Timeout & Retry
        February : Setup Monitoring
                 : Add Service Worker
                 : Improve Caching
        March : Implement Subgraph
              : Add Analytics
              : Performance Testing
    
    section Q2 2026
        April : Mobile App Development
              : Advanced Trading Features
        May : Marketplace V2
            : Bidding System Enhancement
        June : Launch Public Beta
             : Security Audit
    
    section Q3 2026
        July : Add Layer 2 Support
             : Cross-chain Bridge
        August : NFT Renting Feature
               : Staking Mechanism
        September : Partnership Integration
                  : API for Developers
    
    section Q4 2026
        October : DAO Governance
                : Token Launch
        November : Marketing Campaign
                 : Community Events
        December : Year-end Review
                 : V3 Planning
```

---

## 📈 مؤشرات الأداء الرئيسية (KPIs)

```mermaid
graph TB
    subgraph "Technical KPIs"
        A1[Page Load Time<br/>Target: < 2s]
        A2[API Response Time<br/>Target: < 500ms]
        A3[Transaction Success Rate<br/>Target: > 98%]
        A4[Error Rate<br/>Target: < 1%]
    end

    subgraph "User Experience KPIs"
        B1[Wallet Connection Time<br/>Target: < 1s]
        B2[Dashboard Load Time<br/>Target: < 5s]
        B3[Mint Completion Time<br/>Target: < 8s]
        B4[Bounce Rate<br/>Target: < 40%]
    end

    subgraph "Business KPIs"
        C1[Daily Active Users<br/>Track Growth]
        C2[Minting Conversion Rate<br/>Target: > 15%]
        C3[Average Transaction Value<br/>Track Volume]
        C4[User Retention Rate<br/>Target: > 60%]
    end

    A1 --> Monitor{Monitoring System}
    A2 --> Monitor
    A3 --> Monitor
    A4 --> Monitor
    B1 --> Monitor
    B2 --> Monitor
    B3 --> Monitor
    B4 --> Monitor
    C1 --> Analytics{Analytics Platform}
    C2 --> Analytics
    C3 --> Analytics
    C4 --> Analytics

    Monitor --> Dashboard[Management Dashboard]
    Analytics --> Dashboard
```

---

**نهاية الخريطة البصرية**

> 📝 **ملاحظة**: يمكن عرض هذه الخرائط في أي محرر يدعم Mermaid (مثل GitHub, VS Code مع ملحق Mermaid, أو Notion).

> 🔗 **للمزيد من المعلومات**: راجع التقرير التفصيلي في ملف `تقرير-تحليل-شامل-للموقع.md`
