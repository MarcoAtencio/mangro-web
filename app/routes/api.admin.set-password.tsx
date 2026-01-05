import type { ActionFunctionArgs } from "react-router";
import { getAdminAuth } from "~/lib/firebase.server";
import { data } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const uid = formData.get("uid") as string;
    const newPassword = formData.get("password") as string;

    if (!uid || !newPassword) {
      return data({ error: "Missing required fields" }, { status: 400 });
    }

    const auth = getAdminAuth();
    await auth.updateUser(uid, {
      password: newPassword,
    });

    return data({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error setting password:", error);
    return data({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}
