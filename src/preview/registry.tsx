"use client";
import React from "react";
import ButtonPreview from "@/components/ui/Button/Button.preview";
import NavbarPreview from "@/components/layout/Navbar/Navbar.preview";
import BreadcrumbPreview from "@/components/ui/Breadcrumb/Breadcrumb.preview";
import DropdownPreview from "@/components/ui/Dropdown/Dropdown.preview";
import PaginationPreview from "@/components/shared/Pagination/Pagination.preview";
import InputPreview from "@/components/ui/Input/Input.preview";
import TextareaPreview from "@/components/ui/Textarea/Textarea.preview";
import FileUploadPreview from "@/components/ui/FileUpload/FileUpload.preview";
import RadioButtonPreview from "@/components/ui/RadioButton/RadioButton.preview";
import BadgePreview from "@/components/ui/Badge/Badge.preview";
import TabsPreview from "@/components/ui/Tabs/Tabs.preview";

export type PreviewEntry = {
  slug: string;
  title: string;
  element: React.ReactNode;
};

export const PREVIEW_REGISTRY: PreviewEntry[] = [
  {
    slug: "button",
    title: "Button",
    element: <ButtonPreview />,
  },
  {
    slug: "navbar",
    title: "Navbar",
    element: <NavbarPreview />,
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    element: <BreadcrumbPreview />,
  },
  {
    slug: "dropdown",
    title: "Dropdown",
    element: <DropdownPreview />,
  },
  {
    slug: "pagination",
    title: "Pagination",
    element: <PaginationPreview />,
  },
  {
    slug: "input",
    title: "Input",
    element: <InputPreview />,
  },
  {
    slug: "textarea",
    title: "Textarea",
    element: <TextareaPreview />,
  },
  {
    slug: "file-upload",
    title: "FileUpload",
    element: <FileUploadPreview />,
  },
  {
    slug: "radio-button",
    title: "RadioButton",
    element: <RadioButtonPreview />,
  },
  {
    slug: "badge",
    title: "Badge",
    element: <BadgePreview />,
  },
  {
    slug: "tabs",
    title: "Tabs",
    element: <TabsPreview />,
  },
];

export default PREVIEW_REGISTRY;
