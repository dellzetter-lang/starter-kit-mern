import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/LoginForm";
import { useAppPreset } from "@/hooks/useAppPreset";
import { authAlignClasses, authWidthClasses } from "@/lib/layout-classes";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";

export default function LoginPage() {
  const { auth, layout } = useAppPreset();
  const authLayout = layout.auth || {};

  return (
    <main className={cn("grid min-h-screen px-4 py-10", authAlignClasses[authLayout.cardAlign || "center"])}>
      <Card className={cn("w-full", authWidthClasses[authLayout.cardWidth || "md"])}>
        <CardHeader>
          <CardTitle>{auth.loginTitle}</CardTitle>
          <CardDescription>{auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link className="text-primary underline" to={ROUTES.REGISTER}>Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
