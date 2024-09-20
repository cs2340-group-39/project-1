import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import {
  Accordion,
  AccordionItem,
  Button,
  Link,
  NextUIProvider,
} from "@nextui-org/react";

const defaultContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

function InfoPage(): JSX.Element {
  return (
    <>
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">Atlanta Food Finder</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Login</Link>
          </NavbarItem>
          <NavbarItem>
            <Button as={Link} color="primary" href="/accounts/" variant="flat">
              Sign Up or Log In
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <Accordion defaultExpandedKeys={["2"]}>
        <AccordionItem
          key="1"
          aria-label="Accordion 1"
          subtitle="Press to expand"
          title="Accordion 1"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="Accordion 2"
          subtitle={
            <span>
              Press to expand <strong>key 2</strong>
            </span>
          }
          title="Accordion 2"
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="3"
          aria-label="Accordion 3"
          subtitle="Press to expand"
          title="Accordion 3"
        >
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </>
  );
}

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <NextUIProvider>
      <InfoPage />
    </NextUIProvider>
  </StrictMode>
);
