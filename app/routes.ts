import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  layout("./routes/_auth/_layout.tsx", [
    index("./routes/_auth/home.tsx"),

    route("users", "./routes/_auth/users.tsx"),

    ...prefix("patients", [
      index("./routes/_auth/patients/patients.tsx"),
      route("new", "./routes/_auth/patients/new.tsx"),
      route("/edit/:id", "./routes/_auth/patients/edit.tsx"),
    ]),

    ...prefix("tickets", [
      index("./routes/_auth/tickets.tsx"),
      route(":id", "./routes/_auth/tickets/$id.tsx"),
    ]),
  ]),

  route("login", "./routes/login.tsx"),
] satisfies RouteConfig;
