import ImageLibrary from "@/components/image-library";
import ChsHead from "@/components/layouts/ChsHead";
import PrivateRoute from "@/routes/PrivetRoute";

const ImageLibraryPage = () => {
	return (
		<PrivateRoute>
			<ChsHead />
			<ImageLibrary />
		</PrivateRoute>
	);
};

export default ImageLibraryPage;
