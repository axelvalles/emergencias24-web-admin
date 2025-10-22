import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { UserRole } from "~/lib/types";
import type { User, CreateUserDTO, UpdateUserDTO } from "~/lib/types";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.nativeEnum(UserRole).optional(),
});

// Mock data - replace with actual API calls
const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    role: UserRole.ADMIN,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    email: "doctor@example.com",
    role: UserRole.DOCTOR,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

export function meta() {
  return [
    { title: "User Management - Emergencias24 Admin" },
    { name: "description", content: "Manage users in the admin panel" },
  ];
}

export default function Users() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const createForm = useForm<CreateUserDTO>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      role: UserRole.PATIENT,
    },
  });

  const updateForm = useForm<UpdateUserDTO>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      password: "",
      role: UserRole.PATIENT,
    },
  });

  const onCreateUser = (data: CreateUserDTO) => {
    // TODO: Implement create user API call
    const newUser: User = {
      id: users.length + 1,
      email: data.email,
      role: data.role || UserRole.PATIENT,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    setUsers([...users, newUser]);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  const onUpdateUser = (data: UpdateUserDTO) => {
    if (!editingUser) return;
    // TODO: Implement update user API call
    const updatedUsers = users.map(user =>
      user.id === editingUser.id
        ? { ...user, ...data, updated_at: new Date() }
        : user
    );
    setUsers(updatedUsers);
    setEditingUser(null);
    updateForm.reset();
  };

  const onDeleteUser = (userId: number) => {
    // TODO: Implement delete user API call
    setUsers(users.filter(user => user.id !== userId));
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.DOCTOR:
        return "default";
      case UserRole.NURSE:
        return "secondary";
      case UserRole.RECEPTIONIST:
        return "outline";
      case UserRole.PATIENT:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate role and credentials.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateUser)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                          <SelectItem value={UserRole.DOCTOR}>Doctor</SelectItem>
                          <SelectItem value={UserRole.NURSE}>Nurse</SelectItem>
                          <SelectItem value={UserRole.RECEPTIONIST}>Receptionist</SelectItem>
                          <SelectItem value={UserRole.PATIENT}>Patient</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create User
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.created_at.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              updateForm.reset({
                                email: user.email,
                                role: user.role,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                              Update user information and role.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...updateForm}>
                            <form onSubmit={updateForm.handleSubmit(onUpdateUser)} className="space-y-4">
                              <FormField
                                control={updateForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={updateForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password (optional)</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Leave empty to keep current" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={updateForm.control}
                                name="role"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                        <SelectItem value={UserRole.DOCTOR}>Doctor</SelectItem>
                                        <SelectItem value={UserRole.NURSE}>Nurse</SelectItem>
                                        <SelectItem value={UserRole.RECEPTIONIST}>Receptionist</SelectItem>
                                        <SelectItem value={UserRole.PATIENT}>Patient</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button type="submit" className="w-full">
                                Update User
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}