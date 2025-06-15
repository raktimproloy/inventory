// pages/_app.tsx
import Layout from "@/components/layouts";
import "aos/dist/aos.css";
import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import AOS from "aos";
import { ToastContainer } from "react-toastify";

// Extend the AppProps type to include `noLayout`
type CustomAppProps = AppProps & {
  Component: AppProps["Component"] & { noLayout?: boolean };
};

export default function App({ Component, pageProps }: CustomAppProps) {
  useEffect(() => {
    AOS.init({
      offset: 0,
      duration: 300,
      easing: "ease-in-sine",
      delay: 300,
      once: true, // For Repeating animations
    });
  }, []);

  const shouldUseLayout = !Component.noLayout;

  return (
    <>
      {shouldUseLayout ? (
        <Layout>
          <Component {...pageProps} />
          <ToastContainer />
        </Layout>
      ) : (
        <>
          <Component {...pageProps} />
          <ToastContainer />
        </>
      )}
    </>
  );
}
