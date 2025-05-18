# Interview Optimiser - Design Specification

## 1. Design Philosophy

### 1.1 Core Principles

- **User-Centric Design**: Focusing on the needs of job seekers and recruiters
- **Clarity and Simplicity**: Reducing cognitive load during high-stress interview scenarios
- **Accessibility First**: Ensuring the platform is usable for all users regardless of abilities
- **Professional Aesthetics**: Creating a trustworthy, premium feel appropriate for career advancement
- **Consistent Experience**: Maintaining design patterns across all platform areas

### 1.2 Design Goals

- Create a distraction-free interview environment
- Provide clear, actionable feedback
- Establish visual hierarchy for complex information
- Support quick identification of insights and next steps
- Balance professional appearance with approachable interactions

## 2. Brand Identity

### 2.1 Brand Personality

- Professional yet approachable
- Innovative and modern
- Trustworthy and reliable
- Supportive and empowering

### 2.2 Logo Guidelines

- Primary logo for light backgrounds
- Reversed logo for dark backgrounds
- Minimum clear space requirement of 2× logo height
- Minimum size requirements for digital (40px) and print (0.5")

### 2.3 Color Palette

#### Primary Colors

- **Primary Blue** (#0F62FE): Call-to-actions, buttons, primary interactive elements
- **Secondary Blue** (#0043CE): Hover states, highlights, secondary interactive elements
- **Accent Orange** (#FF7A00): Important call-outs, accents, progress indicators

#### Neutral Colors

- **Dark Gray** (#262626): Primary text, headers
- **Medium Gray** (#525252): Secondary text, descriptions
- **Light Gray** (#E0E0E0): Backgrounds, dividers, disabled states
- **Off-White** (#F4F4F4): Page backgrounds, cards

#### Semantic Colors

- **Success Green** (#198038): Positive feedback, confirmations
- **Warning Yellow** (#F1C21B): Cautions, potential issues
- **Error Red** (#DA1E28): Errors, critical issues

### 2.4 Typography

#### Primary Typeface

- **Inter**: Used for all UI elements and body text
  - Light (300): Large display text
  - Regular (400): Body text, descriptions
  - Medium (500): Sub-headers, emphasized text
  - SemiBold (600): Button text, small headers
  - Bold (700): Primary headers, important callouts

#### Type Scale

- Display: 48px/56px, Inter Light
- H1: 32px/40px, Inter Bold
- H2: 24px/32px, Inter Bold
- H3: 20px/28px, Inter SemiBold
- H4: 18px/24px, Inter SemiBold
- Body Large: 16px/24px, Inter Regular
- Body: 14px/20px, Inter Regular
- Caption: 12px/16px, Inter Medium

## 3. Component Design System

### 3.1 Core Components

#### Buttons

- **Primary Button**: Filled blue, white text, rounded corners (8px)
- **Secondary Button**: Outlined blue, blue text
- **Tertiary Button**: Text only, blue text
- **Danger Button**: Red background, white text
- **Success Button**: Green background, white text
- **Disabled Button**: Light gray background, medium gray text

#### Inputs

- **Text Input**: White background, 1px border, 8px corner radius
- **Dropdown**: White background, chevron indicator
- **Checkbox**: Custom square with check mark
- **Radio Button**: Custom circle with inner dot
- **Toggle**: Pill-shaped slider with clear on/off states
- **Text Area**: Multi-line input with resize handle

#### Cards

- **Standard Card**: White background, subtle shadow, 12px corner radius
- **Interactive Card**: Hover and active states
- **Information Card**: Icon, heading, and body text structure
- **Metric Card**: 
  - **Standard Metric Card**: Large number display with label. Used for general statistics.
  - **Animated Stat Card**: Extends the standard metric card with hover animations (e.g., subtle lift, shadow changes, background glows) and an associated icon. Used for key performance indicators on the dashboard (e.g., Total Jobs, Total Interviews).
  - **Score Comparison Card**: Displays a primary score (e.g., "Last 3 Interviews" average) alongside a secondary comparison score (e.g., "All Time" average). Includes a trend indicator (up, down, neutral) and an associated icon. Used for detailed performance breakdowns on the dashboard.

#### Navigation

- **Primary Navigation**: Full-width navbar with logo and main sections
- **Sidebar Navigation**: Collapsible sidebar with icons and labels
- **Breadcrumb**: Clear path indicators for multi-level navigation
- **Pagination**: Page controls for long lists of content

#### Data Visualization

- **Progress Bar**: Linear indicator with percentage
- **Charts**: Bar, line, and radar charts for performance data. `recharts` library is utilized for implementing interactive charts, such as the radar chart for visualizing multiple performance scores on the dashboard.
- **Score Indicators**: Circular or linear meters showing assessment scores
- **Comparison Tables**: Side-by-side metric comparisons

### 3.2 Page Templates

#### Dashboard Layout

- Top navigation bar
- Optional sidebar navigation
- Content area typically features:
  - A `DashboardHero` component for the main page title and an engaging visual introduction.
  - A `KeyMetricsSection` displaying high-level statistics using `AnimatedStatCard`s.
  - A `PerformanceMetricsSection` providing detailed score breakdowns, often including a `ScoreRadarChart` and multiple `ScoreComparisonCard`s.
  - A `RecentActivitySection` presenting a timeline of recent events (e.g., jobs added, interviews completed) using `ActivityTimelineItem`s.
- Quick action bar (e.g., "Create New Job" button)

#### Interview Session Layout

- Minimalist design to reduce distractions
- Prominent voice visualization
- Progress indicator showing interview progression
- Timeout indicators for response timing

#### Report View Layout

- Summary section with overall scores
- Tabbed or accordion detailed feedback sections
- Visual charts for performance metrics
- Action items and recommendations area

#### Job Management Layout

- Table/list view of job entries
- Quick filters and search
- Detail panel or modal for specific job information
- Multi-step creation wizard

#### Candidate Tracking Layout

- Kanban or list view of candidates
- Status indicators and filters
- Quick access to individual candidate reports
- Comparison tools for multiple candidates

## 4. User Interface Patterns

### 4.1 Navigation Patterns

- Dashboard as home base for users
- Consistent global navigation
- Breadcrumb trails for deep navigation
- Back buttons for multi-step processes

### 4.2 Data Entry Patterns

- Progressive disclosure in forms
- Inline validation with helpful error messages
- Autosave where appropriate
- Clear submission and confirmation process

### 4.3 Content Display Patterns

- Card-based content organization
- Progressive loading for performance
- Empty states with helpful guidance
- Skeleton loaders during data fetching

### 4.4 Feedback Patterns

- Toast notifications for system messages
- Inline validation for form inputs
- Progress indicators for long operations
- Success and error states for operations

## 5. Responsive Design

### 5.1 Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop Small**: 1024px - 1279px
- **Desktop Large**: 1280px and above

### 5.2 Mobile Adaptations

- Single column layouts
- Collapsible sections
- Bottom navigation bar
- Simplified data visualizations
- Touch-optimized input elements

### 5.3 Tablet Adaptations

- Two-column layouts where appropriate
- Sidebar navigation as overlay
- Optimized for both portrait and landscape orientations

### 5.4 Desktop Adaptations

- Multi-column layouts
- Persistent sidebar navigation
- Advanced data visualization options
- Keyboard shortcuts and power user features

## 6. Motion and Animation

### 6.1 Transition Principles

- Quick, subtle transitions (150-250ms)
- Ease-in-out timing function
- Purposeful animation that supports usability
- Reduced motion option for accessibility

### 6.2 Animation Types

- **Micro-interactions**: Button states, form feedback
- **Page Transitions**: Subtle fade or slide between pages
- **Data Updates**: Smooth transitions for changing values
- **Loading States**: Skeleton loaders, progress indicators

### 6.3 Voice Visualization

- Real-time audio waveform visualization
- Speaking indicator animations
- Turn-taking visual cues
- Recording status indicators

## 7. Accessibility Guidelines

### 7.1 Color and Contrast

- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Non-reliance on color alone for conveying information
- Alternative color modes (high contrast, dark mode)

### 7.2 Typography Accessibility

- Minimum text size of 14px for body content
- Scalable text that resizes with browser settings
- Line spacing of at least 1.5 times the font size
- Sufficient spacing between paragraphs (0.8em minimum)

### 7.3 Interaction Accessibility

- Keyboard navigability for all interactive elements
- Focus states visible and consistent
- Touch targets minimum size of 44×44 pixels
- Reduced motion option for animations

### 7.4 Screen Reader Support

- Semantic HTML structure
- Appropriate ARIA labels where needed
- Logical tab order
- Alternative text for all meaningful images

## 8. Implementation Guidelines

### 8.1 CSS Architecture

- Tailwind CSS for utility-first styling
- Custom component classes for complex elements
- Design tokens for colors, spacing, and typography
- Mobile-first responsive approach

### 8.2 Design Token System

- Color tokens mapped to semantic uses
- Spacing scale (4px base increment)
- Typography scale with responsive adjustments
- Shadow and elevation system
- Border radius and stroke width system

### 8.3 Component Implementation

- ShadCN/UI as foundation for core components
- Custom React components for specialized functionality
- Composition pattern for complex UI elements
- Storybook documentation for component library

### 8.4 Design-to-Development Workflow

- Figma as design source of truth
- Component-based design approach
- Design token synchronization
- Regular design review sessions

## 9. User Experience Flows

### 9.1 B2C User Flows

#### Interview Practice Flow

1. Dashboard entry point
2. Interview configuration (CV upload, job description, interview type)
3. Pre-interview guidance
4. Live interview session
5. Post-interview feedback review
6. Actionable next steps

#### Performance Review Flow

1. Dashboard entry point
2. Report selection
3. Summary view
4. Detailed criteria exploration
5. Comparative analysis (if multiple interviews exist)
6. Improvement recommendations

### 9.2 B2B User Flows

#### Job Creation Flow

1. Dashboard entry point
2. "Create Job" action
3. Multi-step wizard with validation
4. Job details and requirements
5. Interview configuration
6. Shareable link generation
7. Confirmation and job listing

#### Candidate Management Flow

1. Jobs dashboard entry point
2. Job selection
3. Candidate listing view
4. Candidate detail exploration
5. Report analysis
6. Status updates
7. Communication options

## 10. Design System Evolution

### 10.1 Governance

- Regular design review sessions
- Component approval process
- Design system documentation
- Version control for design assets

### 10.2 Iteration Process

- User feedback collection
- Performance monitoring
- Accessibility testing
- Regular component updates

### 10.3 Future Design Directions

- Expanded data visualization library
- Advanced animation patterns
- Internationalization support
- Dark mode implementation
- Enterprise theming capabilities
