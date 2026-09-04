import { useEffect, useState, useCallback } from "react";
import { useAPI } from "../../../hooks/useApi";
import apiConfig from "../../../config/api.json";
import { getStoredToken } from "../../../utils/auth-storage";
import ProfitFilterHeader from "./components/ProfitFilterHeader";
import ProfitOverviewCards from "./components/ProfitOverviewCards";
import ProfitTrendChart from "./components/ProfitTrendChart";
import ProductProfitabilityTable from "./components/ProductProfitabilityTable";
import CategoryProfitabilityChart from "./components/CategoryProfitabilityChart";
import OrderProfitTable from "./components/OrderProfitTable";

export default function ProfitReportPage() {
  const { fetchData } = useAPI();

  // Filters state
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusScope, setStatusScope] = useState("DELIVERED_COMPLETED");
  const [customStatus, setCustomStatus] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Tab & Period state
  const [trendPeriod, setTrendPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [productTab, setProductTab] = useState<"most_profitable" | "low_margin" | "loss_making" | "unverified_cost">("most_profitable");

  // Pagination state
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  // Data state
  const [summaryData, setSummaryData] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<{ data: any[]; total: number; page: number; limit: number }>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<{ data: any[]; total: number; page: number; limit: number }>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
  });

  // Loading state
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingTrend, setIsLoadingTrend] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Compute effective date range based on preset
  useEffect(() => {
    const today = new Date();
    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (datePreset === "all") {
      setStartDate("");
      setEndDate("");
    } else if (datePreset === "today") {
      const dateStr = getLocalDateStr(today);
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (datePreset === "7days") {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      setStartDate(getLocalDateStr(past7));
      setEndDate(getLocalDateStr(today));
    } else if (datePreset === "30days") {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      setStartDate(getLocalDateStr(past30));
      setEndDate(getLocalDateStr(today));
    } else if (datePreset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(getLocalDateStr(firstDay));
      setEndDate(getLocalDateStr(today));
    }
  }, [datePreset]);

  // Build query string params
  const buildQueryParams = useCallback(
    (extraParams: Record<string, any> = {}) => {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusScope) params.append("statusScope", statusScope);
      if (statusScope === "CUSTOM" && customStatus) params.append("customStatus", customStatus);
      if (selectedCategoryId) params.append("mainCategoryId", selectedCategoryId);

      Object.entries(extraParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          params.append(k, String(v));
        }
      });

      return params.toString();
    },
    [startDate, endDate, statusScope, customStatus, selectedCategoryId]
  );

  // Fetch Overview Summary
  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const q = buildQueryParams();
      const res: any = await fetchData({ apiUrl: `${apiConfig.reports.profitSummaryUrl}?${q}` });
      const data = res?.data || res;
      setSummaryData(data);
    } catch (err) {
      console.error("Failed to load profit summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [buildQueryParams, fetchData]);

  // Fetch Trend Data
  const loadTrend = useCallback(async () => {
    setIsLoadingTrend(true);
    try {
      const q = buildQueryParams({ period: trendPeriod });
      const res: any = await fetchData({ apiUrl: `${apiConfig.reports.profitTrendUrl}?${q}` });
      const data = res?.data || res || [];
      setTrendData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load profit trend:", err);
    } finally {
      setIsLoadingTrend(false);
    }
  }, [buildQueryParams, trendPeriod, fetchData]);

  // Fetch Product Profitability
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const q = buildQueryParams({ productTab, page: productPage, limit: 10 });
      const res: any = await fetchData({ apiUrl: `${apiConfig.reports.profitProductsUrl}?${q}` });
      const data = res?.data || res || {};
      setProductsData({
        data: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
      });
    } catch (err) {
      console.error("Failed to load product profitability:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [buildQueryParams, productTab, productPage, fetchData]);

  // Fetch Category Profitability
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const q = buildQueryParams();
      const res: any = await fetchData({ apiUrl: `${apiConfig.reports.profitCategoriesUrl}?${q}` });
      const data = res?.data || res || [];
      setCategoriesData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load category profitability:", err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [buildQueryParams, fetchData]);

  // Fetch Order Profit List
  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const q = buildQueryParams({ page: orderPage, limit: 10 });
      const res: any = await fetchData({ apiUrl: `${apiConfig.reports.profitOrdersUrl}?${q}` });
      const data = res?.data || res || {};
      setOrdersData({
        data: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
      });
    } catch (err) {
      console.error("Failed to load order profit list:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [buildQueryParams, orderPage, fetchData]);

  // Trigger data loads when filters change
  useEffect(() => {
    loadSummary();
    loadTrend();
    loadProducts();
    loadCategories();
    loadOrders();
  }, [startDate, endDate, statusScope, customStatus, selectedCategoryId, datePreset]);

  // Specific loads for tab / period / pagination changes
  useEffect(() => {
    loadTrend();
  }, [trendPeriod]);

  useEffect(() => {
    loadProducts();
  }, [productTab, productPage]);

  useEffect(() => {
    loadOrders();
  }, [orderPage]);

  // CSV Export Handler
  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const q = buildQueryParams();
      const token = getStoredToken();

      const exportUrl = `${import.meta.env.VITE_API_URL || ""}/${apiConfig.reports.profitExportUrl}?${q}`;

      const res = await fetch(exportUrl, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("CSV Export request failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `bazaarbound_profit_report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Export CSV failed:", err);
      alert("Failed to export CSV report. Please check server connection.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6 bg-gray-50/50 min-h-screen">
      {/* Header & Filters */}
      <ProfitFilterHeader
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        statusScope={statusScope}
        setStatusScope={setStatusScope}
        customStatus={customStatus}
        setCustomStatus={setCustomStatus}
        isExporting={isExporting}
        onExportCsv={handleExportCsv}
      />

      {/* Overview Cards */}
      <ProfitOverviewCards summary={summaryData} isLoading={isLoadingSummary} />

      {/* Trend Chart */}
      <ProfitTrendChart
        trendData={trendData}
        isLoading={isLoadingTrend}
        period={trendPeriod}
        setPeriod={setTrendPeriod}
      />

      {/* Product & Category Section Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8">
          <ProductProfitabilityTable
            products={productsData.data}
            isLoading={isLoadingProducts}
            activeTab={productTab}
            setActiveTab={setProductTab}
            page={productsData.page}
            total={productsData.total}
            limit={productsData.limit}
            onPageChange={setProductPage}
          />
        </div>
        <div className="xl:col-span-4">
          <CategoryProfitabilityChart
            categories={categoriesData}
            isLoading={isLoadingCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />
        </div>
      </div>

      {/* Order Profit Table */}
      <OrderProfitTable
        orders={ordersData.data}
        isLoading={isLoadingOrders}
        page={ordersData.page}
        total={ordersData.total}
        limit={ordersData.limit}
        onPageChange={setOrderPage}
      />
    </div>
  );
}
