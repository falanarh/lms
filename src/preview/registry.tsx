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
import TabsPreview from "@/components/ui/Tabs/Tabs.preview";
// import DiscussionCardPreview from "@/components/shared/DiscussionCard/DiscussionCard.preview";
import ForumListPreview from "@/components/shared/ForumList/ForumList.preview";
import ForumCardPreview from "@/components/shared/ForumList/ForumCard.preview";

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
    slug: "tabs",
    title: "Tabs",
    element: <TabsPreview />,
  },
    {
    slug: "forum-list",
    title: "ForumList",
    element: <ForumListPreview />,
  },
  {
    slug: "forum-card",
    title: "ForumCard",
    element: <ForumCardPreview />,
  },
];

export default PREVIEW_REGISTRY;
