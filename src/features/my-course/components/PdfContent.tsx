import { Content } from "@/api/contents";

interface PdfContentProps {
  content: Content;
  isSidebarOpen: boolean;
}

export const PdfContent = ({ content, isSidebarOpen }: PdfContentProps) => {
  return (
    <div
      className={`relative w-full bg-white rounded-md overflow-hidden transition-all duration-500 ${
        isSidebarOpen
          ? "aspect-3/4 md:aspect-auto md:h-[520px] md:min-h-[520px] md:max-h-[520px]"
          : "aspect-3/4 md:aspect-auto md:h-[520px] md:min-h-[520px] md:max-h-[520px]"
      }`}
    >
      <iframe
        key={content.id}
        src={content.contentUrl || ""}
        className="w-full h-full"
        title={content.name}
      />
    </div>
  );
};
