import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ marginTop: ".9rem", maxWidth: "36ch" }}>
              Connecting food donors, NGOs and volunteers so safe surplus food becomes shared meals
              instead of waste.
            </p>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link href="/food">Find food</Link></li>
              <li><Link href="/donate">Donate food</Link></li>
              <li><Link href="/#how-it-works">How it works</Link></li>
              <li><Link href="/credits">Photo credits</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link href="/login">Log in</Link></li>
              <li><Link href="/register">Create account</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">© {new Date().getFullYear()} FoodRescue. Built to reduce food waste.</div>
      </div>
    </footer>
  );
}
