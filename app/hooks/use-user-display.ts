import { useAuth } from "~/lib/auth";

interface UserDisplayInfo {
    displayName: string;
    displayEmail: string;
    initials: string;
    photoUrl: string | undefined;
}

/**
 * Hook to get user display information.
 * Centralizes the logic for displaying user name, email, initials, and photo.
 * Previously this logic was duplicated in Sidebar and MobileSidebar components.
 */
export function useUserDisplay(): UserDisplayInfo {
    const { user, userProfile } = useAuth();

    const displayName = userProfile?.full_name || user?.email?.split("@")[0] || "Usuario";
    const displayEmail = user?.email || "";
    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    const photoUrl = userProfile?.photo_url;

    return {
        displayName,
        displayEmail,
        initials,
        photoUrl,
    };
}
