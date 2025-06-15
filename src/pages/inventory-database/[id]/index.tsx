import EditInventory from "@/components/inventory/edit-inventory";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const EditInventoryPage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
            <EditInventory />
		</PrivateRoute>
	);
};

export default EditInventoryPage;
