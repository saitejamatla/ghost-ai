import {
  BrainCircuit,
  Ghost,
  ScrollText,
  Share2,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BrainCircuit,
    title: "AI Architecture Generation",
    description: "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Share2,
    title: "Real-time Collaboration",
    description: "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: ScrollText,
    title: "Instant Spec Generation",
    description: "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-1 bg-base">
      <aside className="hidden flex-1 flex-col border-r border-surface-border bg-surface px-16 py-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
            <Ghost className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-semibold text-copy-primary">
            Ghost AI
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-12">
          <div className="max-w-xl space-y-6">
            <h1 className="text-5xl leading-tight font-bold tracking-tight text-copy-primary">
              Design systems at the speed of thought.
            </h1>
            <p className="text-lg leading-relaxed text-copy-secondary">
              Describe your architecture in plain English. Ghost AI maps it to a
              shared canvas your whole team can refine in real time.
            </p>
          </div>

          <ul className="space-y-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-dim">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-copy-primary">{title}</p>
                  <p className="text-sm text-copy-muted">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
