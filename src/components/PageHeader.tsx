import { Reveal } from "./ui/Reveal";
import { Eyebrow } from "./ui/Eyebrow";
import { Crest } from "./Logo";

export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden
        className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_80%_70%_at_30%_0%,#000,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute -left-20 -top-32 h-96 w-[36rem] rounded-full bg-moss/30 blur-[120px]"
      />
      <Crest className="pointer-events-none absolute -right-10 top-10 hidden h-[130%] w-auto opacity-[0.07] md:block" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-36 md:pb-20 md:pt-44 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:px-8">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-[clamp(3.8rem,9vw,8.5rem)] text-ivory">
            {title}
            {accent && (
              <>
                {" "}
                <span className="text-metal">{accent}</span>
              </>
            )}
          </h1>
        </Reveal>
        {children && (
          <Reveal i={1}>
            <p className="max-w-md text-base leading-7 text-muted">{children}</p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
