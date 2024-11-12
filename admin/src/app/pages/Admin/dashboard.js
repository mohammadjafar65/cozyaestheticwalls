import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import axios from "axios";
import Layout from "../Custom-Components/layout";
import {
  SidebarProvider,
  SidebarTrigger,
} from "../../../components/ui/sidebar";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import AddWallpaper from "./addWallpaper";

const Dashboard = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img
          src={`${process.env.REACT_APP_API_URL}${row.original.url}`}
          alt="Wallpaper"
          className="w-[100px] h-[100px] object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    // {
    //   accessorKey: "description",
    //   header: "Description",
    // },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          onClick={() => handleDelete(row.original.id)}
          className="bg-red-500 text-white"
        >
          <Trash2 /> Delete
        </Button>
      ),
    },
  ];

  // Fetch wallpapers from the API
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/wallpapers`)
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
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/wallpapers/${id}`
        );
        setWallpapers(wallpapers.filter((wallpaper) => wallpaper.id !== id));
        alert("Wallpaper deleted successfully!");
      } catch (error) {
        console.error("Failed to delete wallpaper:", error);
        alert("Failed to delete wallpaper.");
      }
    }
  };

  const table = useReactTable({
    data: wallpapers,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading) {
    return <p>Loading wallpapers...</p>;
  }

  return (
    <Layout>
      <div className="p-8 w-full">
        <div className="mb-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-5">
            <SidebarTrigger className="" />
          </div>
          <AddWallpaper/>
          {/* <a href="/addwallpaper">
            <Button className="bg-blue-500 text-white">Add Wallpaper</Button>
          </a> */}
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between py-4 w-full">
            <h1 className="text-[25px]">Dashboard</h1>
            <Input
              placeholder="Filter by title..."
              value={table.getColumn("title")?.getFilterValue() ?? ""}
              onChange={(e) =>
                table.getColumn("title")?.setFilterValue(e.target.value)
              }
              className="max-w-sm bg-[#18181B] border-[216 34% 17%] focus-visible:ring-offset-0"
            />
          </div>
          <div className="rounded-md border w-full">
            <Table className="w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-[#18181B]">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-[#18181B]"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
