"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import VtoLogoutUsers from "@/components/v-logout-users";
import CompanyCarousel from "@/components/company-carousel";
import { BarLoader } from "react-spinners";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Calendar,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ChevronRight,
} from "lucide-react";
import { getDashboardOverview, getRecentActivity } from "@/actions/Dashboard";

export default function Home() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [userChecked, setUserChecked] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const handleNavigation = () => {
    setNavigating(true);
    router.push("/onboarding");
  };

  const handleCreateProject = () => {
    router.push("/project/create");
  };

  const fetchDashboardData = async () => {
    if (!userChecked || !user) return;

    setLoadingDashboard(true);
    try {
      // SERVER ACTION
      // const data = await getDashboardOverview();
      // setDashboardData(data);
      const res = await fetch("/api/dashboard");
      const text = await res.text();
    console.log("Response body:", text);
      if (!res.ok) throw new Error("Failed to load dashboard");
      // const data = await res.json();
      const data = JSON.parse(text);
      setDashboardData(data);
      toast.success("Dashboard data loaded successfully");
    } catch (error) {
      // console.error("Error fetching dashboard data:", error);
      // toast.error("Failed to load dashboard data");
      toast.error(error.message);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!userChecked || !user) return;

    setLoadingActivity(true);
    try {
      // SERVER ACTION
      // const activity = await getRecentActivity();
      // setRecentActivity(activity);
      const res = await fetch("/api/activity");
      if (!res.ok) throw new Error("Failed to load recent activity");
      const activity = await res.json();
      console.log("activity", activity);
      setRecentActivity(activity);
      toast.success("Recent activity loaded successfully");
    } catch (error) {
      // console.error("Error fetching recent activity:", error);
      // toast.error("Failed to load recent activity");
      // switch (error.message) {
      //   case "Unauthorized clerkUserId":
      //     toast.error("Please sign in to continue");
      //     break;
      //   case "Unauthorized not found in db":
      //     toast.error("User account not found. Please contact support.");
      //     break;
      //   case "Failed to fetch recent activity":
      //     toast.error("Unable to load recent activity. Please try again.");
      //     break;
      //   default:
      //     console.log("Unhandled error message:", error.message);
      //     toast.error("Something went wrong. Please try again.");
      // }
      console.log("error", error);
      toast.error(error.message);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || userChecked) return;

    if (!user) {
      setUserChecked(true);
      return;
    }

    const hasSavedUser = sessionStorage.getItem("savedUserInDb");

    if (hasSavedUser) {
      setUserChecked(true);
      return;
    }

    const saveUserToDB = async () => {
      setUserChecked(false);

      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to save user");
        } else {
          toast.success(`Welcome back, ${user?.firstName || user?.username}!`);
          sessionStorage.setItem("savedUserInDb", "true");
        }
      } catch (err) {
        // console.error("Error saving user:", err);
        toast.error("User setup failed. Signing out...");
        await signOut();
        router.push("/");
        return;
      }

      setUserChecked(true);
    };

    saveUserToDB();
  }, [user, isLoaded, userChecked]);

  useEffect(() => {
    if (userChecked && user) {
      fetchDashboardData();
      fetchRecentActivity();
    }
  }, [userChecked]);

  useEffect(() => {
    sessionStorage.removeItem("userSelectedOrgId");
  }, []);

  if (!userChecked || !isLoaded || navigating) {
    return <BarLoader color="#36d7b7" className="mb-4" width={"100%"} />;
  }

  if (!user) {
    return <VtoLogoutUsers />;
  }

  const getIconComponent = (iconName) => {
    const icons = {
      CheckCircle,
      AlertCircle,
      Star,
      Users,
      Clock,
    };
    return icons[iconName] || Clock;
  };

  const formatTimeAgo = (timestamp) => {
    const dateObj =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto py-20 text-center">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Avatar className="w-20 h-20 border-4 border-blue-300">
            <AvatarImage
              src={user.imageUrl || undefined}
              alt={user.firstName || user.username || "User"}
            />
            <AvatarFallback className="text-2xl font-semibold">
              {user.firstName?.[0] || user.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold gradient-title">
              Welcome back, {user.firstName || user.username}!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-2">
              Ready to streamline your workflow?
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={handleNavigation}
            className="animate-bounce cursor-pointer"
          >
            View Organizations <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleCreateProject}
            className="cursor-pointer"
          >
            Create Project <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8 text-center gradient-title">
          Dashboard Overview
        </h2>

        {loadingDashboard ? (
          <div className="flex justify-center py-8">
            <BarLoader color="#36d7b7" width={"200px"} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Total Projects
                  </CardTitle>
                  <FolderOpen className="w-5 h-5 text-blue-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.totalProjects || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(dashboardData?.projectsGrowth ?? 0) > 0 ? "+" : ""}
                  {dashboardData?.projectsGrowth ?? 0} from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Active Sprints
                  </CardTitle>
                  <Calendar className="w-5 h-5 text-green-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.activeSprints || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {dashboardData?.sprintsEndingThisWeek || 0} ending this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Team Members
                  </CardTitle>
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.totalTeamMembers || 0}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Across {dashboardData?.orgCount || 0} organizations
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">
                    Completion Rate
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-orange-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.completionRate || 0}%
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Active sprint progress
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="w-5 h-5 mr-2 text-blue-300" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-600 text-white hover:bg-gray-700"
                  onClick={handleCreateProject}
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-600 text-white hover:bg-gray-700"
                  onClick={handleNavigation}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Manage Organizations
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  View Sprint Calendar
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-600 text-white hover:bg-gray-700"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Clock className="w-5 h-5 mr-2 text-green-300" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest project updates and team activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="flex justify-center py-8">
                    <BarLoader color="#36d7b7" width={"200px"} />
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const IconComponent = getIconComponent(activity.icon);
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700 border border-gray-600"
                        >
                          <IconComponent
                            className={`w-5 h-5 text-${activity.color}-300 mt-0.5`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatTimeAgo(activity.timestamp)} •{" "}
                              {activity.description}
                              {activity.assignee &&
                                ` • Assigned to ${activity.assignee}`}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              activity.badge === "High Priority"
                                ? "bg-red-600"
                                : activity.badge === "Completed"
                                ? "bg-green-600"
                                : activity.badge === "Team"
                                ? "bg-blue-600"
                                : "bg-purple-600"
                            }`}
                          >
                            {activity.badge}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 py-20 mt-12">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center gradient-title">
            Why Teams Choose ProjectRack
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="pt-6">
                <LayoutDashboard className="h-12 w-12 mb-4 text-blue-300 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-white">
                  Intuitive Design
                </h4>
                <p className="text-gray-300">
                  Experience a user-friendly interface that makes project
                  management a breeze.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="pt-6">
                <Activity className="h-12 w-12 mb-4 text-green-300 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-white">
                  Powerful Features
                </h4>
                <p className="text-gray-300">
                  Unlock the full potential of ProjectRack with a wide range of
                  features.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 mb-4 text-purple-300 mx-auto" />
                <h4 className="text-xl font-semibold mb-2 text-white">
                  Agile Collaboration
                </h4>
                <p className="text-gray-300">
                  Connect with your team and collaborate on projects with ease.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Carousel */}
      <section className="py-20">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center gradient-title">
            Trusted by Industry Leaders
          </h3>
          <CompanyCarousel />
        </div>
      </section>
    </div>
  );
}
