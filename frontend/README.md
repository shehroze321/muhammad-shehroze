# AI Post Creator - Frontend

Beautiful, responsive frontend built with Next.js 15, TypeScript, and Shadcn UI.

## 🎨 Features

✨ **ChatGPT-Like Interface** - Familiar conversation-based UI  
🎯 **Static Data (Demo)** - Fully functional UI with mock data  
📱 **Fully Responsive** - Works on mobile, tablet, and desktop  
🎨 **Beautiful Design** - Modern gradients and animations  
🌙 **Dark Mode Ready** - Automatic theme support  
⚡ **Fast & Modern** - Next.js 15 with Turbopack  

## 🚀 Pages Included

### 1. Landing Page (`/`)
- Hero section with gradient design
- Feature highlights
- How it works section
- Call-to-action buttons
- Responsive layout

### 2. Chat Interface (`/chat`)
- **ChatGPT-like sidebar** with conversation list
- **Message display** with user/AI bubbles
- **3-iteration viewer** - expandable iterations display
- **Voice/text toggle** - switch input methods
- **Language selector** - English/Urdu
- **Empty state** with example prompts
- **Real-time typing simulation**

### 3. Subscriptions Page (`/subscriptions`)
- Beautiful pricing cards
- Monthly/Yearly toggle
- 3 tiers: Basic, Pro, Enterprise
- Feature comparison
- FAQ section

### 4. Authentication Pages
- **Login** (`/login`) - Clean login form
- **Register** (`/register`) - Registration with benefits display
- Guest mode option
- Beautiful gradient backgrounds

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** Shadcn UI
- **Icons:** Lucide React
- **State:** React Hooks (static data)

## 📦 Installation

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── chat/
│   │   └── page.tsx              # Main chat interface
│   ├── subscriptions/
│   │   └── page.tsx              # Pricing page
│   ├── login/
│   │   └── page.tsx              # Login page
│   ├── register/
│   │   └── page.tsx              # Register page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── layout/
│   │   ├── ChatSidebar.tsx       # Conversation sidebar
│   │   └── Header.tsx            # Top navigation
│   ├── chat/
│   │   ├── MessageBubble.tsx     # Message display
│   │   ├── ChatInput.tsx         # Input with voice/text
│   │   └── QuotaWidget.tsx       # Usage display
│   └── subscription/
│       └── PricingCard.tsx       # Subscription card
├── lib/
│   ├── utils.ts                  # Utility functions
│   └── mockData.ts               # Static mock data
├── types/
│   └── index.ts                  # TypeScript interfaces
└── hooks/                        # Custom hooks (ready for API)
```

## 🎨 Components

### ChatSidebar
- Grouped conversations (Today, Yesterday, etc.)
- Search functionality
- New chat button
- Hover actions (edit/delete)
- Upgrade prompt

### MessageBubble
- User/AI message differentiation
- Expandable iterations view
- Copy button
- Token count display
- Timestamp

### ChatInput
- Text/Voice toggle
- English/Urdu language selector
- Auto-resize textarea
- Send button with gradient
- Recording simulation

### PricingCard
- 3 tiers with different designs
- Monthly/Yearly pricing
- Feature lists
- Popular badge
- Gradient icons

### QuotaWidget
- Visual progress bar
- Remaining quota display
- Upgrade prompts
- Color-coded status

## 🎨 Design Highlights

### Color Scheme
- **Primary:** Purple (`#9333EA`) to Blue (`#2563EB`) gradients
- **Accents:** Various gradient combinations
- **Background:** Subtle gray-to-white gradients
- **Text:** High contrast for readability

### Typography
- **Font:** Inter (Google Fonts)
- **Sizes:** Responsive scale from text-sm to text-7xl
- **Weights:** 400 (normal) to 700 (bold)

### Components Style
- **Rounded corners:** 8px-16px border radius
- **Shadows:** Subtle to dramatic for depth
- **Hover states:** Scale and color transitions
- **Animations:** Smooth transitions throughout

## 📱 Responsive Design

- **Mobile:** Single column, collapsible sidebar
- **Tablet:** Optimized layout with sidebar toggle
- **Desktop:** Full sidebar + main content

Breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ✨ Key Features

### Chat Interface
- ✅ Sidebar with conversation list
- ✅ Grouped by date (Today, Yesterday, etc.)
- ✅ Search conversations
- ✅ Message bubbles with avatars
- ✅ AI response with 3 iterations
- ✅ Copy functionality
- ✅ Voice/text input toggle
- ✅ Language selector
- ✅ Empty state with examples
- ✅ Loading states

### Subscription Page
- ✅ 3 pricing tiers
- ✅ Monthly/Yearly toggle
- ✅ Feature comparison
- ✅ Popular badge
- ✅ FAQ section

### Authentication
- ✅ Beautiful login form
- ✅ Registration with benefits
- ✅ Guest mode option
- ✅ Form validation (HTML5)

## 🎯 Static Data (Mock)

All components use static data from `lib/mockData.ts`:

```typescript
- mockConversations: 5 sample conversations
- mockMessages: 4 sample messages with iterations
- mockPlans: 3 subscription tiers
```

**Ready for API integration** - just replace mock data with API calls!

## 🚀 Next Steps

### To Add API Integration:
1. Create API client in `lib/api.ts`
2. Replace mock data with API calls
3. Add state management (Zustand)
4. Implement real authentication
5. Connect to backend endpoints

### Suggested Improvements:
- Add toast notifications (Sonner)
- Implement real voice recording
- Add analytics dashboard
- Create settings page
- Add export functionality

## 📸 Pages Preview

**Landing Page** (`/`)
- Hero with gradient
- Features grid
- How it works
- CTA section

**Chat** (`/chat`)
- Sidebar with conversations
- Message area with AI responses
- Input with voice/text toggle
- Quota indicators

**Subscriptions** (`/subscriptions`)
- Pricing cards grid
- Feature comparison
- FAQ section

**Auth** (`/login`, `/register`)
- Clean forms
- Gradient backgrounds
- Guest mode option

## 🎨 UI/UX Highlights

- ✅ Purple-to-blue gradient theme
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Loading states
- ✅ Empty states
- ✅ Error states (ready)
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessible components

## 🔧 Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

## ✅ Status

**UI/UX:** ✅ COMPLETE  
**Pages:** ✅ 5 pages built  
**Components:** ✅ 10+ components  
**Responsive:** ✅ Mobile-first  
**Design:** ✅ Modern & beautiful  
**Static Data:** ✅ Working perfectly  

**Ready for:** API integration and deployment!

## 🎉 What You Get

- ✅ Beautiful, modern UI
- ✅ ChatGPT-like experience
- ✅ Fully responsive design
- ✅ All pages implemented
- ✅ Static data working
- ✅ Ready for backend connection

**Status:** ✅ COMPLETE

**Next:** Connect to backend APIs and deploy! 🚀
