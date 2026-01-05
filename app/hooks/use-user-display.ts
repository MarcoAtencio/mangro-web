import { useAuth } from "~/lib/auth";
import { USER_ROLE_LABELS, type UserRole } from "~/lib/constants";

interface UserDisplayInfo {
    displayName: string;
    displayEmail: string;
    initials: string;
    photoUrl: string | undefined;
    roleName: string | undefined;
}

/**
 * Hook to get user display information.
 * Centralizes the logic for displaying user name, email, initials, and photo.
 * Previously this logic was duplicated in Sidebar and MobileSidebar components.
 */
export function useUserDisplay(): UserDisplayInfo {
    const { user, userProfile } = useAuth();

    const displayName = userProfile?.fullName || user?.email?.split("@")[0] || "Usuario";
    const displayEmail = user?.email || "";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const photoUrl = userProfile?.photoUrl;
    const roleName = userProfile?.role ? USER_ROLE_LABELS[userProfile.role as UserRole] : undefined;

    return {
        displayName,
        displayEmail,
        initials,
        photoUrl,
        roleName,
    };
}
