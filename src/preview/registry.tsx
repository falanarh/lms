"use client";
import React from "react";
import ButtonPreview from "@/components/Button/Button.preview";
import NavbarPreview from "@/components/Navbar/Navbar.preview";
import BreadcrumbPreview from "@/components/Breadcrumb/Breadcrumb.preview";
import DropdownPreview from "@/components/Dropdown/Dropdown.preview";
import PaginationPreview from "@/components/Pagination/Pagination.preview";
import InputPreview from "@/components/Input/Input.preview";
import TextareaPreview from "@/components/Textarea/Textarea.preview";
import FileUploadPreview from "@/components/FileUpload/FileUpload.preview";
import RadioButtonPreview from "@/components/RadioButton/RadioButton.preview";
import BadgePreview from "@/components/Badge/Badge.preview";
import TabsPreview from "@/components/Tabs/Tabs.preview";

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
