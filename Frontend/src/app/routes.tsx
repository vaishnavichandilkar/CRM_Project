import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LeadsPage } from "./pages/LeadsPage";
import { SalesPage } from "./pages/SalesPage";
import { VisitsPage } from "./pages/VisitsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DynamicMasterPage } from "./pages/masters/DynamicMasterPage";
import { ModuleSelection } from "./pages/ModuleSelection";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/forgot-password",
    Component: ForgotPasswordPage,
  },
  {
    path: "/module-selection",
    Component: ModuleSelection,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "leads", Component: LeadsPage },
      { path: "sales", Component: SalesPage },
      { path: "visits", Component: VisitsPage },
      { path: "reports", Component: ReportsPage },
      { path: "users", Component: UsersPage },

      // All Masters routes are now dynamic
      { path: "masters/:slug", Component: DynamicMasterPage },
    ],
  },
]);
