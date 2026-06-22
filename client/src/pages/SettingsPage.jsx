import api from "@/lib/api";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
export default function SettingsPage() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [ratesForm, setRatesForm] = useState({
    dispatchRates: { lease: 0, ownerOp: 0 },
    maintenanceRates: { lease: 0 },
    companyDriverPay: { payType: "cpm", cpm: 0, percentage: 0 },
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [editProfile, setEditProfile] = useState(false);
  const [editRates, setEditRates] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletePassword, setDeletePassword] = useState("");
  const navigate = useNavigate();
  async function fetchUser() {
    setLoading(true);
    try {
      const res = await api.get("/api/auth/me");
      setData(res.data);
      console.log(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function updateUserInfo(e) {
    console.log("updateUser clicked");
    e.preventDefault();
    setFormError("");
    if (!profileForm.name || !profileForm.email) {
      setFormError("Name or email is required");
      return;
    }
    try {
      await api.patch("/api/auth/me", {
        name: profileForm.name,
        email: profileForm.email,
      });
      setEditProfile(false);
      setData({ ...data, name: profileForm.name, email: profileForm.email });
      fetchUser();
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function updateRates(e) {
    e.preventDefault();
    setFormError("");
    if (
      ratesForm.dispatchRates.lease <= 0 ||
      ratesForm.dispatchRates.ownerOp <= 0 ||
      ratesForm.maintenanceRates.lease <= 0 ||
      (ratesForm.companyDriverPay.payType === "cpm" &&
        ratesForm.companyDriverPay.cpm <= 0) ||
      (ratesForm.companyDriverPay.payType === "percentage" &&
        ratesForm.companyDriverPay.percentage <= 0)
    ) {
      setFormError(" Update fields are required");
      return;
    }
    try {
      await api.patch("/api/auth/me/", {
        dispatchRates: {
          lease: ratesForm.dispatchRates.lease,
          ownerOp: ratesForm.dispatchRates.ownerOp,
        },
        maintenanceRates: { lease: ratesForm.maintenanceRates.lease },
        companyDriverPay: {
          payType: ratesForm.companyDriverPay.payType,
          cpm: ratesForm.companyDriverPay.cpm,
          percentage: ratesForm.companyDriverPay.percentage,
        },
      });
      setEditRates(false);
      setData({
        ...data,
        dispatchRates: {
          lease: ratesForm.dispatchRates.lease,
          ownerOp: ratesForm.dispatchRates.ownerOp,
        },
        maintenanceRates: { lease: ratesForm.maintenanceRates.lease },
        companyDriverPay: {
          payType: ratesForm.companyDriverPay.payType,
          cpm: ratesForm.companyDriverPay.cpm,
          percentage: ratesForm.companyDriverPay.percentage,
        },
      });
      fetchUser();
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }

  async function updatePassword(e) {
    e.preventDefault();
    setFormError("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setFormError("Current and new password required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setFormError("Password doesn't match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }
    try {
      await api.patch("/api/auth/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }
  async function deleteAccount(e) {
    setFormError("");

    try {
      if (!deletePassword) {
        setFormError("Password is required");
      }
      await api.delete("/api/auth/me", {
        data: { password: deletePassword },
      });
      setDeletePassword("");
      navigate("/signup");
    } catch (err) {
      setFormError(err.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-sans antialiased">
      <Tabs
        value={searchParams.get("tab") || "account"}
        orientation="vertical"
        className="flex flex-row w-full h-full items-stretch"
        onValueChange={(val) => {
          setSearchParams({ tab: val });
          setFormError("");
          setError("");
          setEditProfile(false);
          setEditRates(false);
        }}
      >
        <div className="w-64 h-full bg-muted/40 border-r p-6 flex flex-col justify-start gap-6">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
              Settings
            </h2>
          </div>

          <TabsList className="flex flex-col w-full h-auto bg-transparent border-none p-0 gap-1 m-0 justify-start">
            <TabsTrigger
              value="account"
              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="rates"
              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
            >
              Rates
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
            >
              Password
            </TabsTrigger>
            <TabsTrigger
              value="remove"
              className="w-full justify-start px-3 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive text-muted-foreground hover:text-destructive"
            >
              Delete Account
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 h-full overflow-y-auto bg-background">
          <TabsContent
            value="account"
            className="h-full m-0 p-10 focus-visible:outline-none flex flex-col gap-6"
          >
            {/* Section Heading Context */}
            <div className="border-b pb-4">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Account Information
              </h1>

              <p className="text-sm text-muted-foreground">
                Update your profile settings and rate information.
              </p>
            </div>

            {/* Actual Form Content Area */}
            <div className="grid grid-cols-3 gap-6">
              {/* Card 1: Profile Details */}
              <form onSubmit={updateUserInfo}>
                <Card className="col-span-2 flex flex-col justify-between overflow-hidden">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Profile Details
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Manage your public avatar and display identity.
                    </CardDescription>
                  </CardHeader>
                  {loading && <p className="text-sm px-3 py-2">Loading...</p>}
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  {formError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {" "}
                      {formError}
                    </p>
                  )}
                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Name</span>
                        <input
                          type="text"
                          value={editProfile ? profileForm.name : data.name}
                          className={`font-medium text-foreground px-5 ${editProfile ? "border rounded-md" : ""}`}
                          disabled={!editProfile}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground ">Email</span>
                        <input
                          type="email"
                          className={`font-medium text-foreground px-5 ${editProfile ? "border rounded-md" : ""}`}
                          value={editProfile ? profileForm.email : data.email}
                          disabled={!editProfile}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 bg-muted/20 pt-4 mt-auto">
                    {editProfile ? (
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                        key="save"
                      >
                        Save Updated Info
                      </button>
                    ) : (
                      <button
                        type="button"
                        key="edit"
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full text-left"
                        onClick={() => {
                          (setEditProfile(true),
                            setProfileForm({
                              name: data.name,
                              email: data.email,
                            }));
                        }}
                      >
                        Edit profile details →
                      </button>
                    )}
                  </CardFooter>
                </Card>
              </form>
            </div>

            {/* Card 1: Profile Details */}
          </TabsContent>
          <TabsContent
            className="h-full m-0 p-10 focus-visible:outline-none flex flex-col gap-6"
            value="rates"
          >
            <div className="border-b pb-4 flex items-end justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Rates
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage rates here.
                </p>
              </div>
              <div className="pb-0.5">
                {editRates ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      form="rates-form"
                      className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                      key="save"
                    >
                      Save Updated Info
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                      onClick={() => setEditRates(false)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    key="edit"
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                    onClick={() => {
                      (setEditRates(true),
                        setRatesForm({
                          dispatchRates: {
                            lease: data.dispatchRates.lease,
                            ownerOp: data.dispatchRates.ownerOp,
                          },
                          maintenanceRates: {
                            lease: data.maintenanceRates.lease,
                          },
                          companyDriverPay: {
                            payType: data.companyDriverPay.payType,
                            cpm: data.companyDriverPay.cpm,
                            percentage: data.companyDriverPay.percentage,
                          },
                        }));
                    }}
                  >
                    Edit rates details →
                  </button>
                )}
              </div>
            </div>
            <form id="rates-form" onSubmit={updateRates}>
              <div className="grid grid-cols-2 gap-6">
                <Card className="flex flex-col justify-between overflow-hidden self-start">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Rate Details
                      </CardTitle>
                    </div>
                    <CardDescription>Manage dispatch rates.</CardDescription>
                  </CardHeader>

                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Lease</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={
                              editRates
                                ? ratesForm.dispatchRates?.lease * 100
                                : data.dispatchRates?.lease * 100
                            }
                            className={`font-medium text-foreground w-16 text-right ${editRates ? "border rounded-md" : ""}`}
                            disabled={!editRates}
                            onChange={(e) =>
                              setRatesForm({
                                ...ratesForm,
                                dispatchRates: {
                                  ...ratesForm.dispatchRates,
                                  lease: Number(e.target.value) / 100,
                                },
                              })
                            }
                          />
                          <span>%</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Owner Operator
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={
                              editRates
                                ? ratesForm.dispatchRates?.ownerOp * 100
                                : data.dispatchRates?.ownerOp * 100
                            }
                            className={`font-medium text-foreground w-16 text-right ${editRates ? "border rounded-md" : ""}`}
                            disabled={!editRates}
                            onChange={(e) =>
                              setRatesForm({
                                ...ratesForm,
                                dispatchRates: {
                                  ...ratesForm.dispatchRates,
                                  ownerOp: Number(e.target.value) / 100,
                                },
                              })
                            }
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col justify-between overflow-hidden self-start">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Maintenance Rates
                      </CardTitle>
                    </div>
                    <CardDescription>Manage Maintenace Rates.</CardDescription>
                  </CardHeader>

                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between pb-2">
                        <span className="text-muted-foreground">
                          Maintenance Rate
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={
                              editRates
                                ? ratesForm.maintenanceRates?.lease
                                : data.maintenanceRates?.lease
                            }
                            className={`font-medium text-foreground w-16 text-right ${editRates ? "border rounded-md" : ""}`}
                            disabled={!editRates}
                            onChange={(e) =>
                              setRatesForm({
                                ...ratesForm,
                                maintenanceRates: {
                                  lease: Number(e.target.value),
                                },
                              })
                            }
                          />
                          <span>¢</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="flex flex-col justify-between overflow-hidden self-start">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Company Driver Pay Details
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Manage Company Driver Rates.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Pay Type</span>
                        {editRates ? (
                          <Select
                            value={ratesForm.companyDriverPay.payType}
                            onValueChange={(value) =>
                              setRatesForm({
                                ...ratesForm,
                                companyDriverPay: {
                                  ...ratesForm.companyDriverPay,
                                  payType: value,
                                },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder="Select Type"
                                value={ratesForm.companyDriverPay.payType}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpm">CPM</SelectItem>
                              <SelectItem value="percentage">%</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="font-medium text-foreground">
                            {data.companyDriverPay?.payType === "percentage"
                              ? "%"
                              : "CPM"}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Driver Pay
                        </span>
                        {editRates ? (
                          <div className="flex items-center gap-1">
                            <input
                              className={
                                "font-medium text-foreground w-16 text-right border rounded-md"
                              }
                              type="number"
                              value={
                                ratesForm.companyDriverPay.payType === "cpm"
                                  ? ratesForm.companyDriverPay.cpm
                                  : ratesForm.companyDriverPay.percentage * 100
                              }
                              onChange={(e) => {
                                const value =
                                  ratesForm.companyDriverPay.payType === "cpm"
                                    ? Number(e.target.value)
                                    : Number(e.target.value) / 100;
                                setRatesForm({
                                  ...ratesForm,
                                  companyDriverPay: {
                                    ...ratesForm.companyDriverPay,
                                    [ratesForm.companyDriverPay.payType]: value,
                                  },
                                });
                              }}
                            />
                            <span>
                              {ratesForm.companyDriverPay.payType === "cpm"
                                ? "$/mile"
                                : "%"}
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-foreground">
                            {data.companyDriverPay?.payType === "percentage"
                              ? `${(data.companyDriverPay?.percentage ?? 0) * 100}%`
                              : `$${data.companyDriverPay?.cpm ?? 0}/mile`}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
            {/* Container with a fixed minimum height or conditional margin to prevent layout shifts */}
            <div className="my-4 transition-all duration-200">
              {/* 1. Loading State */}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border/50 rounded-lg p-3 animate-pulse">
                  {/* Optional: Add a simple CSS spinner icon here */}
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Updating rates on server...</span>
                </div>
              )}

              {/* 2. Error State (Combines formError or server error into one sleek banner) */}
              {(formError || error) && (
                <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {/* Alert Icon */}
                  <svg
                    className="h-4 w-4 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>

                  <div className="space-y-0.5">
                    <p className="font-semibold tracking-wide uppercase text-[10px]">
                      Update Failed
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {formError || error}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent
            value="password"
            className="h-full m-0 p-10 focus-visible:outline-none flex flex-col gap-6"
          >
            <div className="border-b pb-4">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Security
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your authentication details and credentials.
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-card/50 p-6">
              <form onSubmit={updatePassword}>
                <Card className="col-span-2 flex flex-col justify-between overflow-hidden">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Change your password
                      </CardTitle>
                    </div>
                  </CardHeader>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  {formError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {" "}
                      {formError}
                    </p>
                  )}
                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">
                          Current Password
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          className="font-medium text-foreground px-3 border rounded-md"
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">
                          New Password
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          className="font-medium text-foreground px-3 border rounded-md"
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Confirm Password
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.confirmNewPassword}
                          className="font-medium text-foreground px-3 border rounded-md"
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmNewPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 bg-muted/20 pt-4 mt-auto">
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      Update your password →
                    </button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          </TabsContent>

          <TabsContent
            value="remove"
            className="h-full m-0 p-10 focus-visible:outline-none flex flex-col gap-6"
          >
            <div className="border-b pb-4">
              <h1 className="text-xl font-semibold tracking-tight text-destructive">
                Danger Zone
              </h1>
              <p className="text-sm text-muted-foreground">
                Permanently remove your account data and access.
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-destructive/20 p-6">
              <div className="flex-1 rounded-xl border border-border bg-card/50 p-6">
                <Card className="col-span-2 flex flex-col justify-between overflow-hidden">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold tracking-tight">
                        Enter your paswword to complete deletion
                      </CardTitle>
                    </div>
                  </CardHeader>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {error}
                    </p>
                  )}
                  {formError && (
                    <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {" "}
                      {formError}
                    </p>
                  )}

                  <CardContent className="py-2">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Password</span>
                        <input
                          placeholder="••••••••"
                          type="password"
                          className="font-medium text-foreground px-3 border rounded-md"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/50 bg-muted/20 pt-4 mt-auto">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          disabled={!deletePassword}
                          type="button"
                          className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
                        >
                          Confirm your password →
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteAccount}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
