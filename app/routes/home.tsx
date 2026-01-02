import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
}
