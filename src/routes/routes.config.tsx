import React, {lazy, Suspense} from "react";
import {RouteObject, Navigate} from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import ResearcherLayout from "@/layouts/ResearcherLayout";
import AuthLayout from "@/layouts/AuthLayout";
import Loading from "@/components/common/Loading";
import AuthGuard from "@/components/common/guards/AuthGuard";
import {RoleGuard} from "./RouteGuards";
import ArtifactManagement from "@/pages/Admin/ArtifactManagement";
import HeritageSiteManagement from "@/pages/Admin/HeritageSiteManagement";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Auth"));

// Public Browse Pages (User Friendly)
const HeritageBrowsePage = lazy(() => import("@/pages/Heritage/HeritageBrowsePage"));
const ArtifactBrowsePage = lazy(() => import("@/pages/Artifact/ArtifactBrowsePage"));
const HistoryListPage = lazy(() => import("@/pages/History/HistoryListPage"));

// Detail Pages
const HeritageDetailPage = lazy(() => import("@/pages/Heritage/HeritageDetailPage"));
const ArtifactDetailPage = lazy(() => import("@/pages/Artifact/ArtifactDetailPage"));
const HistoryDetailPage = lazy(() => import("@/pages/History/HistoryDetailPage"));
const ExhibitionBrowsePage = lazy(() => import("@/pages/Exhibition/ExhibitionBrowsePage"));
const PublicExhibitionDetailPage = lazy(() => import("@/pages/Exhibition/ExhibitionDetailPage"));

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
const HistoryManagement = lazy(() => import("@/pages/Admin/HistoryManagement"));
const UserManagement = lazy(() => import("@/pages/Admin/UserManagement"));
const ReviewManagement = lazy(() => import("@/pages/Admin/ReviewManagement"));
const CategoryManagement = lazy(() => import("@/pages/Admin/CategoryManagement"));
const CharacterManagement = lazy(() => import("@/pages/Admin/GameManagement/CharacterManagement"));
const AssetManagement = lazy(() => import("@/pages/Admin/AssetManagement"));
const QuestManagement = lazy(() => import("@/pages/Admin/QuestManagement"));
const LearningManagement = lazy(() => import("@/pages/Admin/LearningManagement"));
const ExhibitionManagement = lazy(() => import("@/pages/Admin/ExhibitionManagement"));
const LevelManagement = lazy(() => import("@/pages/Admin/GameManagement/LevelManagement"));
const ResearcherHeritageManagement = lazy(() => import("@/pages/Researcher/HeritageManagement"));
const ResearcherArtifactManagement = lazy(() => import("@/pages/Researcher/ArtifactManagement"));
const BadgeManagement = lazy(() => import("@/pages/Admin/GameManagement/BadgeManagement"));
const LeaderboardPage = lazy(() => import("@/pages/Admin/GameManagement/LeaderboardManagement"));
const ShopManagement = lazy(() => import("@/pages/Admin/GameManagement/ShopManagement"));
const ChapterManagement = lazy(() => import("@/pages/Admin/GameManagement/ChapterManagement"));
const ResearcherExhibitionManagement = lazy(() => import("@/pages/Researcher/ExhibitionManagement"));
const ExhibitionDetailPage = lazy(() => import("@/pages/Admin/ExhibitionManagement/ExhibitionDetailPage"));
const ResearcherHistoryManagement = lazy(() => import("@/pages/Researcher/HistoryManagement"));
const ResearcherChapterManagement = lazy(() => import("@/pages/Researcher/ChapterManagement"));
const ResearcherLevelManagement = lazy(() => import("@/pages/Researcher/LevelManagement"));
const ResearcherLearningManagement = lazy(() => import("@/pages/Researcher/LearningManagement"));

// Game Pages
const ChaptersPage = lazy(() => import("@/pages/Game/ChaptersPage"));
const LevelsPage = lazy(() => import("@/pages/Game/LevelsPage"));
const GamePlayPage = lazy(() => import("@/pages/Game/GamePlayPage"));
const MuseumPage = lazy(() => import("@/pages/Game/MuseumPage"));
const PlayerLeaderboardPage = lazy(() => import("@/pages/Game/LeaderboardPage"));
const QuestsPage = lazy(() => import("@/pages/Game/QuestsPage"));
const ShopPage = lazy(() => import("@/pages/Game/ShopPage"));
const LearningPathPage = lazy(() => import("@/pages/Game/LearningPathPage"));
const GameDashboard = lazy(() => import("@/pages/Game/DashboardPage"));
const MapPage = lazy(() => import("@/pages/Map"));
const ScanPage = lazy(() => import("@/pages/Game/ScanPage"));

// Wrapper component for Suspense
const LazyLoadWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <Suspense fallback={<Loading fullScreen />}>{children}</Suspense>
);

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
        path: "exhibitions",
        children: [
          {
            index: true,
            element: <ExhibitionBrowsePage />,
          },
          {
            path: ":id",
            element: <PublicExhibitionDetailPage />,
          },
        ],
      },
      {
        path: "support",
        element: <Support />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
    ],
  },

  // ============ CUSTOMER/GAME ROUTES ============
  {
    path: "/game",
    element: (
      <RoleGuard allowedRoles={["customer", "admin"]} redirectTo="/">
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
        path: "scan",
        element: <ScanPage />,
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
        element: <PlayerLeaderboardPage />,
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
        index: true,
        element: <Navigate to="/researcher/heritage-sites" replace />,
      },
      {
        path: "heritage-sites",
        element: <ResearcherHeritageManagement />,
      },
      {
        path: "artifacts",
        element: <ResearcherArtifactManagement />,
      },
      {
        path: "exhibitions",
        element: <ResearcherExhibitionManagement />,
      },
      {
        path: "exhibitions/:id",
        element: <ExhibitionDetailPage />,
      },
      {
        path: "history",
        element: <ResearcherHistoryManagement />,
      },
      {
        path: "learning",
        element: <ResearcherLearningManagement />,
      },
      {
        path: "chapters",
        element: <ResearcherChapterManagement />,
      },
      {
        path: "levels",
        element: <ResearcherLevelManagement />,
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
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
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
        path: "exhibitions/:id",
        element: <ExhibitionDetailPage />,
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
        path: "leaderboard",
        element: <LeaderboardPage />,
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
