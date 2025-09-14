import ClientsApiClient from "@/api/client/client.api";
import { Client } from "@/api/client/client.types";
import CoachesApiClient from "@/api/coach/coach.api";
import { Coach } from "@/api/coach/coach.types";
import UsersApiClient from "@/api/users/users.api";
import { User } from "@/api/users/users.types";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [coachData, setCoachData] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch role-specific data from API
  useEffect(() => {
    const fetchRoleData = async () => {
      if (!user?.userId) return;

      setIsLoading(true);
      try {
        const usersApi = UsersApiClient.getInstance();
        const fetchedUser = await usersApi.getMe();
        setUserData(fetchedUser);
      } catch (error) {
        console.error("Error fetching role data:", error);
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
          const clientApi = ClientsApiClient.getInstance();
          let data = await clientApi.getByUserId(user.userId);
          data = {
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          };
          setClientData(data);
        } else if (userData.role === "COACH") {
          const coachApi = CoachesApiClient.getInstance();
          let data = await coachApi.getByUserId(user.userId);
          data = {
            ...data,
            user: {
              name: userData.name || "",
              email: userData.email || "",
              emailVerified: userData.emailVerified || false,
            },
          };
          setCoachData(data);
        }
      } catch (error) {
        console.error("Error fetching detailed data:", error);
      }
    };

    fetchRoleSpecificData();
  }, [userData, user]);

  if (!user) return null;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information Card */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-xl font-semibold">User Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                E-mail
              </label>
              <p className="text-base">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="text-base">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-base">{user.userId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Verified
              </label>
              <p className="text-base">
                {userData?.emailVerified ? "Yes" : "No"}
              </p>
              {userData?.emailVerified === false && (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">
                    Please verify your email to access all features.
                  </p>
                  <button
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => navigate("/verify-email")}
                  >
                    Verify Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client-specific Card */}
        {user.role === "CLIENT" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Client Information</h2>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : clientData ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-base">
                    {clientData.user?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">
                    {clientData.user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </label>
                  <p className="text-base">
                    {clientData.dateOfBirth
                      ? new Date(clientData.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Assigned Coach
                  </label>
                  <p className="text-base">
                    {clientData.coachId || "No coach assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Looking for Coach
                  </label>
                  <p className="text-base">
                    {clientData.lookingForCoach ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No client data found</div>
            )}
          </div>
        )}

        {/* Coach-specific Card */}
        {user.role === "COACH" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Coach Information</h2>
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : coachData ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-base">
                    {coachData.user?.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-base">
                    {coachData.user?.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Certification
                  </label>
                  <p className="text-base">
                    {coachData.certification || "Not specified"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No coach data found</div>
            )}
          </div>
        )}

        {/* Admin-specific Card */}
        {user.role === "ADMIN" && (
          <div className="bg-card rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold">Admin Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Access Level
                </label>
                <p className="text-base">Full System Access</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Permissions
                </label>
                <p className="text-base">
                  Manage Users, Coaches, Clients, and System Settings
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <p className="text-base">Today</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
