import { useState, useEffect } from "react";
import {
  Calendar,
  Monitor,
  Tablet,
  Home,
  Smartphone,
  Inbox,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../../components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Phone",
    url: "/",
    icon: Smartphone,
  },
  // {
  //   title: "Desktop",
  //   url: "/desktop",
  //   icon: Monitor,
  // },
  // {
  //   title: "Tablet",
  //   url: "/tablet",
  //   icon: Tablet,
  // },
];

export function AppSidebar({
  wallpapers,
  setFilteredWallpapers,
  setActiveTag,
}) {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState("");

  useEffect(() => {
    // Calculate tags with their counts
    const calculateTagsWithCounts = () => {
      const tagCounts = wallpapers.reduce((acc, wallpaper) => {
        wallpaper.tags?.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {});
      return Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));
    };

    setTags(calculateTagsWithCounts());
  }, [wallpapers]);

  useEffect(() => {
    if (selectedTag) {
      const filtered = wallpapers.filter(
        (wallpaper) => wallpaper.tags && wallpaper.tags.includes(selectedTag)
      );
      setFilteredWallpapers(filtered);
      setActiveTag(selectedTag);
    } else {
      setFilteredWallpapers(wallpapers); // Show all wallpapers if no tag is selected
      setActiveTag("All Wallpapers");
    }
  }, [selectedTag, wallpapers, setFilteredWallpapers, setActiveTag]);

  const handleTagClick = (tag) => {
    setSelectedTag(tag); // Set the selected tag
  };

  const handleShowAllClick = () => {
    setSelectedTag(""); // Clear the selected tag to show all wallpapers
  };

  return (
    <Sidebar>
      <SidebarContent className="p-4 pt-[30%]">
        {/* <SidebarGroup>
          <SidebarGroupLabel className="mb-1">Device</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1">Category</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Show All Wallpapers option */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleShowAllClick}
                  className={!selectedTag ? "bg-blue-500 text-white" : ""}
                >
                  <span>All Wallpapers ({wallpapers.length})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Render individual tags */}
              {tags.map(({ tag, count }) => (
                <SidebarMenuItem key={tag}>
                  <SidebarMenuButton
                    onClick={() => handleTagClick(tag)}
                    className={
                      selectedTag === tag ? "bg-blue-500 text-white" : ""
                    }
                  >
                    <span>
                      {tag} ({count})
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pl-7 pb-7"><p className="text-[13px] text-gray-500">&copy; {new Date().getFullYear()} &nbsp;|&nbsp; All rights reserved</p></SidebarFooter>
    </Sidebar>
  );
}
