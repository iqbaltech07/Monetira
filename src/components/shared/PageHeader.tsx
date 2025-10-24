import type React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col mb-4">
      <div>
        <h1 className="font-poppins text-2xl font-bold md:text-4xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2 font-medium text-base md:text-lg">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 lg:-mt-4 w-full flex justify-end items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
