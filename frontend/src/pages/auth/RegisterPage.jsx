import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { useAppPreset } from "@/hooks/useAppPreset";
import { authAlignClasses, authWidthClasses } from "@/lib/layout-classes";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/constants";

export default function RegisterPage() {
  const { auth, layout } = useAppPreset();
  const authLayout = layout.auth || {};

  return (
    <main className={cn("grid min-h-screen px-4 py-10", authAlignClasses[authLayout.cardAlign || "center"])}>
      <Card className={cn("w-full", authWidthClasses[authLayout.cardWidth || "md"])}>
        <CardHeader>
          <CardTitle>{auth.registerTitle}</CardTitle>
          <CardDescription>{auth.registerDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Already registered? <Link className="text-primary underline" to={ROUTES.LOGIN}>Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
