import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="max-w-7xl w-full py-8 mx-auto px-4 sm:px-6 lg:px-8 border-t dark:border-gray-700">
      <div className="flex w-full items-start justify-between py-8">
        <Link
          href="/"
          className={cn(
            "font-oswald flex gap-2 flex-col md:flex-row items-center text-2xl font-bold"
          )}
        >
          <Image
            src="/logo.png"
            alt={`${config.projectName} Logo`}
            width={60}
            height={60}
          />
          <span className="hidden md:block">{config.projectName}</span>
        </Link>

        <div className="flex justify-between items-start gap-8">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Legal</h3>
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
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">More from the creator</h3>
            <Link
              href="https://www.cvoptimiser.com/"
              target="_blank"
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              CV Optimiser
            </Link>
            <Link
              href="https://dealbase.africa/"
              target="_blank"
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
            >
              Dealbase Africa
            </Link>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
        © 2024 CV Optimiser. All rights reserved.
      </p>
    </footer>
  );
}
