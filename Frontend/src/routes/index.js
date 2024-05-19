import NotFoundPage from "../not-found";
import MainPage from "../pages/Main";
import MatchPage from "../pages/Match";
import RoomPage from "../pages/Room";
import GamePage from "../pages/Game";
import TwoFAPage from "../pages/TwoFA";

// export const routes = [
//   {
//     path: "/",
//     element: HomePage,
//     errorElement: NotFoundPage,
//     children: [
//       {
//         path: "blog",
//         element: BlogPage,
//       },
//       {
//         path: "post",
//         children: [
//           {
//             path: ":id",
//             element: PostPage,
//           },
//         ],
//       },
//     ],
//   },
// ];

export const routes = [
  {
    path: "/",
    element: MainPage,
    errorElement: NotFoundPage,
    children: [
      {
        path: "2fa",
        element: TwoFAPage,
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
    ],
  },
];
