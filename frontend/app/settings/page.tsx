"use client";

import { useAuthContext } from "@/lib/auth-context";
import { userApi } from "@/lib/api";
import { Bell, Lock, Users, Palette, LogOut, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface NotificationPreferences {
  paymentReminders: boolean;
  invoiceSentConfirmations: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
}

interface UserPreferences {
  theme: "dark" | "light" | "auto";
}

export default function SettingsPage() {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    paymentReminders: true,
    invoiceSentConfirmations: true,
    weeklyReports: true,
    securityAlerts: true,
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "dark",
  });

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const [notifResponse, prefResponse] = await Promise.all([
          userApi.getNotifications().catch(() => null),
          userApi.getPreferences().catch(() => null),
        ]);

        if (notifResponse?.data) {
          setNotifications(notifResponse.data);
        }
        if (prefResponse?.data) {
          setPreferences(prefResponse.data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle account settings update
  const handleSaveProfile = async () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setSavingProfile(true);
      await userApi.updateProfile({
        fullName: formData.fullName,
        email: formData.email,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSavingPassword(true);
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle notifications update
  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      await userApi.updateNotifications(notifications);
      toast.success("Notification preferences updated");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update preferences",
      );
    } finally {
      setSavingNotifications(false);
    }
  };

  // Handle preferences update
  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await userApi.updatePreferences(preferences);
      toast.success("Preferences saved successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save preferences",
      );
    } finally {
      setSavingPreferences(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await userApi.deleteAccount();
      toast.success("Account deleted successfully");
      logout();
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">Manage your account and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white">Payment reminders</label>
              <input
                type="checkbox"
                checked={notifications.paymentReminders}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    paymentReminders: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Invoice sent confirmations</label>
              <input
                type="checkbox"
                checked={notifications.invoiceSentConfirmations}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    invoiceSentConfirmations: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Weekly reports</label>
              <input
                type="checkbox"
                checked={notifications.weeklyReports}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    weeklyReports: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-white">Security alerts</label>
              <input
                type="checkbox"
                checked={notifications.securityAlerts}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    securityAlerts: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <button
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingNotifications ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-emerald-500" />
            <h2 className="text-lg font-semibold text-white">Security</h2>
          </div>
          <div className="space-y-4">
            {/* Change Password Section */}
            {!showChangePassword ? (
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {savingPassword ? "Saving..." : "Update Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Two-Factor Authentication */}
            <button className="w-full px-4 py-2 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors">
              Two-Factor Authentication (Coming Soon)
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette size={20} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    theme: e.target.value as "dark" | "light" | "auto",
                  })
                }
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {savingPreferences ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-4">
            Danger Zone
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-400 mb-4 text-sm">
                  Are you sure you want to delete your account? This action
                  cannot be undone and all your data will be permanently
                  deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deletingAccount ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
