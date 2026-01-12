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

// Detail Pages
const HeritageDetailPage = lazy(
  () => import("@/pages/Heritage/HeritageDetailPage"),
);
const ArtifactDetailPage = lazy(
  () => import("@/pages/Artifact/ArtifactDetailPage"),
);

// Profile Pages
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const CollectionsPage = lazy(
  () => import("@/pages/Profile/Collections/CollectionsPage"),
);
const FavoritesPage = lazy(() => import("@/pages/Profile/FavoritesPage"));
const NotificationsPage = lazy(() => import("@/pages/Notifications"));
// const ReviewsPage = lazy(() => import("@/pages/Profile/ReviewsPage"));

const NotFound = lazy(() => import("@/pages/NotFound"));
const CharacterShowcase = lazy(() => import("@/pages/CharacterShowcase"));

// Admin/Manager Pages (DataTables)
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const HeritageSiteManagement = lazy(
  () => import("@/pages/Admin/HeritageSiteManagement"),
); // Admin
const ArtifactManagement = lazy(
  () => import("@/pages/Admin/ArtifactManagement"),
); // Admin
const HeritageListPage = lazy(
  () => import("@/pages/Heritage/HeritageListPage"),
); // User view
const ArtifactListPage = lazy(
  () => import("@/pages/Artifact/ArtifactListPage"),
); // User view
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

// Game Pages
const ChaptersPage = lazy(() => import("@/pages/Game/ChaptersPage"));
const LevelsPage = lazy(() => import("@/pages/Game/LevelsPage"));
const GamePlayPage = lazy(() => import("@/pages/Game/GamePlayPage"));
const MuseumPage = lazy(() => import("@/pages/Game/MuseumPage"));
const LeaderboardPage = lazy(() => import("@/pages/Game/LeaderboardPage"));
const QuestsPage = lazy(() => import("@/pages/Game/QuestsPage"));
const LearningPathPage = lazy(() => import("@/pages/Game/LearningPathPage"));

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
        path: "character-showcase",
        element: <CharacterShowcase />,
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
      // ... retain other researcher routes
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
        path: "collections",
        element: <CollectionsPage />,
      },
      {
        path: "favorites",
        element: <FavoritesPage />,
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
        path: "chapters",
        element: <ChapterManagement />,
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
