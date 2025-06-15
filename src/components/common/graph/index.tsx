import React, { useState } from "react";
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

// Register necessary Chart.js components
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

interface GraphComponentProps {}

const GraphComponent: React.FC<GraphComponentProps> = () => {
  const [activeTab, setActiveTab] = useState<"Daily" | "Weekly" | "Monthly">(
    "Daily"
  );

  const handleTabChange = (tab: "Daily" | "Weekly" | "Monthly") => {
    setActiveTab(tab);
  };

  // Data for different tabs
  const chartData = {
    Daily: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Mon",
          data: [10000, 15000, 20000, 25000, 18000, 22000, 28000],
          borderColor: "#6B4226",
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 0,
          borderDash: [5, 5],
        },
        {
          label: "Sun",
          data: [15000, 10000, 20000, 17000, 21000, 24000, 30000],
          borderColor: "#FF4B4B",
          borderWidth: 1,
          tension: 0.4,
          pointBackgroundColor: "#FF4B4B",
          pointHoverRadius: 6,
        },
      ],
    },
    Weekly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Weekdays",
          data: [60000, 75000, 82000, 91000],
          borderColor: "#6B4226",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          borderDash: [5, 5],
        },
        {
          label: "Weekends",
          data: [70000, 62000, 78000, 85000],
          borderColor: "#FF4B4B",
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: "#FF4B4B",
          pointHoverRadius: 6,
        },
      ],
    },
    Monthly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Mon",
          data: [50000, 60000, 75000, 72000, 81000, 90000, 88000, 87000, 92000, 95000, 100000, 110000],
          borderColor: "#6B4226",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          borderDash: [5, 5],
        },
        {
          label: "Sun",
          data: [52000, 59000, 70000, 74000, 80000, 88000, 89000, 86000, 91000, 94000, 101000, 111000],
          borderColor: "#FF4B4B",
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: "#FF4B4B",
          pointHoverRadius: 6,
        },
      ],
    },
  };

  // Chart options
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio for custom sizing
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
              onClick={() => handleTabChange(tab as "Daily" | "Weekly" | "Monthly")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700"
              }  transition-all duration-300`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      {/* Chart with fixed width and height */}
      <div className="relative w-full h-[240px]">
        <Line data={chartData[activeTab]} options={options} />
      </div>
    </div>
  );
};

export default GraphComponent;
