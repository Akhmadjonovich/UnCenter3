import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Orders from "./pages/Orders";
import AddProducts from "./pages/AddProducts";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import SellProduct from "./pages/SellProduct";
import EditProduct from "./pages/EditProduct";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <Orders />
            </Layout>
          }
        />
        <Route
          path="/addProducts"
          element={
            <Layout>
              <AddProducts />
            </Layout>
          }
        />
        <Route
          path="/sellProducts"
          element={
            <Layout>
              <SellProduct />
            </Layout>
          }
        />
        <Route
          path="/editProducts"
          element={
            <Layout>
              <EditProduct />
            </Layout>
          }
        />
        <Route
          path="/clients"
          element={
            <Layout>
              <Customers />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
