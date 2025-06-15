
"use client";

import React, { useEffect, useState } from "react";
import CardComponent from "../Card";
import {
	getActiveRafflesCount,
	getTotalGameSales,
	getLowStockItemsCount,
	getUsersCount,
} from "../../../../service/dashboardService";

const Counter: React.FC = () => {
	const [data, setData] = useState<CounterDataType[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const [active, sales, lowStock, users] = await Promise.all([
				getActiveRafflesCount(),
				getTotalGameSales(),
				getLowStockItemsCount(),
				getUsersCount(),
			]);

			setData([
				{
					id: 1,
					title: "Live Games",
					icon: "/images/icon/1.svg",
					count: active.toString(),
				},
				{
					id: 2,
					title: "Total Game Sales",
					icon: "/images/icon/2.svg",
					count: sales.toString(),
				},
				{
					id: 3,
					title: "Low Stock Items",
					icon: "/images/icon/3.svg",
					count: lowStock.toString(),
				},
				{
					id: 4,
					title: "Users",
					icon: "/images/icon/4.png",
					count: users.toString(),
				},
			]);
		};

		fetchData();
	}, []);

	return (
		<div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-6">
			{data.map((item) => (
				<div key={item.id}>
					<CardComponent
						title={item.title}
						icon={item.icon}
						count={item.count}
					/>
				</div>
			))}
		</div>
	);
};

export default Counter;

interface CounterDataType {
	id: number;
	title: string;
	icon: string;
	count: string;
}
