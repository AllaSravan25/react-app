import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FileText, Users, CreditCard, PhoneCall } from "lucide-react";
// import RevenueBarChart from "../components/RevenueBarChart";
import "../pages/styles/home.css";
import AttendanceCalendar from "../components/attendanceMontly";
import QuickSection from "../components/quickSection";
import RevenueChart from "../components/RevenueChart";
const API_BASE_URL = 'https://react-app-server-nu.vercel.app';

export default function Home() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchRevenueData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/monthly`);
      setMonthlyData(response.data);

      const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions`);
      const transactions = transactionsResponse.data;
      const revenue = transactions
        .filter(t => t.type.toLowerCase() === 'received' || t.type.toLowerCase() === 'recieved')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to fetch revenue data");
    }
  }, []);

  const handleTransactionAdded = useCallback(async () => {
    // Refetch revenue data when a new transaction is added
    await fetchRevenueData();
  }, [fetchRevenueData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [employeeResponse, attendanceResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/employees/count`),
          axios.get(`${API_BASE_URL}/attendance/present`, {
            params: { date: new Date().toISOString().split("T")[0] },
          }),
        ]);
        setEmployeeCount(employeeResponse.data.count);
        setPresentCount(attendanceResponse.data.count);
        await fetchRevenueData();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchRevenueData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold">Hello Sridhar,</h1>
            <p className="text-gray-600">This is RS FIRE PROTECTION'S dashboard</p>
          </div>

          <section id="dashboard">

          <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    
          <div className="flex flex-col md:flex-row md:justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full md:w-2/3">
              <DashboardCard
                title="Projects"
                icon={<FileText className="w-5 h-5 text-blue-500" />}
                mainStat={{ label: "Completed", value: 150 }}
                secondaryStat={{ label: "Active", value: 5 }}
                inFunnel={{ label: "In funnel", value: 20 }}
              />
              <DashboardCard
                title="Employees"
                icon={<Users className="w-5 h-5 text-blue-500" />}
                mainStat={{ label: "Total", value: employeeCount }}
                secondaryStat={{ label: "Present", value: presentCount }}
                inFunnel={{ label: "Absent", value: employeeCount - presentCount }}
              />
              <DashboardCard
                title="CRM"
                icon={<PhoneCall className="w-5 h-5 text-blue-500" />}
                mainStat={{ label: "Total Leads", value: 150 }}
                secondaryStat={{ label: "Today", value: 5 }}
                inFunnel={{ label: "Prospects", value: 20 }}
              />
              <DashboardCard
                title="Accounts"
                icon={<CreditCard className="w-5 h-5 text-blue-500" />}
                mainStat={{ label: "Balance", value: 150 }}
                secondaryStat={{ label: "Revenue", value: 100 }}
                inFunnel={{ label: "In Expenses", value: 20 }}
              />
            </div>
    
            <div className="bg-white rounded-lg shadow p-4 mb-6 w-full md:w-1/3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Revenue</h3>
              </div>
              <RevenueChart 
                data={monthlyData} 
                totalRevenue={totalRevenue} 
                formatCurrency={formatCurrency} 
              />
            </div>
          </div>
          </section>


          <section id="attendance">
          <AttendanceCalendar />
          </section>


          <section id="quick-actions">
          <QuickSection onTransactionAdded={handleTransactionAdded} />
          </section>





    </div>
  );
}

function DashboardCard({ title, icon, mainStat, secondaryStat, inFunnel }) {
  return (
    <div className="bg-white flex w-full items-center rounded-lg shadow p-4 outer-block">
      <div className="inner-block  w-full ">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg  ml-2">{title}</h3>
          </div>
          <button className="text-sm text-red-500 font-bold hover:text-red-700">
            View more
          </button>
        </div>
        <div className="flex justify-between">
          <div className="flex w-full gap-2 items-center">
            <p className="text-gray-600 col-6">{mainStat.label}</p>
            <p className="text-2xl  col-6" style={{ fontSize: "1.1rem" }}>
              {mainStat.value}
            </p>
          </div>
          <div className="text-right flex w-full justify-end gap-5 items-center">
            <p className="text-gray-600 ">{secondaryStat.label}</p>
            <p className="text-2xl " style={{ fontSize: "1.1rem" }}>
              {secondaryStat.value}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="flex w-50 gap-2 items-center">
              <p className="text-gray-600 col-6">{inFunnel.label}</p>
              <p className="text-1xl  col-6">{inFunnel.value}</p>
            </div>
            {/* <p className="text-gray-600">{inFunnel.label} <span className="text-black-500 font-semibold">{inFunnel.value}</span></p> */}
            {/* <p className="text-lg font-semibold">{inFunnel.value}</p> */}
            <button className="text-sm text-blue-500 hover:text-blue-700">
              Add Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
