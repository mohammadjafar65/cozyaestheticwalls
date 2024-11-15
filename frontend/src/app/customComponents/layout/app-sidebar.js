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
      <SidebarContent className="p-4">
        <div className="flex flex-col items-center gap-5 border border-[216 34% 17%] py-4 rounded-[10px]">
          <img
            src="../logo.png"
            className="w-9"
            alt="Cozy Aesthetic Wallpaper"
          />
          <h1>Cozy Aesthetic Wallpaper</h1>
        </div>
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
                    <span>{tag} ({count})</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
