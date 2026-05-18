import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store } from "./store/store";

export default function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </Provider>
  );
}