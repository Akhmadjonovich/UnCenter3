import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import AddProducts from "./pages/BuyProduct";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import SellProduct from "./pages/SellProduct";
import EditProduct from "./pages/EditProduct";
import { FactoryDetail , FactoriesPage } from "./pages/Factories";
import CustomersPage, { CustomerDetail } from "./pages/Customers";


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
          path="/revenue-details"
          element={
            <Layout>
              <RevenueDetails />
            </Layout>
          }
        />
        <Route
          path="/factories"
          element={
            <Layout>
              <FactoriesPage />
            </Layout>
          }
        />
         <Route
          path="/factory/:id"
          element={<FactoryDetailWrapper />}
        />
        
        <Route
          path="/buyProducts"
          element={
            <Layout>
              <BuyProduct />
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
        {/* Customers */}
        <Route
          path="/customers"
          element={
            <Layout>
              <CustomersPage />
            </Layout>
          }
        />
        <Route
          path="/customer/:id"
          element={<CustomerDetailWrapper />}
        />
      </Routes>
    </BrowserRouter>
  );
}

// 🔹 FactoryDetail ni route orqali zavod id bilan olish
import { useParams } from "react-router-dom";
import BuyProduct from "./pages/BuyProduct";
import RevenueDetails from "./pages/RevenueDetails";
const FactoryDetailWrapper = () => {
  const { id } = useParams();
  return <FactoryDetail id={id} />;
};

function CustomerDetailWrapper() {
  const { id } = useParams();
  return <CustomerDetail id={id} />;
}

export default App;
