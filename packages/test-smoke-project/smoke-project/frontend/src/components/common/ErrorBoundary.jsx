import { Component } from "react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render crash", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">Something broke</h1>
          <p className="text-muted-foreground">Refresh the page or return home to keep working.</p>
          <Button onClick={() => window.location.assign("/")}>Return home</Button>
        </section>
      </main>
    );
  }
}
