import ChsHead from "@/components/layouts/ChsHead";
import CreateUser from "@/components/user/create";
import PrivateRoute from "@/routes/PrivetRoute";

const CreateInventoryPage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
			<CreateUser />
		</PrivateRoute>
	);
};

export default CreateInventoryPage;
