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
const HeritageListPage = lazy(
  () => import("@/pages/Heritage/HeritageListPage"),
);
const HeritageDetailPage = lazy(
  () => import("@/pages/Heritage/HeritageDetailPage"),
);
const ArtifactListPage = lazy(
  () => import("@/pages/Artifact/ArtifactListPage"),
);
const ArtifactDetailPage = lazy(
  () => import("@/pages/Artifact/ArtifactDetailPage"),
);
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const Collections = lazy(() => import("@/pages/Profile/Collections"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const CharacterShowcase = lazy(() => import("@/pages/CharacterShowcase"));

// Admin Pages
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const HeritageSiteManagement = lazy(
  () => import("@/pages/Admin/HeritageSiteManagement"),
);
const ArtifactManagement = lazy(
  () => import("@/pages/Admin/ArtifactManagement"),
);
const UserManagement = lazy(() => import("@/pages/Admin/UserManagement"));
const ReviewManagement = lazy(() => import("@/pages/Admin/ReviewManagement"));
const CategoryManagement = lazy(() => import("@/pages/Admin/CategoryManagement"));
const CharacterManagement = lazy(() => import("@/pages/Admin/GameManagement/CharacterManagement"));
const AssetManagement = lazy(() => import("@/pages/Admin/AssetManagement"));
const QuestManagement = lazy(() => import("@/pages/Admin/QuestManagement"));
const LearningManagement = lazy(() => import("@/pages/Admin/LearningManagement"));
const ExhibitionManagement = lazy(() => import("@/pages/Admin/ExhibitionManagement"));
const BadgeManagement = lazy(() => import("@/pages/Admin/GameManagement/BadgeManagement"));
const ShopManagement = lazy(() => import("@/pages/Admin/GameManagement/ShopManagement"));
const ChapterManagement = lazy(() => import("@/pages/Admin/GameManagement/ChapterManagement"));

// Game Pages
const ChaptersPage = lazy(() => import("@/pages/Game/ChaptersPage"));
const LevelsPage = lazy(() => import("@/pages/Game/LevelsPage"));
const GamePlayPage = lazy(() => import("@/pages/Game/GamePlayPage"));
const MuseumPage = lazy(() => import("@/pages/Game/MuseumPage"));
const LeaderboardPage = lazy(() => import("@/pages/Game/LeaderboardPage"));

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
            element: <HeritageListPage />,
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
            index: true,
            element: <ArtifactListPage />,
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

  // ============ CUSTOMER ROUTES (Game Players) ============
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
    ],
  },

  // ============ RESEARCHER ROUTES (Content Creators) ============
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
        element: <HeritageSiteManagement />, // Placeholder - reuse for now
      },
      {
        path: "heritage/create",
        element: <HeritageSiteManagement />, // Placeholder
      },
      {
        path: "heritage/pending",
        element: <HeritageSiteManagement />, // Placeholder
      },
      {
        path: "artifacts/my-artifacts",
        element: <ArtifactManagement />, // Placeholder
      },
      {
        path: "artifacts/create",
        element: <ArtifactManagement />, // Placeholder
      },
      {
        path: "artifacts/pending",
        element: <ArtifactManagement />, // Placeholder
      },
      {
        path: "exhibitions/my-exhibitions",
        element: <Dashboard />, // Placeholder
      },
      {
        path: "exhibitions/create",
        element: <Dashboard />, // Placeholder
      },
    ],
  },

  // ============ PROTECTED ROUTES (Require Auth) ============
  {
    path: "/",
    element: (
      <AuthGuard requireAuth={true}>
        <LazyLoadWrapper>
          <MainLayout />
        </LazyLoadWrapper>
      </AuthGuard>
    ),
    children: [
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "collections",
        element: <Collections />,
      },
    ],
  },

  // ============ ADMIN ROUTES (Require Admin Role) ============
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
      // Content Management
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
      // Game Management
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
      // Education & Community
      {
        path: "learning",
        element: <LearningManagement />,
      },
      {
        path: "reviews",
        element: <ReviewManagement />,
      },
      // User Management
      {
        path: "users",
        element: <UserManagement />,
      },
    ],
  },

  // ============ 404 NOT FOUND ============
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
