import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { config } from "~/config";

export function Footer() {
  return (
    <footer className="relative w-full border-t dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              href="/"
              className={cn("font-oswald flex gap-3 items-center text-2xl font-bold group")}
            >
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={60}
                  height={60}
                  className="rounded-lg shadow-sm"
                />
              </div>
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {config.projectName}
              </span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
              Empowering job seekers with AI-driven tools to optimize their career journey and stand
              out in the job market.
            </p>
          </div>

          {/* Spacer for better grid layout */}
          <div className="hidden lg:block" />

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Creator Links */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">More from the creator</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://www.cvoptimiser.com/"
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <span>CV Optimiser</span>
                  <svg
                    className="w-3 h-3 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="CV Optimiser icon"
                  >
                    <title>CV Optimiser icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </li>
              <li>
                <Link
                  href="https://dealbase.africa/"
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <span>Dealbase Africa</span>
                  <svg
                    className="w-3 h-3 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Dealbase Africa icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-8">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © {new Date().getFullYear()} {config.projectName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
