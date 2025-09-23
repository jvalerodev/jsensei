import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getDatabase } from "@/lib/database/server";

import {
  getUserLearningPath,
  getUserProgressData,
  getUserRecentActivity,
  calculateDashboardStats
} from "@/lib/services/dashboard-service";
import {
  DashboardHeader,
  DashboardSidebar,
  DashboardStats,
  getLevelName,
  LearningPathCard
} from "./_components";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get user profile using the database model
  const db = await getDatabase();
  const profile = await db.users.findById(user.id);

  // Check if user needs to take placement test
  if (!profile?.placement_test_completed) {
    redirect("/placement-test");
  }

  // Get dashboard data
  const userLearningPath = await getUserLearningPath(user.id);
  const progress = await getUserProgressData(user.id);
  const recentActivity = await getUserRecentActivity(user.id);

  // Calculate statistics
  const { totalTopics, completedLessons, overallProgress } =
    calculateDashboardStats(userLearningPath, progress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <DashboardHeader
          userName={profile?.display_name || user.email || ""}
          userLevel={getLevelName(profile?.skill_level || "beginner")}
          placementScore={profile?.placement_test_score}
        />

        {/* Stats Overview */}
        <DashboardStats
          overallProgress={overallProgress}
          completedLessons={completedLessons}
          totalTopics={totalTopics}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Path */}
          <div className="lg:col-span-2">
            <LearningPathCard
              learningPath={userLearningPath}
              completedTopics={completedLessons}
              userLevel={profile?.skill_level}
              userId={user.id}
            />
          </div>

          {/* Sidebar */}
          <DashboardSidebar
            userId={user.id}
            userLevel={profile?.skill_level}
            placementScore={profile?.placement_test_score}
            recentActivity={recentActivity}
          />
        </div>
      </div>
    </div>
  );
}
