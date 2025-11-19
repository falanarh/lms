import { ExternalLink, Link as LinkIcon } from "lucide-react";

interface LinkContentProps {
  url: string;
  title: string;
  description?: string;
  isSidebarOpen: boolean;
}

const isYouTubeUrl = (url: string): boolean => {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
};

const isVimeoUrl = (url: string): boolean => {
  return /vimeo\.com\/(?:channels\/|groups\/|album\/\d+\/video\/|video\/|)(\d+)/i.test(url);
};

const convertToYouTubeEmbed = (url: string): string => {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&showinfo=0`;
  }
  return url;
};

const convertToVimeoEmbed = (url: string): string => {
  const match = url.match(/vimeo\.com\/(?:channels\/|groups\/|album\/\d+\/video\/|video\/|)(\d+)/i);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};

export const LinkContent = ({ url, title, description, isSidebarOpen }: LinkContentProps) => {
  const isYoutube = isYouTubeUrl(url);
  const isVimeo = isVimeoUrl(url);
  const isVideo = isYoutube || isVimeo;

  let embedUrl = url;
  if (isYoutube) embedUrl = convertToYouTubeEmbed(url);
  else if (isVimeo) embedUrl = convertToVimeoEmbed(url);

  const displayUrl = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");

  if (isVideo) {
    return (
      <div className={`relative w-full rounded-md overflow-hidden transition-all duration-500 bg-black ${
        isSidebarOpen ? "aspect-[3/4] md:h-[520px]" : "aspect-[3/4] md:h-[520px]"
      }`}>
        <iframe
          src={embedUrl}
          className="w-full h-full object-contain"
          title={`${isYoutube ? "YouTube" : "Vimeo"} Video: ${title}`}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 border border-gray-200 shadow-sm ${
          isSidebarOpen ? "aspect-[3/4] md:h-[520px]" : "aspect-[3/4] md:h-[520px]"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-3 md:p-4 flex items-center gap-3 md:mb-2">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 leading-none" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-lg font-semibold text-gray-900 truncate mb-0.5">{title}</p>
            </div>
          </div>

          {description && (
            <p className="text-gray-600 text-xs md:text-base leading-relaxed whitespace-pre-line break-words px-3 md:px-4">
              {description}
            </p>
          )}

          <div className="flex-1 min-h-0 px-3 md:px-4 py-3 md:py-4">
            <div className="relative w-full h-full rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-2">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-900 truncate max-w-[92%] md:max-w-[80%]">{displayUrl}</p>
                <p className="mt-1 text-xs md:text-sm text-gray-600 max-w-[92%] md:max-w-[70%]">
                  Konten ini berada di situs eksternal dan akan dibuka di tab baru.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <ExternalLink className="w-4 h-4" />
                  Buka Link Eksternal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};