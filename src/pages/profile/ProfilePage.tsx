import ClientsApiClient from "@/api/client/client.api";
import CoachesApiClient from "@/api/coach/coach.api";
import UsersApiClient from "@/api/users/users.api";
import { User } from "@/api/users/users.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { formatDate } from "@/lib/date";
import { useClientStore } from "@/store/clientStore";
import { useCoachStore } from "@/store/coachStore";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";

function getInitials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    return name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function FactRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const coachStore = useCoachStore((s) => s);
  const clientStore = useClientStore((s) => s);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    dateOfBirth: "",
    bio: "",
    certification: "",
    lookingForCoach: false,
    lookingForClient: false,
  });

  const displayName =
    (user?.role === "CLIENT"
      ? clientStore.client?.user?.name
      : coachStore.coach?.user?.name) ??
    userData?.name ??
    "";

  const handleEditClick = () => {
    if (user?.role === "CLIENT" && clientStore.client) {
      let formattedDate = "";
      if (clientStore.client.dateOfBirth) {
        formattedDate = new Date(clientStore.client.dateOfBirth)
          .toISOString()
          .split("T")[0];
      }
      setEditForm({
        name: clientStore.client.user?.name || "",
        dateOfBirth: formattedDate,
        bio: clientStore.client.bio || "",
        certification: "",
        lookingForCoach: clientStore.client.lookingForCoach || false,
        lookingForClient: false,
      });
      setIsEditModalOpen(true);
    } else if (user?.role === "COACH" && coachStore.coach) {
      setEditForm({
        name: coachStore.coach.user?.name || "",
        dateOfBirth: "",
        bio: coachStore.coach.bio || "",
        certification: coachStore.coach.certification || "",
        lookingForCoach: false,
        lookingForClient: coachStore.coach.lookingForClient || false,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!user?.userId) return;
    setIsUpdating(true);
    try {
      const usersApi = UsersApiClient.getInstance();
      await usersApi.update(user.userId, { ...userData, name: editForm.name });

      if (user.role === "CLIENT" && clientStore.client) {
        const clientApi = ClientsApiClient.getInstance();
        await clientApi.update(clientStore.client.id, {
          dateOfBirth: new Date(editForm.dateOfBirth),
          bio: editForm.bio,
          lookingForCoach: editForm.lookingForCoach,
        });
        clientStore.setClient({
          ...clientStore.client,
          dateOfBirth: editForm.dateOfBirth
            ? new Date(editForm.dateOfBirth)
            : clientStore.client.dateOfBirth,
          bio: editForm.bio,
          lookingForCoach: editForm.lookingForCoach,
          user: {
            ...clientStore.client.user,
            name: editForm.name,
            email: clientStore.client.user?.email || "",
            emailVerified: clientStore.client.user?.emailVerified ?? false,
          },
        });
      } else if (user.role === "COACH" && coachStore.coach) {
        const coachApi = CoachesApiClient.getInstance();
        await coachApi.update(coachStore.coach.id, {
          bio: editForm.bio,
          certification: editForm.certification,
          lookingForClient: editForm.lookingForClient,
        });
        coachStore.setCoach({
          ...coachStore.coach,
          bio: editForm.bio,
          certification: editForm.certification,
          lookingForClient: editForm.lookingForClient,
          user: {
            ...coachStore.coach.user,
            name: editForm.name,
            email: coachStore.coach.user?.email || "",
            emailVerified: coachStore.coach.user?.emailVerified ?? false,
          },
        });
      }

      const updatedUser = await usersApi.getMe();
      setUserData(updatedUser);
      setIsEditModalOpen(false);
      showSuccess("Profile updated.");
    } catch (error) {
      showError(error, "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchRoleData = async () => {
      if (!user?.userId) return;
      setIsLoading(true);
      try {
        const fetchedUser = await UsersApiClient.getInstance().getMe();
        setUserData(fetchedUser);
      } catch (error) {
        showError(error, "Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoleData();
  }, [user]);

  useEffect(() => {
    const fetchRoleSpecificData = async () => {
      if (!userData || !user) return;
      try {
        if (userData.role === "CLIENT") {
          const data = await ClientsApiClient.getInstance().getByUserId(user.userId);
          clientStore.setClient({
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          });
        } else if (userData.role === "COACH") {
          const data = await CoachesApiClient.getInstance().getByUserId(user.userId);
          coachStore.setCoach({
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          });
        }
      } catch (error) {
        showError(error, "Failed to load role data.");
      }
    };
    fetchRoleSpecificData();
  }, [userData, user]);

  if (!user) return null;

  const canEdit = user.role === "CLIENT" || user.role === "COACH";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      {/* Hero card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="size-16 text-lg font-bold shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {getInitials(displayName, user.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold leading-tight">
                    {displayName || user.email}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{roleLabel(user.role)}</Badge>
                    {userData?.emailVerified === false && (
                      <Badge variant="destructive" className="text-xs">Unverified</Badge>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={handleEditClick} className="shrink-0">
                    Edit profile
                  </Button>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                <FactRow label="Email" value={user.email} />
                {userData?.createdAt && (
                  <FactRow label="Member since" value={formatDate(userData.createdAt)} />
                )}
                <FactRow
                  label="Email verified"
                  value={userData?.emailVerified ? "Yes" : "No"}
                />
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific details */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading profile…
          </CardContent>
        </Card>
      ) : user.role === "CLIENT" && clientStore.client ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <FactRow
                label="Date of birth"
                value={
                  clientStore.client.dateOfBirth
                    ? new Date(clientStore.client.dateOfBirth).toLocaleDateString()
                    : "—"
                }
              />
              <FactRow
                label="Coach assigned"
                value={clientStore.client.coachId ? "Yes" : "None"}
              />
              <div className="sm:col-span-2">
                <FactRow
                  label="Bio"
                  value={clientStore.client.bio || <span className="text-muted-foreground italic">No bio yet</span>}
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Looking for coach
                </dt>
                <Switch checked={clientStore.client.lookingForCoach ?? false} disabled />
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : user.role === "COACH" && coachStore.coach ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coach details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <FactRow
                label="Certification"
                value={coachStore.coach.certification || <span className="text-muted-foreground italic">Not specified</span>}
              />
              <div className="flex items-center justify-between">
                <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Looking for clients
                </dt>
                <Switch checked={coachStore.coach.lookingForClient ?? false} disabled />
              </div>
              <div className="sm:col-span-2">
                <FactRow
                  label="Bio"
                  value={coachStore.coach.bio || <span className="text-muted-foreground italic">No bio yet</span>}
                />
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : user.role === "ADMIN" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin access</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <FactRow label="Access level" value="Full system access" />
              <FactRow label="Permissions" value="Manage users, coaches, clients, and settings" />
            </dl>
          </CardContent>
        </Card>
      ) : null}

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email (read-only)</Label>
              <Input
                id="email"
                type="email"
                value={
                  user.role === "CLIENT"
                    ? clientStore.client?.user?.email || ""
                    : coachStore.coach?.user?.email || ""
                }
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            {user.role === "CLIENT" && (
              <div className="space-y-1">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            {user.role === "COACH" && (
              <div className="space-y-1">
                <Label htmlFor="certification">Certification</Label>
                <Input
                  id="certification"
                  value={editForm.certification}
                  onChange={(e) => setEditForm({ ...editForm, certification: e.target.value })}
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="looking-toggle" className="cursor-pointer">
                Looking for {user.role === "CLIENT" ? "coach" : "client"}
              </Label>
              <Switch
                id="looking-toggle"
                checked={user.role === "CLIENT" ? editForm.lookingForCoach : editForm.lookingForClient}
                onCheckedChange={(checked) =>
                  setEditForm({
                    ...editForm,
                    [user.role === "CLIENT" ? "lookingForCoach" : "lookingForClient"]: checked,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
