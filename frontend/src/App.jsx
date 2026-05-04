import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { AppRouter } from "./routes/AppRouter";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}
