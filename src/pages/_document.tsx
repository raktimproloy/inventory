// eslint-disable-next-line @typescript-eslint/no-empty-object-type
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en" className="scroll-smooth">
			<Head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="/icon.png"></link>
				<meta name="theme-color" content="#10357F" />
				<meta name="robots" content="index, follow" />
				<meta name="author" content="Churchfield Home Services LTD." />
				<meta name="publisher" content="Churchfield Home Services LTD." />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
