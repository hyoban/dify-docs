import type { MDXComponents } from "mdx/types";

import { Icon as IconifyIcon } from "@iconify/react";
import { Accordion as FumaAccordion, Accordions } from "fumadocs-ui/components/accordion";
import { Callout } from "fumadocs-ui/components/callout";
import { Card as FumaCard, Cards } from "fumadocs-ui/components/card";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { Tab as FumaTab, Tabs as FumaTabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import React, { Children, isValidElement, type ComponentProps, type ReactNode } from "react";

import { APIPage } from "@/components/api-page";

// Wrapped Card component - accepts string icon names for @iconify/react
function Card({
  icon,
  ...props
}: Omit<ComponentProps<typeof FumaCard>, "icon"> & { icon?: ReactNode | string }) {
  const iconElement = typeof icon === "string" ? <IconifyIcon icon={icon} /> : icon;
  return <FumaCard icon={iconElement} {...props} />;
}

// Mintlify Tab - converts title prop to value prop for fumadocs
function Tab({ title, value, children }: { title?: string; value?: string; children: ReactNode }) {
  // Use title as value if value is not provided (Mintlify compatibility)
  const tabValue = value || title || "tab";
  return <FumaTab value={tabValue}>{children}</FumaTab>;
}

// Mintlify Tabs - extracts titles from children to create items array
function Tabs({ children }: { children: ReactNode }) {
  // Extract tab values/titles from children
  const items: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      const props = child.props as { title?: string; value?: string };
      const value = props.value || props.title || `tab-${items.length}`;
      items.push(value);
    }
  });

  return (
    <FumaTabs items={items} defaultValue={items[0]}>
      {children}
    </FumaTabs>
  );
}

// CodeGroup - same as Tabs but for code blocks
function CodeGroup({ children }: { children: ReactNode }) {
  return <Tabs>{children}</Tabs>;
}

// Mintlify Accordion - wraps single accordion in Accordions container
function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Accordions type="single" collapsible>
      <FumaAccordion title={title}>{children}</FumaAccordion>
    </Accordions>
  );
}

// Mintlify Frame component - wraps content with optional caption
function Frame({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="my-4">
      <div className="overflow-hidden rounded-lg border">{children}</div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-fd-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Mintlify Check component - checkmark icon
function Check() {
  return (
    <span className="inline-flex items-center text-green-500" aria-label="check">
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

// Mintlify Icon component
function Icon({ icon, iconType }: { icon: string; iconType?: string }) {
  return <span className="inline-block" data-icon={icon} data-icon-type={iconType} />;
}

// Mintlify Snippet component - code snippet display
function Snippet({ file, children }: { file?: string; children?: ReactNode }) {
  return (
    <div className="my-4">
      {file && <div className="text-sm text-fd-muted-foreground mb-1">{file}</div>}
      {children}
    </div>
  );
}

// Mintlify CheckList components
function CheckList({ children }: { children: ReactNode }) {
  return <ul className="my-4 list-none space-y-2 pl-0">{children}</ul>;
}

function CheckListItem({ children }: { id?: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="inline-flex items-center text-green-500 mt-0.5" aria-hidden="true">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

// Mintlify ResponseField component
function ResponseField({
  name,
  type,
  required,
  children,
}: {
  name: string;
  type?: string;
  required?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="my-2 border-l-2 border-fd-border pl-4">
      <div className="font-mono text-sm">
        <span className="font-semibold">{name}</span>
        {type && <span className="text-fd-muted-foreground ml-2">{type}</span>}
        {required && <span className="text-red-500 ml-2">required</span>}
      </div>
      {children && <div className="text-sm text-fd-muted-foreground mt-1">{children}</div>}
    </div>
  );
}

// Mintlify ParamField component
function ParamField({
  path,
  query,
  body,
  header,
  required,
  type,
  default: defaultValue,
  children,
}: {
  path?: string;
  query?: string;
  body?: string;
  header?: string;
  required?: boolean;
  type?: string;
  default?: string;
  children?: ReactNode;
}) {
  const name = path || query || body || header || "";
  const location = path ? "path" : query ? "query" : body ? "body" : header ? "header" : "";

  return (
    <div className="my-3 border-l-2 border-fd-border pl-4">
      <div className="font-mono text-sm">
        <span className="font-semibold">{name}</span>
        {type && <span className="text-fd-muted-foreground ml-2">{type}</span>}
        {location && <span className="text-fd-muted-foreground ml-2">({location})</span>}
        {required && <span className="text-red-500 ml-2">required</span>}
        {defaultValue && (
          <span className="text-fd-muted-foreground ml-2">default: {defaultValue}</span>
        )}
      </div>
      {children && <div className="text-sm mt-1">{children}</div>}
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    // Mintlify compatibility aliases
    Info: (props: React.ComponentProps<typeof Callout>) => <Callout type="info" {...props} />,
    Warning: (props: React.ComponentProps<typeof Callout>) => <Callout type="warn" {...props} />,
    Note: (props: React.ComponentProps<typeof Callout>) => <Callout type="info" {...props} />,
    Tip: (props: React.ComponentProps<typeof Callout>) => <Callout type="info" {...props} />,
    Danger: (props: React.ComponentProps<typeof Callout>) => <Callout type="error" {...props} />,
    CardGroup: Cards,
    Card,
    Tabs,
    Tab,
    Steps,
    Step,
    Accordion,
    AccordionGroup: Accordions,
    Accordions,
    // Additional Mintlify components
    Frame,
    Check,
    Icon,
    Snippet,
    ResponseField,
    ParamField,
    CodeGroup,
    CheckList,
    CheckListItem,
    APIPage,
    ...components,
  };
}
