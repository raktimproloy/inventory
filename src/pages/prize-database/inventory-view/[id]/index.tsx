import ViewInventory from "@/components/inventory/view-inventory";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const ViewInventoryPage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
            <ViewInventory/>
		</PrivateRoute>
	);
};

export default ViewInventoryPage;
