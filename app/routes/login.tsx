import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { AuthGuard } from "~/components/auth-guard";
import { useAuthStore } from "~/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "~/http/auth-api";
import { toast } from "sonner";
import type { ServerError } from "~/types/errors";
import { LoadingButton } from "~/components/ui/loading-button";
import type { LoginDTO } from "~/types/users";

const loginSchema = z.object({
  email: z.email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export function meta() {
  return [
    { title: "Iniciar sesión - Emergencias24 Admin" },
    {
      name: "description",
      content: "Inicia sesión para acceder al panel de administración",
    },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = location.state?.from?.pathname || "/";

  const form = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LoginDTO) => {
      return authApi.login(data);
    },
    onSuccess(data) {
      toast.success(`Bienvenido ${data.user.email}`);
      login(data);
      navigate(from);
    },
    onError(error: ServerError) {
      if (error.message) {
        toast.error(error.message);
      }
      console.log(error);
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    mutation.mutate(data);
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Iniciar sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al panel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          placeholder="Ingresa tu correo electrónico"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          disabled={mutation.isPending}
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoadingButton
                  loading={mutation.isPending}
                  disabled={mutation.isPending}
                  type="submit"
                  className="w-full"
                >
                  Iniciar sesión
                </LoadingButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
