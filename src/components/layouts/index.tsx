import React, { Fragment } from "react";
import Sidebar from "./Sidebar";
import Nav from "./Nav";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<Fragment>
			<Nav />
			<div className="lg:w-[calc(100%-250px)] md:p-6 p-4 ml-auto mt-[90px] app-body w-full">
				{children}
			</div>
			<Sidebar />
		</Fragment>
	);
};

export default Layout;
