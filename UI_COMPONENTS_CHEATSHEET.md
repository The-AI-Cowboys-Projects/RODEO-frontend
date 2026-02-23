# RODEO UI Components Quick Reference

Quick copy-paste examples for all UI components.

---

## 🎨 Importing Components

```javascript
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'
import Table from '../components/ui/Table'
import theme, { getRiskColor, getRiskLabel } from '../styles/theme'
```

---

## 📦 Card

```jsx
// Basic card
<Card>
  Content here
</Card>

// Primary variant with hover
<Card variant="primary" hover>
  Primary card with lift effect
</Card>

// Glass effect with glow
<Card variant="glass" glow>
  Glassmorphism card with glow animation
</Card>

// All variants
variant="default" | "primary" | "success" | "warning" | "error" | "glass"
```

---

## 🔘 Button

```jsx
// Primary button
<Button onClick={handleClick}>
  Click Me
</Button>

// With icon (left)
<Button icon={<svg>...</svg>}>
  Upload
</Button>

// With icon (right)
<Button icon={<svg>...</svg>} iconPosition="right">
  Continue
</Button>

// Loading state
<Button loading>
  Saving...
</Button>

// Disabled
<Button disabled>
  Unavailable
</Button>

// Full width
<Button fullWidth>
  Submit Form
</Button>

// All variants
variant="primary" | "secondary" | "success" | "danger" | "warning" | "ghost" | "link"

// All sizes
size="xs" | "sm" | "md" | "lg" | "xl"
```

---

## 🏷️ Badge

```jsx
// Basic badge
<Badge>New</Badge>

// With variants
<Badge variant="success">Active</Badge>
<Badge variant="danger">Critical</Badge>
<Badge variant="warning">Pending</Badge>

// Rounded (pill shape)
<Badge rounded>Status</Badge>

// With indicator dot
<Badge variant="success" dot>
  Online
</Badge>

// Risk levels
<Badge variant="critical">Critical</Badge>
<Badge variant="high">High</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="low">Low</Badge>

// Sizes
size="xs" | "sm" | "md" | "lg"
```

---

## 📊 StatCard

```jsx
// Basic stat card
<StatCard
  title="Total Samples"
  value="1,234"
  icon="🦠"
/>

// With trend indicator
<StatCard
  title="Active Users"
  value="856"
  icon="👥"
  trend="+12% from last week"
  trendDirection="up"
  variant="success"
/>

// Loading state
<StatCard
  title="Loading..."
  value="0"
  loading={true}
/>

// All variants
variant="default" | "primary" | "success" | "warning" | "danger"

// Trend directions
trendDirection="up" | "down" | "neutral"
```

---

## 📋 Table

```jsx
// Define columns
const columns = [
  {
    key: 'name',
    label: 'Name',
    render: (row) => <span className="font-medium">{row.name}</span>
  },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'default'}>
        {row.status}
      </Badge>
    )
  },
  {
    key: 'score',
    label: 'Score',
    render: (row) => row.score.toFixed(2)
  },
]

// Use table
<Table
  columns={columns}
  data={data}
  loading={isLoading}
  sortable
  hoverable
/>

// Options
sortable={true}    // Enable column sorting
hoverable={true}   // Highlight rows on hover
striped={true}     // Alternate row colors
compact={true}     // Reduced padding
```

---

## 🎭 Animations

```jsx
// Fade animations
<div className="animate-fadeIn">Fade in</div>
<div className="animate-fadeInUp">Fade in from bottom</div>
<div className="animate-fadeInDown">Fade in from top</div>
<div className="animate-fadeInLeft">Fade in from left</div>
<div className="animate-fadeInRight">Fade in from right</div>

// Scale animations
<div className="animate-scaleIn">Scale up</div>

// Loading animations
<div className="animate-spin">Spinning</div>
<div className="animate-pulse">Pulsing</div>
<div className="animate-bounce">Bouncing</div>

// Special effects
<div className="animate-glow">Glowing</div>
<div className="animate-glowPulse">Glow pulse</div>
<div className="animate-shake">Shake</div>

// Hover effects
<div className="hover-lift">Lifts on hover</div>
<div className="hover-glow">Glows on hover</div>
<div className="hover-scale">Scales on hover</div>

// Staggered animations (for lists)
<div className="animate-fadeInUp stagger-delay-1">First</div>
<div className="animate-fadeInUp stagger-delay-2">Second</div>
<div className="animate-fadeInUp stagger-delay-3">Third</div>
<div className="animate-fadeInUp stagger-delay-4">Fourth</div>
<div className="animate-fadeInUp stagger-delay-5">Fifth</div>
```

---

## 🎨 Theme Colors

```javascript
// Get risk-based colors
import { getRiskColor, getRiskLabel } from '../styles/theme'

const color = getRiskColor(0.85) // '#dc2626' (critical)
const label = getRiskLabel(0.85) // 'Critical'

// Risk score ranges:
// 0.9+ → Critical
// 0.7-0.9 → High
// 0.5-0.7 → Medium
// 0.3-0.5 → Low
// <0.3 → None

// Use in JSX
<div style={{ color: getRiskColor(score) }}>
  Risk: {getRiskLabel(score)}
</div>
```

---

## 📐 Layout Grid

```jsx
// Responsive stat cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard title="Metric 1" value="100" />
  <StatCard title="Metric 2" value="200" />
  <StatCard title="Metric 3" value="300" />
  <StatCard title="Metric 4" value="400" />
</div>

// Two column layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>Left content</Card>
  <Card>Right content</Card>
</div>

// Flexible spacing
<div className="space-y-6">
  <Card>Section 1</Card>
  <Card>Section 2</Card>
  <Card>Section 3</Card>
</div>
```

---

## 🎯 Complete Page Template

```jsx
import { useQuery } from '@tanstack/react-query'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function MyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  })

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant="success">{row.status}</Badge>
    },
  ]

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Page Title
        </h1>
        <Button variant="primary" icon={<svg>...</svg>}>
          Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Metric 1"
          value="100"
          icon="📊"
          variant="primary"
          loading={isLoading}
          className="animate-fadeInUp stagger-delay-1"
        />
        <StatCard
          title="Metric 2"
          value="200"
          icon="✅"
          variant="success"
          loading={isLoading}
          className="animate-fadeInUp stagger-delay-2"
        />
        <StatCard
          title="Metric 3"
          value="300"
          icon="⚠️"
          variant="warning"
          loading={isLoading}
          className="animate-fadeInUp stagger-delay-3"
        />
      </div>

      {/* Data Table */}
      <Card variant="glass" className="animate-fadeInUp stagger-delay-4">
        <h2 className="text-xl font-bold text-white mb-4">
          Data Table
        </h2>
        <Table
          columns={columns}
          data={data || []}
          loading={isLoading}
          sortable
          hoverable
        />
      </Card>
    </div>
  )
}
```

---

## 🎨 Common Color Classes

```css
/* Text colors */
text-white
text-gray-400
text-purple-400
text-green-400
text-red-400
text-orange-400

/* Background colors */
bg-slate-800
bg-slate-900
bg-purple-600
bg-green-600
bg-red-600

/* Border colors */
border-slate-700
border-purple-500
border-green-500

/* Gradient backgrounds */
bg-gradient-to-r from-purple-400 to-pink-400
bg-gradient-to-br from-slate-800 to-slate-900
```

---

## 🔧 Utility Classes

```css
/* Spacing */
p-4, p-6, p-8       /* Padding */
m-4, m-6, m-8       /* Margin */
space-y-4, space-y-6 /* Vertical spacing between children */
gap-4, gap-6        /* Grid/flex gap */

/* Borders */
rounded-lg          /* 8px radius */
rounded-xl          /* 12px radius */
border              /* 1px border */
border-2            /* 2px border */

/* Shadows */
shadow-lg           /* Large shadow */
shadow-xl           /* Extra large shadow */

/* Transitions */
transition-all      /* Animate all properties */
transition-colors   /* Animate only colors */
transition-transform /* Animate only transforms */

/* Hover effects */
hover:bg-slate-700
hover:text-white
hover:scale-105

/* Focus states */
focus:outline-none
focus:ring-2
focus:ring-purple-500
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first (default) */
<div className="text-sm">Mobile</div>

/* Tablet and up (768px+) */
<div className="md:text-base">Tablet+</div>

/* Desktop and up (1024px+) */
<div className="lg:text-lg">Desktop+</div>

/* Large desktop (1280px+) */
<div className="xl:text-xl">Large Desktop+</div>

/* Example: Responsive grid */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  Mobile: 1 column
  Tablet: 2 columns
  Desktop: 4 columns
</div>
```

---

## 🚀 Pro Tips

1. **Always use components** from the library instead of custom HTML
2. **Add animations** to page content with `animate-fadeInUp`
3. **Use staggered delays** for lists of items
4. **Show loading states** with the `loading` prop
5. **Use semantic variants** (success, danger, warning, etc.)
6. **Add hover effects** to interactive elements
7. **Test responsiveness** on mobile, tablet, and desktop
8. **Use theme colors** from `theme.js` for consistency

---

## 📚 Full Documentation

See `UI_UX_GUIDE.md` for comprehensive documentation including:
- Design system details
- Animation guidelines
- Best practices
- Accessibility tips
- Migration guide

---

**Quick Reference Version:** 1.0.0
**Last Updated:** 2025-11-05
