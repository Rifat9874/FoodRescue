"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { useAuth } from "./AuthProvider";
import Icon from "./Icon";
import Logo from "./Logo";

function NavLink({ href, children }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} aria-current={active ? "page" : undefined}>{children}</Link>;
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  // Refresh the unread badge on login and whenever the user navigates.
  useEffect(() => {
    if (!user) return setUnread(0);
    api("/api/notifications")
      .then((data) => setUnread(data.unread))
      .catch(() => {});
  }, [user, pathname]);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="navbar">
      <nav className="container nav-inner" aria-label="Main">
        <Logo />
        <button
          className="btn btn-outline btn-sm menu-btn"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "x" : "menu"} />
        </button>
        <div id="nav-links" className={`nav-links ${open ? "open" : ""}`}>
          <NavLink href="/food">Find food</NavLink>
          {user?.role === "DONOR" && <NavLink href="/donate">Donate food</NavLink>}
          {user && (
            <NavLink href="/requests">{user.role === "VOLUNTEER" ? "Pickup tasks" : "Requests"}</NavLink>
          )}
          {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          {user?.role === "ADMIN" && <NavLink href="/admin">Admin</NavLink>}
          {user && (
            <NavLink href="/notifications">
              Notifications
              {unread > 0 && <span className="count" aria-label={`${unread} unread`}>{unread}</span>}
            </NavLink>
          )}
          <span className="nav-sep" aria-hidden="true" />
          {!loading && !user && (
            <>
              <NavLink href="/login">Log in</NavLink>
              <Link className="btn btn-sm" href="/register">Sign up</Link>
            </>
          )}
          {user && (
            <button className="btn btn-outline btn-sm" onClick={logout}>
              <Icon name="logout" size={15} /> Log out
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
