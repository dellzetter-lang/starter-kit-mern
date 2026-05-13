import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants";

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">The route you requested does not exist.</p>
        <Button asChild>
          <Link to={ROUTES.HOME}>Go home</Link>
        </Button>
      </section>
    </main>
  );
}
