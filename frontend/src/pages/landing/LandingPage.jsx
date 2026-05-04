import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useAppPreset } from "@/hooks/useAppPreset";
import { ROUTES } from "@/utils/constants";

export default function LandingPage() {
  const preset = useAppPreset();
  const { landing } = preset;

  return (
    <PageWrapper className="grid min-h-[calc(100vh-9rem)] items-center">
      <section className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> {landing.badge}
        </div>
        <h1 className="text-4xl font-bold tracking-normal sm:text-6xl">{landing.title}</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {landing.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to={ROUTES.REGISTER}>{landing.primaryCta} <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.LOGIN}>{landing.secondaryCta}</Link>
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
}
