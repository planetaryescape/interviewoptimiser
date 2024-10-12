import { config } from "@/lib/config";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t dark:border-gray-700 pb-[calc(5em+env(safe-area-inset-bottom))] md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[calc(1em+env(safe-area-inset-bottom))]">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-4">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            © 2024 {config.projectName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
