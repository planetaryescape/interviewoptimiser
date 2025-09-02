import {
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  GraduationCap,
  Palette,
  Plug,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruitersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Enterprise Solutions
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight mb-6">
              Hire The Best Candidates <span className="text-primary">10X Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your hiring process with AI-powered voice interviews that analyze not just
              what candidates say, but how they say it.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact-sales">Request Demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/sign-up?type=recruiter">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Leading Companies Choose Interview Optimiser
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our unique prosody analysis technology provides insights no other platform can match
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Secure & Proctored</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI-proctored interviews with identity verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Advanced response analysis to ensure authenticity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Secure data handling with enterprise-grade encryption</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-4" />
                <CardTitle>10x Faster Hiring</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Automated screening reduces time-to-hire by 75%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>24/7 AI interviews with instant detailed reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Focus on qualified candidates, not scheduling</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Deep Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Prosody analysis reveals confidence and enthusiasm</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Emotional intelligence assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive skills evaluation beyond keywords</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Plug className="w-10 h-10 text-primary mb-4" />
                <CardTitle>Seamless Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Works with Greenhouse, Lever, and Workday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>API access for custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Zapier support for 5000+ apps</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Solutions for Every Organization</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From startups to enterprises, we help organizations build better teams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Recruiting Agencies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Screen candidates at scale with consistent evaluation criteria. White-label
                  options available for your brand.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <GraduationCap className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">Educational Institutions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Help students prepare for real interviews. Track progress and improve placement
                  rates with data-driven insights.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">HR Departments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Streamline internal hiring with customizable interview templates and comprehensive
                  candidate comparison tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Palette className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">White Label Partners</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Deploy our technology under your brand with full customization of interface,
                  scenarios, and feedback systems.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Transform Your Hiring in 4 Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Interview",
                description: "Set up role-specific interview templates with custom questions",
              },
              {
                step: "2",
                title: "Invite Candidates",
                description: "Send interview links that candidates can complete anytime",
              },
              {
                step: "3",
                title: "AI Conducts Interview",
                description: "Our AI engages in natural voice conversations with prosody analysis",
              },
              {
                step: "4",
                title: "Review & Decide",
                description: "Get detailed reports with confidence scores and recommendations",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">75%</p>
              <p className="text-lg opacity-90">Reduction in Time-to-Hire</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">10,000+</p>
              <p className="text-lg opacity-90">Interviews Conducted</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">92%</p>
              <p className="text-lg opacity-90">Candidate Satisfaction</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">3x</p>
              <p className="text-lg opacity-90">Better Quality Hires</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <Card className="max-w-4xl mx-auto text-center p-12">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">
                Ready to Transform Your Hiring Process?
              </CardTitle>
              <CardDescription className="text-lg">
                Join leading companies using AI to build better teams faster
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center mt-6">
              <Button size="lg" asChild>
                <Link href="/contact-sales">Schedule Demo</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
