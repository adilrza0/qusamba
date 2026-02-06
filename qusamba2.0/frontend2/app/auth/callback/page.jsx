"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, dispatch } = useAuth();
    const [status, setStatus] = useState("processing");
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get token from URL
                const token = searchParams.get("token");
                const errorParam = searchParams.get("error");

                if (errorParam) {
                    setStatus("error");
                    setError(getErrorMessage(errorParam));
                    setTimeout(() => router.push("/login"), 3000);
                    return;
                }

                if (!token) {
                    setStatus("error");
                    setError("No authentication token received");
                    setTimeout(() => router.push("/login"), 3000);
                    return;
                }

                // Store token and fetch user data
                // Use the correct token key that auth-context expects
                localStorage.setItem("qusamba-token", token);

                // Fetch user data
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const baseUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

                const response = await fetch(`${baseUrl}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const data = await response.json();
                const user = data.data.user;

                // Update auth context directly using dispatch
                if (dispatch) {
                    dispatch({
                        type: "LOGIN_SUCCESS",
                        payload: { user }
                    });
                }

                setStatus("success");

                // Redirect to dashboard or home
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } catch (err) {
                console.error("OAuth callback error:", err);
                setStatus("error");
                setError(err.message || "Authentication failed");
                setTimeout(() => router.push("/login"), 3000);
            }
        };

        handleCallback();
    }, [searchParams, router, login]);

    const getErrorMessage = (errorCode) => {
        const errorMessages = {
            authentication_failed: "Authentication failed. Please try again.",
            server_error: "Server error occurred. Please try again later.",
            google_auth_failed: "Google authentication failed. Please try again.",
        };
        return errorMessages[errorCode] || "An unknown error occurred";
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center space-y-4">
                {status === "processing" && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                        <h2 className="text-2xl font-semibold">Completing sign in...</h2>
                        <p className="text-muted-foreground">Please wait while we authenticate you</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
                        <p className="text-muted-foreground">Redirecting you to the app...</p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="h-12 w-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-red-600">Authentication Failed</h2>
                        <p className="text-muted-foreground">{error}</p>
                        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}
