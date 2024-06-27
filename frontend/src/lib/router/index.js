import { pathToRegex } from "./utils";
import { createElement } from "../dom/client";
import { render } from "../dom";
import { setCurrentComponent } from "@/lib/jsx/jsx-runtime";
import { gotoPage } from "../libft";

const spaRouter = () => {
  let pageParams;
  const routeInfo = {
    root: null,
    routes: null,
  };

  const matchUrlToRoute = (routes, path) => {
    const segments = path.split("/").map((segment) => {
      if (segment === "") return "/";
      return segment;
    });

    if (segments.length <= 2 && segments[1] === "/") {
      return { Component: routes[0].element, params: undefined };
    }

    const traverse = (routes, segments, errorComponent) => {
      for (const route of routes) {
        const { path, children, element, errorElement } = route;
        const regex = pathToRegex(path);
        const [pathname, params] = segments[0].match(regex) || [];
        if (!pathname) continue;
        if (segments.length === 1) {
          return { Component: element, params: params };
        } else if (children) {
          return traverse(
            children,
            segments.slice(1),
            errorElement ?? errorComponent
          );
        }
      }
      return { Component: errorComponent, params: undefined };
    };
    return traverse(routes, segments);
  };

  const loadRouteComponent = (path) => {
    const { Component, params } = matchUrlToRoute(routeInfo.routes ?? [], path);

    if (!Component) {
      gotoPage("/");
    } else {
      pageParams = params;
      if (routeInfo.root) {
        setCurrentComponent(Component.name);
        render(routeInfo.root, Component);
      } else {
        throw new Error("root element is empty");
      }
    }
  };
  // TODO: Implement the history method: replace, back
  const history = {
    getPageParams() {
      return pageParams;
    },

    replace(path) {},

    push(path) {
      const { pathname, search } = new URL(window.location.origin + path);
      window.history.pushState({}, "", pathname + search);
      loadRouteComponent(pathname);
    },

    back() {},

    currentPath() {
      return window.location.pathname;
    },
  };

  const router = (root, routes) => {
    routeInfo.root = root;
    routeInfo.routes = routes;

    const customizeAnchorBehavior = () => {
      window.addEventListener("click", (e) => {
        const anchor = e.target.closest("a[data-link]");
        if (!(anchor instanceof HTMLAnchorElement)) return;
        if (!anchor) return;
        e.preventDefault();
        history.push(anchor.pathname + anchor.search);
      });
    };

    const initLoad = () => {
      loadRouteComponent(history.currentPath());
      customizeAnchorBehavior();

      window.addEventListener("popstate", () => {
        loadRouteComponent(history.currentPath());
      });
    };

    initLoad();
  };

  return { history, router };
};

export const { history, router } = spaRouter();
