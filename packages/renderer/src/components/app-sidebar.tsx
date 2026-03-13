import type { ComponentProps } from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@app/ui/components/sidebar";

const data = {
  navMain: [
    {
      items: [
        {
          isActive: true,
          title: "Overview",
          url: "#overview",
        },
        {
          title: "Project Structure",
          url: "#project-structure",
        },
      ],
      title: "Foundation",
      url: "#overview",
    },
    {
      items: [
        {
          title: "Development Loop",
          url: "#dev-loop",
        },
        {
          title: "Quality Gates",
          url: "#quality",
        },
        {
          title: "shadcn Blocks",
          url: "https://ui.shadcn.com/blocks",
        },
      ],
      title: "Workflow",
      url: "#dev-loop",
    },
    {
      items: [
        {
          title: "pnpm start",
          url: "#commands",
        },
        {
          title: "pnpm build",
          url: "#commands",
        },
      ],
      title: "Commands",
      url: "#commands",
    },
  ],
  versions: ["1.0.0", "1.1.0", "next"],
};

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher defaultVersion={data.versions[0]} versions={data.versions} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
