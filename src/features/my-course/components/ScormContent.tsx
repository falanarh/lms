import { Content } from "@/api/contents";

interface ScormContentProps {
  content: Content;
  isSidebarOpen: boolean;
}

export const ScormContent = ({ content, isSidebarOpen }: ScormContentProps) => {
  return (
    <div
      className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 ${
        isSidebarOpen ? "aspect-[3/4] md:h-[520px]" : "aspect-[3/4] md:h-[520px]"
      }`}
    >
      <iframe
        key={content.id}
        src={content.contentUrl}
        className="w-full h-full border-0"
        title={content.name}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-downloads"
        allow="fullscreen; autoplay; camera; microphone; geolocation"
        loading="lazy"
      />
    </div>
  );
};
