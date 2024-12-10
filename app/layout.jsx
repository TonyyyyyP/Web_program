import "@styles/globals.css";

import Provider from "@components/Provider";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";

export const metadata = {
  title: "Promptopia",
  description: "Discover & Share AI Prompts",
};

const RootLayout = ({ children }) => (
  <html lang="en">
    <body>
      <Provider>
        <main className="app">
          <Navbar />
          {children}
          <Footer />
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
