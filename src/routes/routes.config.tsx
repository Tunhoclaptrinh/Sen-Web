import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import ResearcherLayout from "@/layouts/ResearcherLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Loading from "@/components/common/Loading";
import AuthGuard from "@/components/common/guards/AuthGuard";
import { RoleGuard } from "./RouteGuards";
import ArtifactManagement from "@/pages/Admin/ArtifactManagement";
import HeritageSiteManagement from "@/pages/Admin/HeritageSiteManagement";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Auth"));

// Public Browse Pages (User Friendly)
const HeritageBrowsePage = lazy(
  () => import("@/pages/Heritage/HeritageBrowsePage"),
);
const ArtifactBrowsePage = lazy(
  () => import("@/pages/Artifact/ArtifactBrowsePage"),
);
const HistoryListPage = lazy(() => import("@/pages/History/HistoryListPage"));

// Detail Pages
const HeritageDetailPage = lazy(
  () => import("@/pages/Heritage/HeritageDetailPage"),
);
const ArtifactDetailPage = lazy(
  () => import("@/pages/Artifact/ArtifactDetailPage"),
);
const HistoryDetailPage = lazy(
  () => import("@/pages/History/HistoryDetailPage"),
);

// Profile Pages
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const LibraryPage = lazy(() => import("@/pages/Profile/Library/LibraryPage"));
const FavoritesPage = lazy(() => import("@/pages/Profile/FavoritesPage"));
const CollectionDetailPage = lazy(() => import("@/pages/Profile/Collections/CollectionDetailPage"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
// const ReviewsPage = lazy(() => import("@/pages/Profile/ReviewsPage"));

const NotFound = lazy(() => import("@/pages/NotFound"));
const Support = lazy(() => import("@/pages/Support"));


// Admin/Manager Pages (DataTables)
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const HeritageListPage = lazy(
  () => import("@/pages/Heritage/HeritageListPage"),
);
const HistoryManagement = lazy(() => import("@/pages/Admin/HistoryManagement"));
const UserManagement = lazy(() => import("@/pages/Admin/UserManagement"));
const ReviewManagement = lazy(() => import("@/pages/Admin/ReviewManagement"));
const CategoryManagement = lazy(
  () => import("@/pages/Admin/CategoryManagement"),
);
const CharacterManagement = lazy(
  () => import("@/pages/Admin/GameManagement/CharacterManagement"),
);
const AssetManagement = lazy(() => import("@/pages/Admin/AssetManagement"));
const QuestManagement = lazy(() => import("@/pages/Admin/QuestManagement"));
const LearningManagement = lazy(
  () => import("@/pages/Admin/LearningManagement"),
);
const ExhibitionManagement = lazy(
  () => import("@/pages/Admin/ExhibitionManagement"),
);
const BadgeManagement = lazy(
  () => import("@/pages/Admin/GameManagement/BadgeManagement"),
);
const ShopManagement = lazy(
  () => import("@/pages/Admin/GameManagement/ShopManagement"),
);
const ChapterManagement = lazy(
  () => import("@/pages/Admin/GameManagement/ChapterManagement"),
);
const LevelManagement = lazy(
  () => import("@/pages/Admin/GameManagement/LevelManagement"),
);

// Game Pages
const ChaptersPage = lazy(() => import("@/pages/Game/ChaptersPage"));
const LevelsPage = lazy(() => import("@/pages/Game/LevelsPage"));
const GamePlayPage = lazy(() => import("@/pages/Game/GamePlayPage"));
const MuseumPage = lazy(() => import("@/pages/Game/MuseumPage"));
const LeaderboardPage = lazy(() => import("@/pages/Game/LeaderboardPage"));
const QuestsPage = lazy(() => import("@/pages/Game/QuestsPage"));
const ShopPage = lazy(() => import("@/pages/Game/ShopPage"));
const LearningPathPage = lazy(() => import("@/pages/Game/LearningPathPage"));
const GameDashboard = lazy(() => import("@/pages/Game/DashboardPage"));

// Wrapper component for Suspense
const LazyLoadWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Suspense fallback={<Loading fullScreen />}>{children}</Suspense>;

const routes: RouteObject[] = [
  // ============ AUTH ROUTES ============
  {
    path: "/login",
    element: (
      <LazyLoadWrapper>
        <AuthLayout />
      </LazyLoadWrapper>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },

  // ============ PUBLIC ROUTES ============
  {
    path: "/",
    element: (
      <LazyLoadWrapper>
        <MainLayout />
      </LazyLoadWrapper>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "heritage-sites",
        children: [
          {
            index: true,
            element: <HeritageBrowsePage />,
          },
          {
            path: ":id",
            element: <HeritageDetailPage />,
          },
        ],
      },
      {
        path: "artifacts",
        children: [
          {
            path: "browse", // Explicit browse path if needed, or index
            element: <ArtifactBrowsePage />,
          },
          {
            index: true,
            element: <ArtifactBrowsePage />, // Default to browse
          },
          {
            path: ":id",
            element: <ArtifactDetailPage />,
          },
        ],
      },
      {
        path: "history",
        children: [
          {
            index: true,
            element: <HistoryListPage />,
          },
          {
            path: ":id",
            element: <HistoryDetailPage />,
          },
        ],
      },
      {
        path: "support",
        element: <Support />,
      },

    ],
  },

  // ============ CUSTOMER/GAME ROUTES ============
  {
    path: "/game",
    element: (
      <RoleGuard allowedRoles={["customer"]} redirectTo="/">
        <LazyLoadWrapper>
          <CustomerLayout />
        </LazyLoadWrapper>
      </RoleGuard>
    ),
    children: [
      {
        path: "dashboard",
        element: <GameDashboard />,
      },
      {
        index: true, 
        element: <GameDashboard />, // Keep index as dashboard for convenience, or redirect? User wants explicit path.
        // Let's keep both or just redirect. For now, rendering component at index is fine, but menu should point to /dashboard.
      },
      {
        path: "chapters",
        element: <ChaptersPage />,
      },
      {
        path: "chapters/:chapterId/levels",
        element: <LevelsPage />,
      },
      {
        path: "play/:levelId",
        element: <GamePlayPage />,
      },
      {
        path: "museum",
        element: <MuseumPage />,
      },
      {
        path: "leaderboard",
        element: <LeaderboardPage />,
      },
      {
         path: "shop",
         element: <ShopPage />,
      },
      {
        path: "quests",
        element: <QuestsPage />,
      },
      {
        path: "learning",
        element: (
          <LazyLoadWrapper>
            <LearningPathPage />
          </LazyLoadWrapper>
        ),
      },
      {
        path: "learning/:id",
        element: (
          <LazyLoadWrapper>
            <LearningPathPage />
          </LazyLoadWrapper>
        ),
      },
    ],
  },

  // ============ RESEARCHER ROUTES ============
  {
    path: "/researcher",
    element: (
      <RoleGuard allowedRoles={["researcher"]} redirectTo="/">
        <LazyLoadWrapper>
          <ResearcherLayout />
        </LazyLoadWrapper>
      </RoleGuard>
    ),
    children: [
      {
        path: "heritage/my-submissions",
        element: <HeritageListPage />,
      },
      {
        path: "heritage/create",
        element: <HeritageSiteManagement />,
      },
      {
        path: "artifacts/my-artifacts",
        element: <ArtifactManagement />,
      },
      {
        path: "artifacts/create",
        element: <ArtifactManagement />,
      },
      {
        path: "exhibitions/my-exhibitions",
        element: <ExhibitionManagement />,
      },
      {
        path: "exhibitions/create",
        element: <ExhibitionManagement />,
      },
      {
        path: "history/my-articles",
        element: <HistoryManagement />,
      },
      {
        path: "history/create",
        element: <HistoryManagement />,
      },
      {
        path: "learning",
        element: <LearningManagement />,
      },
      {
        path: "learning/create",
        element: <LearningManagement />,
      },
      {
        path: "chapters",
        element: <ChapterManagement />,
      },
      {
        path: "levels",
        element: <LevelManagement />,
      },
    ],
  },

  // ============ PROTECTED USER ROUTES ============
  {
    path: "/profile",
    element: (
      <AuthGuard requireAuth={true}>
        <LazyLoadWrapper>
          <MainLayout />
        </LazyLoadWrapper>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      // {
      //   path: "collections", // Deprecated, redirect or keep for legacy URL support if needed
      //   element: <LibraryPage />, // Or redirect to library? For now let's just use Library
      // },
      {
        path: "favorites",
        element: <FavoritesPage />,
      },
      {
        path: "collections/:id",
        element: <CollectionDetailPage />,
      },
      //   element: <ReviewsPage />,
      // },
    ],
  },

  // ============ NOTIFICATIONS ============
  {
    path: "/notifications",
    element: (
      <AuthGuard requireAuth={true}>
        <LazyLoadWrapper>
          <MainLayout />
        </LazyLoadWrapper>
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <NotificationsPage />,
      },
    ],
  },

  // ============ ADMIN ROUTES ============
  {
    path: "/admin",
    element: (
      <AuthGuard requireAuth={true} requiredRoles={["admin"]}>
        <LazyLoadWrapper>
          <AdminLayout />
        </LazyLoadWrapper>
      </AuthGuard>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "heritage-sites",
        element: <HeritageSiteManagement />,
      },
      {
        path: "artifacts",
        element: <ArtifactManagement />,
      },
      {
        path: "categories",
        element: <CategoryManagement />,
      },
      {
        path: "exhibitions",
        element: <ExhibitionManagement />,
      },
      {
        path: "history",
        element: <HistoryManagement />,
      },
      {
        path: "chapters",
        element: <ChapterManagement />,
      },
      {
        path: "levels",
        element: <LevelManagement />,
      },
      {
        path: "characters",
        element: <CharacterManagement />,
      },
      {
        path: "quests",
        element: <QuestManagement />,
      },
      {
        path: "assets",
        element: <AssetManagement />,
      },
      {
        path: "badges",
        element: <BadgeManagement />,
      },
      {
        path: "shop",
        element: <ShopManagement />,
      },
      {
        path: "learning",
        element: <LearningManagement />,
      },
      {
        path: "reviews",
        element: <ReviewManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
    ],
  },

  // ============ 404 ============
  {
    path: "*",
    element: (
      <LazyLoadWrapper>
        <NotFound />
      </LazyLoadWrapper>
    ),
  },
];

export default routes;
