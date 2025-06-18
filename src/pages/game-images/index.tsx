import GameImageLibrary from "@/components/game-image-library";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const GameImageLibraryPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<GameImageLibrary />
		</PrivateRoute>
	);
};

export default GameImageLibraryPage;
