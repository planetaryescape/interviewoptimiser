import { vi } from "vitest";

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);

  constructor(callback: IntersectionObserverCallback) {
    // Immediately call the callback with empty entries to initialize
    setTimeout(() => callback([], this));
  }
};

// Mock embla-carousel-react to avoid the TypeError
vi.mock("embla-carousel-react", () => {
  const useEmblaCarousel = () => [() => {}, { scrollPrev: vi.fn(), scrollNext: vi.fn() }];
  return {
    __esModule: true,
    useEmblaCarousel,
    default: useEmblaCarousel,
  };
});

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
  Quote: () => <div data-testid="quote-icon" />,
  Server: () => <div data-testid="server-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
}));

// Mock the carousel components
vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: any) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: any) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children, className }: any) => (
    <div data-testid="carousel-item" className={className}>
      {children}
    </div>
  ),
  CarouselNext: () => (
    <button type="button" data-testid="carousel-next">
      Next
    </button>
  ),
  CarouselPrevious: () => (
    <button type="button" data-testid="carousel-previous">
      Previous
    </button>
  ),
}));

// Mock the accordion components
vi.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: any) => (
    <div data-testid="accordion" {...props}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value }: any) => (
    <div data-testid="accordion-item" data-value={value}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children }: any) => <div data-testid="accordion-trigger">{children}</div>,
  AccordionContent: ({ children }: any) => <div data-testid="accordion-content">{children}</div>,
}));

// Mock the select components
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, name }: any) => <div data-testid={`select-${name}`}>{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

// Mock the CTA constants
vi.mock("@/lib/landing/recruitment/constants", () => ({
  CTA: {
    b2c: {
      href: "/practice-free",
      label: "Practice for Free",
    },
  },
}));
