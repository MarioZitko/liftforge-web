import UsersApiClient from "@/api/users/users.api";
import {
  CreateUserDto,
  FormUserData,
  UpdateUserDto,
} from "@/api/users/users.types";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { IAdminUsersPageProps } from "./types";

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(["CLIENT", "COACH", "ADMIN"]),
  emailVerified: z.boolean().optional(),
});

export default function UserFormModal({
  open,
  onClose,
  onSuccess,
  user,
}: IAdminUsersPageProps) {
  const usersApi = UsersApiClient.getInstance();

  const form = useForm<FormUserData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "CLIENT",
      emailVerified: false,
    },
  });

  useEffect(() => {
    form.reset({
      email: user?.email ?? "",
      name: user?.name ?? "",
      password: "",
      role: user?.role ?? "CLIENT",
      emailVerified: user?.emailVerified ?? false,
    });
  }, [user, form]);

  const handleSubmit = async (data: FormUserData) => {
    try {
      if (user) {
        const updateData: UpdateUserDto = {
          email: data.email,
          name: data.name,
          role: data.role,
          password: data.password?.trim() || undefined,
          emailVerified: data.emailVerified ?? false,
        };
        await usersApi.update(user.id, updateData);
        showSuccess("User updated");
      } else {
        if (!data.password || data.password.trim().length < 6) {
          showError("Password must be at least 6 characters");
          return;
        }
        const createData: CreateUserDto = {
          email: data.email,
          name: data.name,
          role: data.role,
          password: data.password.trim(),
          emailVerified: data.emailVerified ?? false,
        };
        await usersApi.create(createData);
        showSuccess("User created");
      }
      onSuccess();
    } catch {
      showError("Failed to save user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent forceMount>
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      value={field.value || ""}
                      placeholder={
                        user ? "Leave empty to keep current" : "Enter password"
                      }
                    />
                  </FormControl>
                  {user && (
                    <p className="text-xs text-muted-foreground">
                      Leave blank to keep the current password.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded border border-input bg-background text-foreground px-2 py-2"
                      {...field}
                    >
                      <option value="CLIENT">Client</option>
                      <option value="COACH">Coach</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="emailVerified"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mr-2"
                    />
                  </FormControl>
                  <FormLabel className="m-0">Email Verified</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {user ? "Update" : "Create"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
