import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";

// Layouts
import MainLayout from "@/layouts/MainLayout/MainLayout";
import AdminLayout from "@/layouts/AdminLayout/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";
import Loading from "@/components/common/Loading";
import AuthGuard from "@/components/common/guards/AuthGuard";

// Lazy load pages
const Home = lazy(() => import("@/pages/Home/Home"));
const Login = lazy(() => import("@/pages/Auth/Login"));
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
const NotFound = lazy(() => import("@/pages/NotFound/NotFound"));
const CharacterShowcase = lazy(() => import("@/pages/CharacterShowcase"));

// Admin Pages
const Dashboard = lazy(() => import("@/pages/Admin/Dashboard"));
const HeritageManagement = lazy(
  () => import("@/pages/Admin/HeritageManagement"),
);
const ArtifactManagement = lazy(
  () => import("@/pages/Admin/ArtifactManagement"),
);
const UserManagement = lazy(() => import("@/pages/Admin/UserManagement"));

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
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "heritage",
        element: <HeritageManagement />,
      },
      {
        path: "artifacts",
        element: <ArtifactManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
    ],
  },

  // ============ 404 NOT FOUND ============
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
