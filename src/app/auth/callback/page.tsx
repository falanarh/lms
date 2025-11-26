"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // We cannot read JWT because cookie is httpOnly
    // Just redirect to /my-course
    router.push("/my-course");
  }, [router]);

  return <p>Logging you in...</p>;
}
