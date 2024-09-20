import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

interface HomePageData {
  data: {
    username: string;
  };
}

function HomePage({ data }: HomePageData): JSX.Element {
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <h1>
        This is the Home Page. You are seeing this because you are logged in.
        Hello, {data.username}
      </h1>
      // Button code
      <button className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
        Log Out
      </button>
      {/* <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <SidebarLink
            link={{
              label: "Manu Arora",
              href: "#",
              icon: null,
            }}
          />
        </SidebarBody>
      </Sidebar> */}
    </>
  );
}

const rootElement = document.getElementById("root")!;
const data = JSON.parse(rootElement.getAttribute("data-context")!);

createRoot(rootElement).render(
  <StrictMode>
    <HomePage data={data} />
  </StrictMode>
);
