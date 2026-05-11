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

// Masters pages
import { ProductsPage } from "./pages/masters/ProductsPage";
import { CustomersPage } from "./pages/masters/CustomersPage";
import { TeamPage } from "./pages/masters/TeamPage";
import { DealersPage } from "./pages/masters/DealersPage";
import { SuppliersPage } from "./pages/masters/SuppliersPage";
import { TransportersPage } from "./pages/masters/TransportersPage";
import { VetDocsPage } from "./pages/masters/VetDocsPage";
import { SHGPage } from "./pages/masters/SHGPage";
import { ContentPlansPage } from "./pages/masters/ContentPlansPage";
import { PromotionDesignsPage } from "./pages/masters/PromotionDesignsPage";

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
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "leads", Component: LeadsPage },
      { path: "sales", Component: SalesPage },
      { path: "visits", Component: VisitsPage },
      { path: "reports", Component: ReportsPage },
      { path: "users", Component: UsersPage },

      // Masters routes
      { path: "masters/products", Component: ProductsPage },
      { path: "masters/customers", Component: CustomersPage },
      { path: "masters/team", Component: TeamPage },
      { path: "masters/dealers", Component: DealersPage },
      { path: "masters/suppliers", Component: SuppliersPage },
      { path: "masters/transporters", Component: TransportersPage },
      { path: "masters/vet-docs", Component: VetDocsPage },
      { path: "masters/shg", Component: SHGPage },
      { path: "masters/content-plans", Component: ContentPlansPage },
      { path: "masters/promotion-designs", Component: PromotionDesignsPage },
    ],
  },
]);
