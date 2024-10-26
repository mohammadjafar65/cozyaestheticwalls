import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import axios from "axios";

const Dashboard = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch wallpapers from the API
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/wallpapers")
      .then((response) => {
        setWallpapers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching wallpapers:", error);
        setLoading(false);
      });
  }, []);

  // Handle wallpaper deletion
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this wallpaper?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/wallpapers/${id}`);
        // Update the wallpapers state after deletion
        setWallpapers(wallpapers.filter((wallpaper) => wallpaper.id !== id));

        alert("Wallpaper deleted successfully!");
      } catch (error) {
        console.error("Failed to delete wallpaper:", error);
        alert("Failed to delete wallpaper.");
      }
    }
  };

  if (loading) {
    return <p>Loading wallpapers...</p>;
  }

  return (
    <div className="p-8">
      <div className="mb-4">
        <a href="/addwallpaper">
          <Button className="bg-blue-500 text-white">Add Wallpaper</Button>
        </a>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallpapers.length ? (
            wallpapers.map((wallpaper) => (
              <TableRow key={wallpaper.id}>
                <TableCell>{wallpaper.title}</TableCell>
                <TableCell>{wallpaper.description}</TableCell>
                <TableCell>
                  <img
                    src={`http://localhost:5000${wallpaper.url}`}
                    alt="Wallpaper"
                    className="w-[75px] h-[75px] object-cover rounded"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(wallpaper.id)}
                    className="bg-red-500 text-white"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Dashboard;
