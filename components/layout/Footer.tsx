import Link from "next/link";
import { FacebookIcon, GitHubIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";

const socials = [
  { href: "https://x.com", label: "Vroomly on X", Icon: XIcon },
  { href: "https://facebook.com", label: "Vroomly on Facebook", Icon: FacebookIcon },
  { href: "https://instagram.com", label: "Vroomly on Instagram", Icon: InstagramIcon },
  { href: "https://linkedin.com", label: "Vroomly on LinkedIn", Icon: LinkedInIcon },
  { href: "https://youtube.com", label: "Vroomly on YouTube", Icon: YouTubeIcon },
  { href: "https://github.com", label: "Vroomly on GitHub", Icon: GitHubIcon },
];

const columns = [
  {
    title: "Rent",
    links: [
      { href: "/cars", label: "Browse all cars" },
      { href: "/cars?category=suv", label: "SUVs" },
      { href: "/cars?fuelType=electric", label: "Electric cars" },
      { href: "/cars?category=convertible", label: "Convertibles" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Host",
    links: [
      { href: "/become-host", label: "Become a host" },
      { href: "/owner", label: "Host dashboard" },
      { href: "/owner/cars/new", label: "List your car" },
      { href: "/#faq", label: "Hosting FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create an account" },
      { href: "/dashboard/bookings", label: "My trips" },
      { href: "/dashboard/complaints", label: "Report a problem" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-neutral text-neutral-content">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo className="text-neutral-content" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-content/70">
            Vroomly connects people who need a car with neighbours whose cars sit parked. Real hosts, real reviews, secure card payments.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-primary hover:text-primary-content">
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="font-display text-xl font-bold text-white">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-content/70 transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-sm text-neutral-content/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Vroomly. Drive responsibly.</p>
          <p>
            Photography from{" "}
            <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
              Pexels
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
