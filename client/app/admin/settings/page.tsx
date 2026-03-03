"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  SettingsIcon,
  MailIcon,
  ServerIcon,
  ShieldIcon,
  BellIcon,
  SaveIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    siteName: "File Management System",
    siteUrl: "https://example.com",
    supportEmail: "support@example.com",
    maxUploadSize: "104857600", // 100MB in bytes
    allowRegistration: true,
    requireEmailVerification: true,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@example.com",
    fromName: "File Management System",
  });

  // Storage Settings
  const [storageSettings, setStorageSettings] = useState({
    defaultStorageLimit: "1073741824", // 1GB in bytes
    maxFileSize: "104857600", // 100MB in bytes
    allowedFileTypes: "image/*, application/pdf, video/*, audio/*",
    enableCompression: true,
    enableVersioning: true,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserNotification: true,
    subscriptionNotification: true,
    storageAlertThreshold: "90",
    dailyReports: false,
    weeklyReports: true,
  });

  const handleSaveSystemSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save system settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("System settings saved successfully");
    } catch (error) {
      toast.error("Failed to save system settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save email settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Email settings saved successfully");
    } catch (error) {
      toast.error("Failed to save email settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStorageSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save storage settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Storage settings saved successfully");
    } catch (error) {
      toast.error("Failed to save storage settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      // TODO: Implement API call to save notification settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const formatBytes = (bytes: string) => {
    const numBytes = Number(bytes);
    if (numBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage system configuration and preferences
        </p>
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">
            <SettingsIcon className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="email">
            <MailIcon className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="storage">
            <ServerIcon className="h-4 w-4 mr-2" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellIcon className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldIcon className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure general system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        siteName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={systemSettings.siteUrl}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        siteUrl: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={systemSettings.supportEmail}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        supportEmail: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Max Upload Size (bytes)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maxUploadSize: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {formatBytes(systemSettings.maxUploadSize)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowRegistration}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        allowRegistration: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email before accessing the system
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setSystemSettings({
                        ...systemSettings,
                        requireEmailVerification: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveSystemSettings} disabled={saving}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save System Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpHost: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPort: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpUser: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        smtpPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromEmail: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        fromName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveEmailSettings} disabled={saving}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Email Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure storage limits and file handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultStorageLimit">
                    Default Storage Limit (bytes)
                  </Label>
                  <Input
                    id="defaultStorageLimit"
                    type="number"
                    value={storageSettings.defaultStorageLimit}
                    onChange={(e) =>
                      setStorageSettings({
                        ...storageSettings,
                        defaultStorageLimit: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {formatBytes(storageSettings.defaultStorageLimit)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (bytes)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={storageSettings.maxFileSize}
                    onChange={(e) =>
                      setStorageSettings({
                        ...storageSettings,
                        maxFileSize: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {formatBytes(storageSettings.maxFileSize)}
                  </p>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={storageSettings.allowedFileTypes}
                    onChange={(e) =>
                      setStorageSettings({
                        ...storageSettings,
                        allowedFileTypes: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated MIME types (e.g., image/*, application/pdf)
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable File Compression</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically compress files to save storage space
                    </p>
                  </div>
                  <Switch
                    checked={storageSettings.enableCompression}
                    onCheckedChange={(checked) =>
                      setStorageSettings({
                        ...storageSettings,
                        enableCompression: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable File Versioning</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep previous versions of files when updated
                    </p>
                  </div>
                  <Switch
                    checked={storageSettings.enableVersioning}
                    onCheckedChange={(checked) =>
                      setStorageSettings({
                        ...storageSettings,
                        enableVersioning: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveStorageSettings} disabled={saving}>
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Storage Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable email notifications for admin events
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New User Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new users register
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.newUserNotification}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        newUserNotification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Subscription Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about subscription changes
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.subscriptionNotification}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        subscriptionNotification: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily system reports via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        dailyReports: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly system reports via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        weeklyReports: checked,
                      })
                    }
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="storageAlertThreshold">
                    Storage Alert Threshold (%)
                  </Label>
                  <Input
                    id="storageAlertThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={notificationSettings.storageAlertThreshold}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        storageAlertThreshold: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Get alerted when users reach this percentage of their
                    storage limit
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveNotificationSettings}
                  disabled={saving}
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Notification Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Password Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Minimum Length</span>
                      <span className="font-medium">8 characters</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Uppercase</span>
                      <span className="font-medium">Yes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Numbers</span>
                      <span className="font-medium">Yes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Require Special Characters</span>
                      <span className="font-medium">Yes</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Session Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Session Timeout</span>
                      <span className="font-medium">15 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Max Concurrent Sessions</span>
                      <span className="font-medium">3 devices</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">API Rate Limiting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Requests per Minute</span>
                      <span className="font-medium">100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Upload Rate Limit</span>
                      <span className="font-medium">10 files/minute</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Note:</strong> Security settings are managed at the
                    system level and require server configuration changes.
                    Contact your system administrator to modify these settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
