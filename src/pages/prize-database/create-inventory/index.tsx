import CreateInventory from "@/components/inventory/create-inventory";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const CreateInventoryPage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
			<CreateInventory />
		</PrivateRoute>
	);
};

export default CreateInventoryPage;
