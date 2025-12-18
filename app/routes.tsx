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

    ...prefix("usuarios", [
      index("./routes/_auth/users/users.tsx"),
      route("nuevo", "./routes/_auth/users/new.tsx"),
      route("/editar/:id", "./routes/_auth/users/edit.tsx"),
    ]),

    ...prefix("pacientes", [
      index("./routes/_auth/patients/patients.tsx"),
      route("nuevo", "./routes/_auth/patients/new.tsx"),
      route("/editar/:id", "./routes/_auth/patients/edit.tsx"),
    ]),

    ...prefix("planes", [
      index("./routes/_auth/plans/plans.tsx"),
      route("nuevo", "./routes/_auth/plans/new.tsx"),
      route("/editar/:id", "./routes/_auth/plans/edit.tsx"),
    ]),

    ...prefix("empresas", [
      index("./routes/_auth/companies/companies.tsx"),
      route("nueva", "./routes/_auth/companies/new.tsx"),
      route("/editar/:id", "./routes/_auth/companies/edit.tsx"),
    ]),

    ...prefix("tickets", [
      index("./routes/_auth/tickets.tsx"),
      route(":id", "./routes/_auth/tickets/$id.tsx"),
    ]),
  ]),

  route("login", "./routes/login.tsx"),
] satisfies RouteConfig;
