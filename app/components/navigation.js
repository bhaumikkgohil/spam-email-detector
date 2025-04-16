// app/components/Navigation.js
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, Mail, Plus, LogOut } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  // Don't show navigation on login page
  if (pathname === "/") return null;

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link
            href="/inbox"
            className="text-xl font-bold">
            Spam Detector
          </Link>

          <div className="hidden md:flex space-x-4">
            <NavLink
              href="/inbox"
              isActive={isActive("/inbox")}
              icon={<Mail size={18} />}>
              Inbox
            </NavLink>
            <NavLink
              href="/dashboard"
              isActive={isActive("/dashboard")}
              icon={<BarChart2 size={18} />}>
              Dashboard
            </NavLink>
            <NavLink
              href="/submit"
              isActive={isActive("/submit")}
              icon={<Plus size={18} />}>
              Submit Email
            </NavLink>
          </div>
        </div>

        <div>
          <Link
            href="/"
            className="flex items-center space-x-1 p-2 rounded hover:bg-gray-700">
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex justify-around mt-4">
        <NavLink
          href="/inbox"
          isActive={isActive("/inbox")}
          icon={<Mail size={18} />}>
          Inbox
        </NavLink>
        <NavLink
          href="/dashboard"
          isActive={isActive("/dashboard")}
          icon={<BarChart2 size={18} />}>
          Stats
        </NavLink>
        <NavLink
          href="/submit"
          isActive={isActive("/submit")}
          icon={<Plus size={18} />}>
          Submit
        </NavLink>
      </div>
    </nav>
  );
}

function NavLink({ href, children, isActive, icon }) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-1 p-2 rounded ${
        isActive ? "bg-gray-700" : "hover:bg-gray-700"
      }`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
