import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Bazi from "../pages/bazi/page";
import Horoscope from "../pages/horoscope/page";
import Tarot from "../pages/tarot/page";
import Match from "../pages/match/page";
import Mbti from "../pages/mbti/page";
import WhiteMagic from "../pages/white-magic/page";
import BlackMagic from "../pages/black-magic/page";
import MoonBlocks from "../pages/moon-blocks/page";
import Shop from "../pages/shop/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/bazi",
    element: <Bazi />,
  },
  {
    path: "/horoscope",
    element: <Horoscope />,
  },
  {
    path: "/tarot",
    element: <Tarot />,
  },
  {
    path: "/match",
    element: <Match />,
  },
  {
    path: "/mbti",
    element: <Mbti />,
  },
  {
    path: "/moon-blocks",
    element: <MoonBlocks />,
  },
  {
    path: "/white-magic",
    element: <WhiteMagic />,
  },
  {
    path: "/black-magic",
    element: <BlackMagic />,
  },
  {
    path: "/shop",
    element: <Shop />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
