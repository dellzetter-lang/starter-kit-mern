import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(login)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        <p className="text-sm text-destructive">{formState.errors.email?.message}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        <p className="text-sm text-destructive">{formState.errors.password?.message}</p>
      </div>
      <Button className="w-full" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? <LoadingSpinner className="p-0" label="Signing in" /> : "Sign in"}
      </Button>
    </form>
  );
}
