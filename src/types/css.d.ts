declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@blocknote/mantine/style.css";
declare module "@blocknote/core/fonts/inter.css";
declare module "@blocknote/react/style.css";
