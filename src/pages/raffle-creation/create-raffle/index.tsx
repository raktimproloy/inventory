
import ChsHead from "@/components/layouts/ChsHead";
import CreateRaffle from "@/components/raffle/create";
import PrivateRoute from "@/routes/PrivetRoute";

const CreateRafflePage = () => {
	return (
		<PrivateRoute>
            <ChsHead />
			<CreateRaffle />
		</PrivateRoute>
	);
};

export default CreateRafflePage;
