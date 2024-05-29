import NotFoundPage from "../not-found";
import MainPage from "../pages/Main";
import MatchPage from "../pages/Match";
import RoomPage from "../pages/Room";
import GamePage from "../pages/Game";
import TwoFactorAuthPage from "../pages/TwoFactorAuth";
// import TestPage from "../pages/Test";

export const routes = [
  {
    path: "/",
    element: MainPage,
    errorElement: NotFoundPage,
    children: [
      {
        path: "TwoFactorAuth",
        element: TwoFactorAuthPage,
        children: []
      },
      {
        path: "match",
        element: MatchPage,
        children: [
          {
            path: ":id",
            element: RoomPage,
          },
        ],
      },
      {
        path: "game",
        children: [
          {
            path: ":id",
            element: GamePage,
          },
        ],
      },
      // {
      //   path: "test",
      //   element: TestPage,
      // }
    ],
  },
];
