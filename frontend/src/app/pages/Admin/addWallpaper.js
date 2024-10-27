import { useState } from "react";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import axios from "axios";

const AddWallpaper = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("wallpaperImage", file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}api/wallpapers/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response.data);
      alert("Wallpaper uploaded successfully!");
      // Optionally clear form fields after upload
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Failed to upload wallpaper.");
    }
  };

  return (
    <div className="w-full h-[100vh] flex items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Add New Wallpaper</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title of the wallpaper"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="file">Wallpaper Image</Label>
                <Input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description of wallpaper for SEO"
                />
              </div>
            </div>
            <CardFooter className="flex justify-between w-full mt-5">
              <Button type="submit" className="w-full">
                Upload
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddWallpaper;
