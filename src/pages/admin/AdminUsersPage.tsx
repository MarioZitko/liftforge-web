import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { useEffect, useState } from "react";
import { Column, ServerQuery } from "@/components/shared/DataTable/types";
import { User } from "@/api/users/users.types";
import UsersApiClient from "@/api/users/users.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import UserFormModal from "./UserFormModal";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AdminUsersPage() {
	const usersApi = UsersApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "email",
		ascending: true,
	});

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [editUser, setEditUser] = useState<User | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const fetchUsers = () => {
		setLoading(true);
		usersApi
			.getAll()
			.then(setUsers)
			.catch(() => showError("Failed to fetch users"))
			.finally(() => setLoading(false));
	};

	useEffect(fetchUsers, []);

	const handleDelete = async (id: string) => {
		try {
			await usersApi.delete(id);
			showSuccess("User deleted");
			fetchUsers();
		} catch {
			showError("Failed to delete user");
		}
	};

	const filtered = users.filter((u) =>
		u.email.toLowerCase().includes((query.searchText ?? "").toLowerCase())
	);
	const sorted = [...filtered].sort((a, b) => {
		const key = query.orderByProperty as keyof User;
		const valA = a[key] ?? "";
		const valB = b[key] ?? "";
		return query.ascending
			? String(valA).localeCompare(String(valB))
			: String(valB).localeCompare(String(valA));
	});
	const paged = sorted.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<User>[] = [
		{ key: "email", label: "Email", sortable: true },
		{ key: "name", label: "Name", sortable: true },
		{
			key: "role",
			label: "Role",
			render: (u) => <Badge>{u.role}</Badge>,
		},
		{
			key: "emailVerified",
			label: "Verified",
			render: (u) => (
				<Badge variant={u.emailVerified ? "default" : "destructive"}>
					{u.emailVerified ? "Yes" : "No"}
				</Badge>
			),
		},
		{
			key: "id",
			label: "Actions",
			render: (u) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditUser(u);
							setShowModal(true);
						}}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setUserToDelete(u)}
					>
						Delete
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
				<h1 className="text-2xl font-bold">User Administration</h1>

				<Card>
					<CardHeader className="flex flex-row justify-between items-center">
						<div>
							<CardTitle>All Users</CardTitle>
							<CardDescription>Manage registered users</CardDescription>
						</div>
						<Button
							onClick={() => {
								setEditUser(null);
								setShowModal(true);
							}}
						>
							Create User
						</Button>
					</CardHeader>
					<CardContent>
						<ServerTable<User>
							data={paged}
							columns={columns}
							totalCount={filtered.length}
							loading={loading}
							query={query}
							setQuery={setQuery}
							getRowId={(row) => row.id}
						/>
					</CardContent>
				</Card>

				<UserFormModal
					open={showModal}
					onClose={() => setShowModal(false)}
					onSuccess={() => {
						fetchUsers();
						setShowModal(false);
					}}
					user={editUser}
				/>
			</div>

			{userToDelete && (
				<AlertDialog
					open={!!userToDelete}
					onOpenChange={() => setUserToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete user "{userToDelete?.email}"?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. The user and their data will be
								permanently deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setUserToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									if (userToDelete) {
										await handleDelete(userToDelete.id);
										setUserToDelete(null);
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}
