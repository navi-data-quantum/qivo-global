"use client";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";
import { AiOutlineFileText, AiOutlineLock, AiOutlineMail } from "react-icons/ai";

export default function Footer() {
  return (
    <footer className="bg-zinc-900/80 backdrop-blur-xl text-gray-400 py-12 px-6 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="flex gap-6 text-sm md:text-base order-1 md:order-0">
          <Link href="/privacy" className="flex items-center gap-2 group">
            <AiOutlineLock />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Privacy
            </span>
          </Link>
          <Link href="/terms" className="flex items-center gap-2 group">
            <AiOutlineFileText />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Terms
            </span>
          </Link>
          <Link href="/contact" className="flex items-center gap-2 group">
            <AiOutlineMail />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Contact
            </span>
          </Link>
        </div>

        <p className="text-sm md:text-base text-center order-0 md:order-1">
          &copy; 2026 QIVO Platform. All rights reserved.
        </p>

        <div className="flex gap-4 text-sm md:text-base order-2">
          <Link href="https://facebook.com" target="_blank" className="flex items-center gap-2 group">
            <FaFacebookF />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Facebook
            </span>
          </Link>
          <Link href="https://twitter.com" target="_blank" className="flex items-center gap-2 group">
            <FaTwitter />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Twitter
            </span>
          </Link>
          <Link href="https://instagram.com" target="_blank" className="flex items-center gap-2 group">
            <FaInstagram />
            <span className="relative after:block after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:w-0 group-hover:after:w-full transition-[width] duration-300">
              Instagram
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}