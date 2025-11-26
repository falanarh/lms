"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.push('/login?error=no_token');
      return;
    }

    // Simpan token
    localStorage.setItem('access_token', token);
    console.log('Token stored in localStorage:', `${token.substring(0, 50)}...`);

    // Bersihkan URL
    window.history.replaceState({}, document.title, '/auth/callback');

    // Small delay to ensure token is stored, then redirect
    setTimeout(() => {
      router.push('/my-course');
    }, 100);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-900 dark:text-white">Sedang login...</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

