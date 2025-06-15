import ChsHead from "@/components/layouts/ChsHead";
import ProfilePage from "@/components/profile";
import RedirectRoute from "@/routes/RedirectRoute";

const profile = () => {
	return (
        <div>
            <ChsHead />
			<ProfilePage />
		</div>
	);
};
profile.noLayout = false;

export default profile;
