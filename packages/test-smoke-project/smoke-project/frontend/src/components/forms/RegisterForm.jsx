import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function RegisterForm() {
  const { register: createAccount } = useAuth();
  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(createAccount)}>
      {["name", "email", "password"].map((field) => (
        <div className="space-y-2" key={field}>
          <Label htmlFor={field}>{field === "name" ? "Name" : field === "email" ? "Email" : "Password"}</Label>
          <Input id={field} type={field === "password" ? "password" : field} autoComplete={field} {...register(field)} />
          <p className="text-sm text-destructive">{formState.errors[field]?.message}</p>
        </div>
      ))}
      <Button className="w-full" disabled={formState.isSubmitting}>Create account</Button>
    </form>
  );
}
