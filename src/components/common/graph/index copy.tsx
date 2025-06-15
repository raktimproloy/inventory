"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartOptions,
} from "chart.js";
import { getRevenueGrouped } from "../../../../service/revenueService";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

type TabType = "Daily" | "Weekly" | "Monthly";

const GraphComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Daily");
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[],
  });

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchRevenueData = async () => {
      const revenue = await getRevenueGrouped(activeTab);
      setChartData({
        labels: revenue.labels,
        datasets: [
          {
            label: "Revenue",
            data: revenue.data,
            borderColor: "#6B4226",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            backgroundColor: "rgba(107, 66, 38, 0.1)",
            pointBackgroundColor: "#6B4226",
            pointHoverRadius: 6,
          },
        ],
      });
    };

    fetchRevenueData();
  }, [activeTab]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#000",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw?.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => `$${Number(value) / 1000}k`,
        },
        grid: {
          color: "#E5E7EB",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="border border-[#D0D5DD] rounded-xl p-6 bg-white w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] font-semibold text-dark">Revenue</h3>
        <div className="flex items-center divide-x divide-[#E4E7EC] rounded-md overflow-hidden border border-[#E4E7EC]">
          {["Daily", "Weekly", "Monthly"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as TabType)}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
              } transition-all duration-300`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="relative w-full h-[240px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GraphComponent;
