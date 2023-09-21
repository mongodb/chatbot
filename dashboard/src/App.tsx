import React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
import { ExampleProvider } from "./DataProvider";

export const App = () => (
  <Admin dataProvider={ExampleProvider}>
    <Resource name="conversations" list={ListGuesser} />
  </Admin>
);
