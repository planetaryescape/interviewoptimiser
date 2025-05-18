export const JobsPageHero = () => {
  return (
    <div className="relative overflow-hidden rounded-xl mb-8 shadow-lg border border-border/20">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 animate-gradient bg-[length:200%_200%] opacity-20 dark:opacity-30" />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 dark:opacity-30" />

      {/* Content */}
      <div className="relative z-10 p-6 py-8 md:p-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-headingPrimary text-primary tracking-tight">
          Your Practice Job Roles
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl">
          Create and manage job descriptions for roles you&apos;re targeting. Practice interviews
          tailored to your specific career goals.
        </p>
      </div>

      {/* Decorative Blurry Shapes */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 md:w-64 md:h-64 rounded-full bg-primary/10 dark:bg-primary/5 blur-3xl opacity-70 animate-float" />
      <div className="absolute -top-10 -left-10 w-40 h-40 md:w-56 md:h-56 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-3xl opacity-50 animate-float [animation-delay:1s]" />
    </div>
  );
};
