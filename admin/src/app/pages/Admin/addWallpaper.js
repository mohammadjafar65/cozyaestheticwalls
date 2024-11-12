import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import axios from "axios";

const AddWallpaper = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form refresh
    if (files.length === 0 || !category) {
      alert("Please select at least one file and a category to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    // Append each selected file to form data
    files.forEach((file) => {
      formData.append("wallpaperImages", file);
    });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/wallpapers/upload-multiple`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log(response.data);
      alert("Wallpapers uploaded successfully!");
      // Optionally clear form fields after upload
      setTitle("");
      setDescription("");
      setFiles([]);
      setCategory("");
    } catch (error) {
      console.error(error);
      alert("Failed to upload wallpapers.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="bg-blue-500 text-white"><Plus /> Add Wallpaper</Button>
      </DialogTrigger>
      <DialogContent className="bg-transparent border-none">
        <DialogHeader>
          {/* <DialogTitle>Are you absolutely sure?</DialogTitle> */}
          <DialogDescription>
            <Card className="w-[450px] bg-[#18181B] border-[216 34% 17%]">
              <CardHeader>
                <CardTitle className="text-white font-normal">Add New Wallpaper</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="text-white">
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title of the wallpaper collection"
                        className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="file">Wallpaper Images</Label>
                      <Input
                        type="file"
                        id="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                        className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0 text-white file:text-white"
                      />
                    </div>
                    {/* <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description of wallpaper for SEO"
                        className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0"
                      />
                    </div> */}
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="category">Choose Device</Label>
                      <Select
                        value={category}
                        onValueChange={(value) => setCategory(value)}
                        placeholder="Select a Device"
                        className="w-full"
                      >
                        <SelectTrigger className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0">
                          <SelectValue placeholder="Select Device" />
                        </SelectTrigger>
                        <SelectContent className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0 text-white">
                          <SelectItem value="Phone">Phone</SelectItem>
                          <SelectItem value="Desktop">Desktop</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardFooter className="flex justify-between w-full mt-5 p-0">
                    <Button type="submit" className="w-full bg-blue-500 text-white">
                      Upload
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddWallpaper;
