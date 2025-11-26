"use client";
import React, { useEffect, useRef, useState } from "react";

import { Loader2, AlertCircle } from "lucide-react";
import { useScormAPI } from "@/features/course/components/ScromAPI";

interface ScormPlayerProps {
  scormUrl: string;
  title?: string;
  height?: string | number;
  width?: string | number;
  onProgress?: (progress: any) => void;
  onComplete?: () => void;
}

export function ScormPlayer({
  scormUrl,
  title,
  height = "100%",
  width = "100%",
  onProgress,
  onComplete,
}: ScormPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scormDataRef = useRef<Record<string, any>>({});

  // Initialize SCORM API
  useScormAPI({
    onInitialize: () => {
      console.log("✅ SCORM Content initialized");
    },
    onTerminate: () => {
      console.log("✅ SCORM Content terminated");
      onComplete?.();
    },
    onCommit: (data) => {
      console.log("💾 SCORM Data committed:", data);

      // Check for completion
      if (
        data["cmi.core.lesson_status"] === "completed" ||
        data["cmi.completion_status"] === "completed"
      ) {
        onComplete?.();
      }

      // Report progress
      onProgress?.(data);
    },
    onSetValue: (element, value) => {
      console.log(`📝 SCORM Set: ${element} = ${value}`);

      // Track specific values
      if (element === "cmi.core.score.raw" || element === "cmi.score.raw") {
        console.log("📊 Score updated:", value);
      }
    },
  });

  const absoluteScormUrl = React.useMemo(() => {
    console.log("🔗 ScormPlayer received URL:", scormUrl);

    if (!scormUrl) {
      console.error("❌ No SCORM URL provided");
      return "";
    }

    if (scormUrl.startsWith("http://") || scormUrl.startsWith("https://")) {
      console.log("✅ Valid absolute URL");
      return scormUrl;
    }

    console.error("❌ Invalid URL - not absolute:", scormUrl);
    return "";
  }, [scormUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !absoluteScormUrl) return;

    // Setup postMessage communication for cross-origin SCORM API
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin if needed
      // if (!event.origin.includes('your-expected-domain')) return;

      const { type, method, element, value, callId } = event.data;

      if (type === "SCORM_API_CALL") {
        console.log("📨 Received SCORM API call:", { method, element, value });

        let result: any;
        let errorCode = "0";

        try {
          const api = (window as any).API || (window as any).API_1484_11;

          switch (method) {
            case "Initialize":
            case "LMSInitialize":
              result =
                api?.LMSInitialize?.("") || api?.Initialize?.("") || "true";
              break;

            case "Terminate":
            case "LMSFinish":
              result = api?.LMSFinish?.("") || api?.Terminate?.("") || "true";
              break;

            case "GetValue":
            case "LMSGetValue":
              result = scormDataRef.current[element] || "";
              break;

            case "SetValue":
            case "LMSSetValue":
              scormDataRef.current[element] = value;
              result = "true";

              // Trigger callbacks
              if (
                element === "cmi.core.lesson_status" ||
                element === "cmi.completion_status"
              ) {
                if (value === "completed") {
                  onComplete?.();
                }
              }
              onProgress?.(scormDataRef.current);
              break;

            case "Commit":
            case "LMSCommit":
              result = "true";
              onProgress?.(scormDataRef.current);
              break;

            case "GetLastError":
            case "LMSGetLastError":
              result = errorCode;
              break;

            case "GetErrorString":
            case "LMSGetErrorString":
              result = "No error";
              break;

            case "GetDiagnostic":
            case "LMSGetDiagnostic":
              result = "No diagnostic";
              break;

            default:
              result = "";
              errorCode = "101";
          }

          console.log("✅ SCORM API response:", { method, result, errorCode });
        } catch (error) {
          console.error("❌ SCORM API error:", error);
          result = "";
          errorCode = "101";
        }

        // Send response back to iframe
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "SCORM_API_RESPONSE",
              callId,
              result,
              errorCode,
            },
            "*",
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const handleLoad = () => {
      console.log("✅ SCORM iframe loaded");

      const outer = iframeRef.current;
      if (!outer) return;

      const inner = outer.contentDocument?.querySelector("iframe");

      if (!inner) {
        console.warn("⚠️ Inner SCORM iframe not found yet");
        return;
      }

      try {
        // Inject API proxies into the inner iframe
        if (inner.contentWindow) {
          (inner.contentWindow as any).API = (window as any).API;
          (inner.contentWindow as any).API_1484_11 = (window as any).API_1484_11;
        }

        console.log("🎉 Injected SCORM API into inner iframe successfully");
      } catch (err) {
        console.error("❌ Could not inject API into inner iframe", err);
      }

      setIsLoading(false);
      setLoadError(null);
    };

    const handleError = (e: ErrorEvent) => {
      console.error("❌ SCORM iframe failed to load:", e);
      setIsLoading(false);
      setLoadError("Failed to load SCORM content");
    };

    iframe.addEventListener("load", handleLoad);
    // @ts-ignore
    iframe.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("message", handleMessage);
      iframe.removeEventListener("load", handleLoad);
      // @ts-ignore
      iframe.removeEventListener("error", handleError);
    };
  }, [absoluteScormUrl, onProgress, onComplete]);

  if (!absoluteScormUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-600 p-6">
        <AlertCircle className="size-16 mb-4 text-red-400" />
        <p className="text-lg font-semibold mb-2">SCORM Loading Error</p>
        <p className="text-sm text-center max-w-md">
          The SCORM URL is invalid or missing. Please contact support if this
          problem persists.
        </p>
        {scormUrl && (
          <p className="text-xs mt-4 text-gray-500 font-mono bg-white px-3 py-2 rounded border border-red-200 max-w-full overflow-x-auto">
            Received: {scormUrl}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">
              Loading SCORM content...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50">
          <div className="text-center text-red-600 p-6 max-w-md">
            <AlertCircle className="size-16 mb-4 text-red-400 mx-auto" />
            <p className="font-semibold text-lg mb-2">
              Failed to load SCORM content
            </p>
            <p className="text-sm text-gray-600">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* SCORM iframe container - FIXED */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          ref={iframeRef}
          srcDoc={`
            <!DOCTYPE html>
            <html style="margin:0;padding:0;height:100%;overflow:hidden">
              <head>
                <script>
                  // API bridge for SCORM
                  (function () {
                    let callCounter = 0;
                    const pending = {};
                    function send(method, element, value) {
                      return new Promise((resolve) => {
                        const callId = ++callCounter;
                        pending[callId] = resolve;
                        parent.postMessage({ type:"SCORM_API_CALL", method, element, value, callId }, "*");
                        setTimeout(() => { if(pending[callId]) { pending[callId](""); delete pending[callId]; }}, 5000);
                      });
                    }
                    window.addEventListener("message", (event) => {
                      if(event.data.type==="SCORM_API_RESPONSE"){
                        const { callId, result } = event.data;
                        if(pending[callId]) { pending[callId](result); delete pending[callId]; }
                      }
                    });
                    window.API = { LMSInitialize: p=>send("LMSInitialize",p), LMSFinish: p=>send("LMSFinish",p), LMSGetValue: p=>send("LMSGetValue",p), LMSSetValue: (e,v)=>send("LMSSetValue",e,v), LMSCommit: p=>send("LMSCommit",p), LMSGetLastError: ()=>"0", LMSGetErrorString: ()=>"", LMSGetDiagnostic: ()=>"" };
                    window.API_1484_11 = { Initialize: p=>send("Initialize",p), Terminate: p=>send("Terminate",p), GetValue: p=>send("GetValue",p), SetValue: (e,v)=>send("SetValue",e,v), Commit: p=>send("Commit",p), GetLastError: ()=>"0", GetErrorString: ()=>"", GetDiagnostic: ()=>"" };
                  })();
                </script>
              </head>
              <body style="margin:0;padding:0;height:100%;overflow:hidden">
                <iframe src="${absoluteScormUrl}" style="border:0;width:100%;height:100%;display:block;"></iframe>
              </body>
            </html>
          `}
          className="w-full h-full border-0"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
