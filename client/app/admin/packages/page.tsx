"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/lib/api/services/admin.service";
import { getDisplayName } from "@/lib/package-mapping";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  PackageIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  RefreshCwIcon,
  DollarSignIcon,
  HardDriveIcon,
  FolderIcon,
  FileIcon,
  LayersIcon,
  CheckCircleIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Package {
  id: number;
  name: string;
  description: string;
  maxFolders: number;
  maxNestingLevel: number;
  allowedFileTypes: string[];
  maxFileSize: string;
  totalFileLimit: string;
  filesPerFolder: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const packageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  maxFolders: z.number().min(1, "Must allow at least 1 folder"),
  maxNestingLevel: z.number().min(1, "Must allow at least 1 nesting level"),
  allowedFileTypes: z.string().min(1, "Must specify allowed file types"),
  maxFileSize: z.number().min(1, "Must specify max file size"),
  totalFileLimit: z.number().min(1, "Must specify total file limit"),
  filesPerFolder: z.number().min(1, "Must allow at least 1 file per folder"),
  price: z.number().min(0, "Price cannot be negative"),
});

type PackageFormData = z.infer<typeof packageSchema>;

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPackages();
      setPackages(data);
    } catch (error: any) {
      toast.error("Failed to load packages");
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: PackageFormData) => {
    try {
      setActionLoading(true);

      const packageData = {
        ...data,
        allowedFileTypes: data.allowedFileTypes.split(",").map((t) => t.trim()),
      };

      if (editingPackage) {
        await adminService.updatePackage(editingPackage.id, packageData);
        toast.success("Package updated successfully");
      } else {
        await adminService.createPackage(packageData);
        toast.success("Package created successfully");
      }

      setShowDialog(false);
      setEditingPackage(null);
      reset();
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to save package");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setValue("name", pkg.name);
    setValue("description", pkg.description);
    setValue("maxFolders", pkg.maxFolders);
    setValue("maxNestingLevel", pkg.maxNestingLevel);
    setValue("allowedFileTypes", pkg.allowedFileTypes.join(", "));
    setValue("maxFileSize", Number(pkg.maxFileSize));
    setValue("totalFileLimit", Number(pkg.totalFileLimit));
    setValue("filesPerFolder", pkg.filesPerFolder);
    setValue("price", pkg.price);
    setShowDialog(true);
  };

  const handleDelete = async (pkg: Package) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${pkg.name}" package? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await adminService.deletePackage(pkg.id);
      toast.success("Package deleted successfully");
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete package");
    }
  };

  const handleToggle = async (pkg: Package) => {
    try {
      await adminService.togglePackage(pkg.id);
      toast.success(
        `Package ${pkg.isActive ? "deactivated" : "activated"} successfully`,
      );
      loadPackages();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle package status");
    }
  };

  const formatBytes = (bytes: string | number) => {
    const numBytes = Number(bytes);
    if (numBytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const openCreateDialog = () => {
    setEditingPackage(null);
    reset({
      name: "",
      description: "",
      maxFolders: 10,
      maxNestingLevel: 3,
      allowedFileTypes: "image/jpeg, image/png, application/pdf",
      maxFileSize: 10485760, // 10MB
      totalFileLimit: 104857600, // 100MB
      filesPerFolder: 20,
      price: 0,
    });
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">
            Manage subscription packages and pricing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadPackages}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Packages
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Packages
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.filter((p) => p.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Packages</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.filter((p) => p.price === 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Packages</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {packages.filter((p) => p.price > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No packages found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first package to get started
            </p>
            <Button onClick={openCreateDialog}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{getDisplayName(pkg.name as any)}</span>
                      {!pkg.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {pkg.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold">
                    ${pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Max Folders</span>
                    </div>
                    <span className="font-medium">{pkg.maxFolders}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <LayersIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Nesting Level</span>
                    </div>
                    <span className="font-medium">{pkg.maxNestingLevel}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Files/Folder</span>
                    </div>
                    <span className="font-medium">{pkg.filesPerFolder}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Max File Size</span>
                    </div>
                    <span className="font-medium">
                      {formatBytes(pkg.maxFileSize)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Total Storage</span>
                    </div>
                    <span className="font-medium">
                      {formatBytes(pkg.totalFileLimit)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Switch
                      checked={pkg.isActive}
                      onCheckedChange={() => handleToggle(pkg)}
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(pkg)}
                  >
                    <EditIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(pkg)}
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-2">
                  <div>
                    Created: {new Date(pkg.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    Updated: {new Date(pkg.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
            <DialogDescription>
              {editingPackage
                ? "Update the package details below"
                : "Fill in the details to create a new subscription package"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleCreateOrUpdate)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Perfect for growing businesses"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="price">Price ($/month)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maxFolders">Max Folders</Label>
                <Input
                  id="maxFolders"
                  type="number"
                  placeholder="50"
                  {...register("maxFolders", { valueAsNumber: true })}
                />
                {errors.maxFolders && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.maxFolders.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maxNestingLevel">Max Nesting Level</Label>
                <Input
                  id="maxNestingLevel"
                  type="number"
                  placeholder="5"
                  {...register("maxNestingLevel", { valueAsNumber: true })}
                />
                {errors.maxNestingLevel && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.maxNestingLevel.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="filesPerFolder">Files Per Folder</Label>
                <Input
                  id="filesPerFolder"
                  type="number"
                  placeholder="100"
                  {...register("filesPerFolder", { valueAsNumber: true })}
                />
                {errors.filesPerFolder && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.filesPerFolder.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="maxFileSize">Max File Size (bytes)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  placeholder="52428800"
                  {...register("maxFileSize", { valueAsNumber: true })}
                />
                {errors.maxFileSize && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.maxFileSize.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  10MB = 10485760, 50MB = 52428800, 100MB = 104857600
                </p>
              </div>

              <div>
                <Label htmlFor="totalFileLimit">Total Storage (bytes)</Label>
                <Input
                  id="totalFileLimit"
                  type="number"
                  placeholder="1073741824"
                  {...register("totalFileLimit", { valueAsNumber: true })}
                />
                {errors.totalFileLimit && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.totalFileLimit.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  1GB = 1073741824, 10GB = 10737418240
                </p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  placeholder="image/jpeg, image/png, application/pdf or * for all"
                  {...register("allowedFileTypes")}
                />
                {errors.allowedFileTypes && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.allowedFileTypes.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated MIME types or * for all types
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  setEditingPackage(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading
                  ? "Saving..."
                  : editingPackage
                    ? "Update Package"
                    : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
