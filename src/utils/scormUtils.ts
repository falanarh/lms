/**
 * SCORM Utility Functions
 * Handles SCORM package processing by communicating with a backend extraction service.
 */

// Interfaces remain the same, as they match the data structure
export interface ScormManifest {
  organization?: string;
  title: string;
  description?: string;
  entryUrl: string;
  resources: ScormResource[];
  schema?: string;
  version?: string;
}

export interface ScormResource {
  identifier: string;
  type: string;
  href?: string;
  scormType?: string;
}

// --- NEW INTERFACE for the API response ---
export interface ScormExtractionResponse {
  success: boolean;
  data?: {
    manifest: ScormManifest;
    launchUrl: string; // The complete URL to load in the iframe
  };
  message?: string;
}

/**
 * Fetches a SCORM manifest by calling the backend extraction service.
 * This is the primary function to get SCORM data.
 */
export async function fetchScormManifest(scormUrl: string): Promise<(ScormManifest & { launchUrl: string }) | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_COURSE_BASE_URL || 'http://localhost:3000';
  const EXTRACT_ENDPOINT = `${API_BASE_URL}/api/v1/scorm/extract`; // ✅ Add /api prefix
  
  try {
    console.log('🔍 Requesting SCORM extraction for:', scormUrl);
    console.log('📡 Using endpoint:', EXTRACT_ENDPOINT);
    
    const response = await fetch(EXTRACT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scormUrl }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend extraction failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Backend extraction failed: ${response.status} ${response.statusText}`);
    }

    const result: ScormExtractionResponse = await response.json();
    console.log('✅ Backend response:', result);

    if (result.success && result.data) {
      console.log('🎯 SCORM extraction successful!');
      console.log('🚀 Launch URL:', result.data.launchUrl);
      
      return {
        ...result.data.manifest,
        launchUrl: result.data.launchUrl,
      };
    } else {
      throw new Error(result.message || 'Invalid response from SCORM extraction service.');
    }
  } catch (error) {
    console.error('💥 Error during SCORM extraction:', error);
    // ✅ Re-throw the error with more context
    if (error instanceof Error) {
      throw new Error(`SCORM extraction failed: ${error.message}`);
    }
    throw new Error('SCORM extraction failed: Unknown error');
  }
}


/**
 * Constructs the SCORM launch URL.
 * This function is now simplified. It primarily checks if the manifest
 * already contains the launchUrl from the backend.
 */
export function buildScormLaunchUrl(
  baseUrl: string,
  entryUrl: string,
  manifest?: ScormManifest & { launchUrl?: string }
): string {
  // 1. Check if the manifest already has the launch URL from our backend
  if (manifest && 'launchUrl' in manifest && manifest.launchUrl) {
    return manifest.launchUrl;
  }

  // 2. If the entryUrl is already a full URL (e.g., for non-zip content), return it
  if (entryUrl.startsWith('http://') || entryUrl.startsWith('https://')) {
    return entryUrl;
  }
  
  // 3. If we reach here, it's an unexpected state. Log a warning.
  console.warn('buildScormLaunchUrl could not determine a launch URL. This may indicate a problem.');
  return '';
}

/**
 * Determines if a URL is a SCORM package.
 * This function remains useful for UI logic.
 */
export function isScormPackage(url: string): boolean {
  return /\.(zip|scorm)$/i.test(url) ||
         url.includes('scorm') ||
         url.includes('imsmanifest.xml');
}

/**
 * Generates a SCORM-friendly player configuration.
 * This function remains useful for configuring the player component.
 */
export function generateScormConfig(
  scormUrl: string,
  title?: string,
  options?: {
    width?: string | number;
    height?: string | number;
    autoplay?: boolean;
    debug?: boolean;
  }
) {
  return {
    url: scormUrl,
    title: title || 'SCORM Content',
    width: options?.width || '100%',
    height: options?.height || '600px',
    autoplay: options?.autoplay || false,
    debug: options?.debug || false,
    // SCORM API settings
    api: {
      logLevel: options?.debug ? 'debug' : 'warn',
      commitOnStatusChange: true,
      autoCommit: true
    }
  };
}