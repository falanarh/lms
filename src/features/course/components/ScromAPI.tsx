"use client";

import { useEffect, useRef } from 'react';

interface ScormAPIProps {
  onInitialize?: () => void;
  onTerminate?: () => void;
  onCommit?: (data: any) => void;
  onSetValue?: (element: string, value: string) => void;
}

export function useScormAPI({
  onInitialize,
  onTerminate,
  onCommit,
  onSetValue,
}: ScormAPIProps = {}) {
  const dataStore = useRef<Record<string, string>>({});
  const initialized = useRef(false);

  useEffect(() => {
    // SCORM 1.2 API
    const API = {
      LMSInitialize: function(param: string): string {
        console.log('📚 SCORM API: LMSInitialize called');
        if (initialized.current) {
          console.warn('⚠️ SCORM already initialized');
          return 'false';
        }
        initialized.current = true;
        onInitialize?.();
        return 'true';
      },

      LMSFinish: function(param: string): string {
        console.log('📚 SCORM API: LMSFinish called');
        if (!initialized.current) {
          console.warn('⚠️ SCORM not initialized');
          return 'false';
        }
        initialized.current = false;
        onTerminate?.();
        return 'true';
      },

      LMSGetValue: function(element: string): string {
        console.log('📚 SCORM API: LMSGetValue', element);
        const value = dataStore.current[element] || '';
        console.log('  → Value:', value);
        return value;
      },

      LMSSetValue: function(element: string, value: string): string {
        console.log('📚 SCORM API: LMSSetValue', element, '=', value);
        dataStore.current[element] = value;
        onSetValue?.(element, value);
        return 'true';
      },

      LMSCommit: function(param: string): string {
        console.log('📚 SCORM API: LMSCommit called');
        onCommit?.(dataStore.current);
        return 'true';
      },

      LMSGetLastError: function(): string {
        return '0';
      },

      LMSGetErrorString: function(errorCode: string): string {
        return 'No error';
      },

      LMSGetDiagnostic: function(errorCode: string): string {
        return 'No error';
      },
    };

    // SCORM 2004 API (API_1484_11)
    const API_1484_11 = {
      Initialize: function(param: string): string {
        console.log('📚 SCORM 2004 API: Initialize called');
        if (initialized.current) {
          console.warn('⚠️ SCORM already initialized');
          return 'false';
        }
        initialized.current = true;
        onInitialize?.();
        return 'true';
      },

      Terminate: function(param: string): string {
        console.log('📚 SCORM 2004 API: Terminate called');
        if (!initialized.current) {
          console.warn('⚠️ SCORM not initialized');
          return 'false';
        }
        initialized.current = false;
        onTerminate?.();
        return 'true';
      },

      GetValue: function(element: string): string {
        console.log('📚 SCORM 2004 API: GetValue', element);
        const value = dataStore.current[element] || '';
        console.log('  → Value:', value);
        return value;
      },

      SetValue: function(element: string, value: string): string {
        console.log('📚 SCORM 2004 API: SetValue', element, '=', value);
        dataStore.current[element] = value;
        onSetValue?.(element, value);
        return 'true';
      },

      Commit: function(param: string): string {
        console.log('📚 SCORM 2004 API: Commit called');
        onCommit?.(dataStore.current);
        return 'true';
      },

      GetLastError: function(): string {
        return '0';
      },

      GetErrorString: function(errorCode: string): string {
        return 'No error';
      },

      GetDiagnostic: function(errorCode: string): string {
        return 'No error';
      },
    };

    // ✅ Inject APIs into window at multiple levels
    (window as any).API = API;
    (window as any).API_1484_11 = API_1484_11;
    
    // ✅ Also make it available on window.parent for frames
    try {
      if (window.parent && window.parent !== window) {
        (window.parent as any).API = API;
        (window.parent as any).API_1484_11 = API_1484_11;
      }
    } catch (e) {
      // Ignore cross-origin errors
    }

    // ✅ Helper function for SCORM content to find API
    (window as any).getAPIHandle = function() {
      console.log('🔍 getAPIHandle called - returning API');
      return API;
    };

    (window as any).API_1484_11_getAPIHandle = function() {
      console.log('🔍 API_1484_11_getAPIHandle called - returning API');
      return API_1484_11;
    };

    console.log('✅ SCORM API initialized on window');
    console.log('   - window.API (SCORM 1.2)');
    console.log('   - window.API_1484_11 (SCORM 2004)');
    console.log('   - window.getAPIHandle()');

    // Cleanup
    return () => {
      delete (window as any).API;
      delete (window as any).API_1484_11;
      delete (window as any).getAPIHandle;
      delete (window as any).API_1484_11_getAPIHandle;
      
      try {
        if (window.parent && window.parent !== window) {
          delete (window.parent as any).API;
          delete (window.parent as any).API_1484_11;
        }
      } catch (e) {
        // Ignore
      }
      
      console.log('🧹 SCORM API cleaned up');
    };
  }, [onInitialize, onTerminate, onCommit, onSetValue]);

  return { initialized: initialized.current, dataStore: dataStore.current };
}