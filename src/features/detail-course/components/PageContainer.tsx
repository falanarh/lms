import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="min-h-screen">
      <div className="px-6 sm:px-8 lg:px-12 xl:px-16">
        {children}
      </div>
    </div>
  );
};
