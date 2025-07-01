import InventoryList from "@/components/inventory/inventory-list";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const DatabasePage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<InventoryList />
		</PrivateRoute>
	);
};

export default DatabasePage;
