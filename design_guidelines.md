# Design Guidelines - Personal Finance Management App

## Design Approach
**Selected Approach:** Design System - Drawing from Linear's clean efficiency and Notion's data organization principles

**Justification:** This is a utility-focused financial management application where data clarity, quick scanning, and efficient workflows are critical. Users need to quickly add expenses, view upcoming payments, and understand their financial status at a glance.

**Key Design Principles:**
- Information hierarchy through typography, not decoration
- Data-first layouts with clear visual grouping
- Efficient workflows with minimal clicks
- Consistent, predictable patterns throughout

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 222 15% 8% (primary surface)
- Surface: 222 15% 12% (cards, elevated surfaces)
- Border: 222 10% 20% (subtle dividers)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%
- Success/Income: 142 76% 45% (green for positive transactions)
- Danger/Expense: 0 84% 60% (red for expenses, overdue items)
- Warning: 38 92% 50% (amber for upcoming due dates)
- Primary Accent: 217 91% 60% (blue for interactive elements)

**Light Mode:**
- Background: 0 0% 100%
- Surface: 0 0% 98%
- Border: 0 0% 90%
- Text Primary: 222 15% 15%
- Text Secondary: 222 10% 45%
- Success/Income: 142 71% 35%
- Danger/Expense: 0 72% 51%
- Warning: 38 92% 40%
- Primary Accent: 217 91% 50%

### B. Typography

**Font Family:** Inter via Google Fonts CDN (primary), system-ui fallback

**Hierarchy:**
- Page Titles: text-3xl font-semibold (30px, 600 weight)
- Section Headers: text-xl font-semibold (20px, 600 weight)
- Card Titles: text-base font-medium (16px, 500 weight)
- Body Text: text-sm font-normal (14px, 400 weight)
- Captions/Labels: text-xs font-medium (12px, 500 weight)
- Numbers/Currency: tabular-nums font-semibold for alignment

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Grid gaps: gap-4 to gap-6
- Container margins: mx-4 md:mx-8

**Grid System:**
- Main container: max-w-7xl mx-auto
- Dashboard: 12-column responsive grid
- Cards: 1 column mobile, 2-3 columns tablet, 3-4 columns desktop

### D. Component Library

**Navigation:**
- Sidebar navigation (collapsible on mobile) with icons from Heroicons
- Active state: subtle background with accent border-left
- Sections: Dashboard, Gastos, Vencimentos, Relatórios

**Dashboard Cards:**
- Elevated cards with subtle shadow (shadow-sm)
- Rounded corners: rounded-lg
- Header with title and optional action button
- Clear metric display: large numbers with labels
- Trend indicators with arrows and percentage changes

**Data Tables:**
- Striped rows for better scanning (zebra striping)
- Sticky header on scroll
- Sortable columns with sort indicators
- Row actions: edit and delete icons on hover
- Status badges: pill-shaped with color coding (Pago, Pendente, Vencido)
- Currency values: right-aligned with tabular numbers

**Forms:**
- Grouped fields with clear labels above inputs
- Input fields: rounded-md border with focus ring in accent color
- Select dropdowns: native styled consistently
- Date pickers: modern calendar interface
- Radio/Checkbox groups for payment type (Fixo/Parcelado)
- Validation messages below fields in danger color
- Submit buttons: prominent with primary accent color

**Charts & Visualizations:**
- Use Chart.js via CDN for dashboard metrics
- Bar charts for monthly expenses by category
- Line charts for expense trends over time
- Donut chart for category distribution
- Color-coded by expense categories
- Interactive tooltips on hover

**Calendar View:**
- Month grid layout with day cells
- Highlighted dates with expense indicators
- Color-coded dots for different payment types
- Click to view day's expenses in modal
- Navigation between months

**Modals/Dialogs:**
- Centered overlay with backdrop blur
- Clear header with title and close button
- Content area with appropriate padding (p-6)
- Footer with action buttons (Cancel/Save)
- Max width: max-w-2xl for forms

**Badges & Status Indicators:**
- Pill-shaped badges for payment status
- Small circular badges for notification counts
- Color-coded: green (paid), red (overdue), amber (upcoming), blue (fixed)

### E. Animations

**Minimal, Purposeful Motion:**
- Transitions: transition-colors duration-200 for hover states
- Modal entrance: fade-in with slight scale (scale-95 to scale-100)
- Loading states: subtle pulse animation
- No scroll-triggered animations
- No complex page transitions

## Application-Specific Guidelines

**Dashboard Layout:**
- Top row: 4 metric cards (Total Mensal, Pago, Pendente, Vencidos)
- Second row: Category breakdown chart (2/3 width) + Upcoming payments list (1/3 width)
- Third row: Monthly trend line chart (full width)
- Bottom row: Recent transactions table

**Transaction Form:**
- Two-column layout on desktop: left (details), right (summary preview)
- Fields: Nome, Categoria (dropdown), Valor, Data Vencimento, Tipo (Fixo/Parcelado)
- Conditional field: "Número de Parcelas" appears only if Parcelado selected
- Real-time summary showing total and installment breakdown

**Mobile Responsiveness:**
- Sidebar converts to bottom navigation on mobile
- Cards stack to single column
- Tables scroll horizontally with sticky first column
- Forms become single column with full-width inputs

**Icons:**
Use Heroicons via CDN for consistency:
- Dashboard: ChartBarIcon
- Gastos: CurrencyDollarIcon
- Vencimentos: CalendarIcon
- Add: PlusCircleIcon
- Edit: PencilIcon
- Delete: TrashIcon
- Fixed payment: ArrowPathIcon (circular)
- Installment: Squares2X2Icon

**No Images Required:** This is a data-focused application with no hero sections or marketing imagery. Visual interest comes from clean typography, clear data visualization, and thoughtful spacing.