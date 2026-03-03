"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/lib/api/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import {
  MoreHorizontalIcon,
  SearchIcon,
  ShieldIcon,
  ShieldOffIcon,
  BanIcon,
  CheckCircleIcon,
  EyeIcon,
  RefreshCwIcon,
  UserIcon,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserDetail {
  user: User;
  subscription: any;
  usage: {
    fileCount: number;
    folderCount: number;
    totalSize: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(
        page,
        20,
        searchQuery || undefined,
      );
      setUsers(response.users);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toast.error("Failed to load users");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setActionLoading(true);
      const userDetail = await adminService.getUserById(userId);
      setSelectedUser(userDetail);
      setShowDetailDialog(true);
    } catch (error: any) {
      toast.error("Failed to load user details");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRole = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to ${user.isAdmin ? "remove admin role from" : "make"} ${user.name} ${user.isAdmin ? "" : "an admin"}?`,
      )
    ) {
      return;
    }

    try {
      await adminService.updateUserRole(user.id, !user.isAdmin);
      toast.success(`User role updated successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role");
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      toast.error("Please provide a suspension reason");
      return;
    }

    try {
      setActionLoading(true);
      await adminService.suspendUser(selectedUser.user.id, suspendReason);
      toast.success("User suspended successfully");
      setShowSuspendDialog(false);
      setSuspendReason("");
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to suspend user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateUser = async (user: User) => {
    if (!confirm(`Are you sure you want to activate ${user.name}?`)) {
      return;
    }

    try {
      await adminService.activateUser(user.id);
      toast.success("User activated successfully");
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to activate user");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStorage = (storage: string) => {
    const bytes = Number(storage);
    if (isNaN(bytes) || bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCwIcon
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isAdmin).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isEmailVerified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <BanIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isSuspended).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </div>
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchQuery
                          ? "No users match your search"
                          : "No users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <Badge variant="default" className="bg-purple-500">
                              <ShieldIcon className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Customer</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {user.isSuspended ? (
                              <Badge variant="destructive">
                                <BanIcon className="h-3 w-3 mr-1" />
                                Suspended
                              </Badge>
                            ) : user.isEmailVerified ? (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Unverified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="bg-white text-gray-900"
                              align="end"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(user.id)}
                              >
                                <EyeIcon className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleRole(user)}
                              >
                                {user.isAdmin ? (
                                  <>
                                    <ShieldOffIcon className="h-4 w-4 mr-2" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <ShieldIcon className="h-4 w-4 mr-2" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.isSuspended ? (
                                <DropdownMenuItem
                                  onClick={() => handleActivateUser(user)}
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser({
                                      user,
                                      subscription: null,
                                      usage: {
                                        fileCount: 0,
                                        folderCount: 0,
                                        totalSize: "0",
                                      },
                                    });
                                    setShowSuspendDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <BanIcon className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing page {page} of {totalPages} ({total} total users)
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.user.name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.user.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm">
                    {selectedUser.user.isAdmin ? (
                      <Badge variant="default" className="bg-purple-500">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Customer</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm">
                    {selectedUser.user.isSuspended ? (
                      <Badge variant="destructive">Suspended</Badge>
                    ) : selectedUser.user.isEmailVerified ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Files</Label>
                    <p className="text-2xl font-bold">
                      {selectedUser.usage.fileCount}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Folders</Label>
                    <p className="text-2xl font-bold">
                      {selectedUser.usage.folderCount}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Storage</Label>
                    <p className="text-2xl font-bold">
                      {formatStorage(selectedUser.usage.totalSize)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.user.isSuspended &&
                selectedUser.user.suspensionReason && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">
                      Suspension Reason
                    </Label>
                    <p className="text-sm text-red-600 mt-1">
                      {selectedUser.user.suspensionReason}
                    </p>
                  </div>
                )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm font-medium">Joined</Label>
                    <p className="text-muted-foreground">
                      {formatDate(selectedUser.user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-muted-foreground">
                      {formatDate(selectedUser.user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending this user. They will not be able
              to log in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Suspension Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Violation of terms of service"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendDialog(false);
                setSuspendReason("");
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendUser}
              disabled={actionLoading || !suspendReason.trim()}
            >
              {actionLoading ? "Suspending..." : "Suspend User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
