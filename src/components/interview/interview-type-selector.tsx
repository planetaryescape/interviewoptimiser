"use client";

import { ArrowRight, Briefcase, Code, FileText, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const popularJobTitles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Manager",
  "Data Scientist",
  "UX/UI Designer",
  "DevOps Engineer",
  "Marketing Manager",
  "Sales Representative",
  "Human Resources Manager",
];

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Manufacturing",
  "Consulting",
  "Media & Entertainment",
  "Real Estate",
  "Non-profit",
];

export function InterviewTypeSelector() {
  const [selectedTab, setSelectedTab] = useState("job");
  const [jobTitle, setJobTitle] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [experience, setExperience] = useState("1");
  const [jobDescription, setJobDescription] = useState("");
  const [customRequests, setCustomRequests] = useState("");

  const handleGenerateQuestions = () => {
    // TODO: Implement AI-powered question generation from job description
  };

  const handleStartInterview = () => {
    const interviewData = {
      type: selectedTab,
      jobTitle,
      targetCompany,
      industry,
      experience,
      jobDescription,
      customRequests,
    };
    // TODO: Navigate to interview page with interview data
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Choose Your Interview Type</CardTitle>
          <CardDescription>
            Select the type of interview practice that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="job" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Job</span>
              </TabsTrigger>
              <TabsTrigger value="skill" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Skill</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Resume</span>
              </TabsTrigger>
              <TabsTrigger value="behavioral" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Behavioral</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="job" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularJobTitles.slice(0, 5).map((title) => (
                      <Badge
                        key={title}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setJobTitle(title)}
                      >
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="target-company">Target Company</Label>
                    <Input
                      id="target-company"
                      placeholder="e.g., Google, Netflix"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry" className="mt-1">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="job-description">Job Description (Optional)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateQuestions}
                      className="flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Generate from JD
                    </Button>
                  </div>
                  <Textarea
                    id="job-description"
                    placeholder="Paste the job description here for more targeted questions..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skill" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skill-name">Skill or Technology</Label>
                  <Input
                    id="skill-name"
                    placeholder="e.g., React, Python, Project Management"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="skill-level">Proficiency Level</Label>
                  <Select>
                    <SelectTrigger id="skill-level" className="mt-1">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resume" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="resume-upload">Upload Your Resume</Label>
                  <Input id="resume-upload" type="file" accept=".pdf,.doc,.docx" className="mt-1" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload your resume to get personalized interview questions
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="behavioral" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="behavioral-focus">Focus Area</Label>
                  <Select>
                    <SelectTrigger id="behavioral-focus" className="mt-1">
                      <SelectValue placeholder="Select focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="teamwork">Teamwork</SelectItem>
                      <SelectItem value="problem-solving">Problem Solving</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="adaptability">Adaptability</SelectItem>
                      <SelectItem value="conflict-resolution">Conflict Resolution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="behavioral-scenario">Scenario Type</Label>
                  <Select>
                    <SelectTrigger id="behavioral-scenario" className="mt-1">
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="star">STAR Method</SelectItem>
                      <SelectItem value="situational">Situational</SelectItem>
                      <SelectItem value="competency">Competency-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="custom-requests">Additional Requests (Optional)</Label>
                <Textarea
                  id="custom-requests"
                  placeholder="e.g., 'Focus on system design questions' or 'Conduct interview in Spanish'"
                  value={customRequests}
                  onChange={(e) => setCustomRequests(e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <Button size="lg" className="w-full" onClick={handleStartInterview}>
                Start AI Interview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
