import { Admin, Resource, ListGuesser } from "react-admin";
import { ChatbotDataProvider } from "./ChatbotDataProvider";

export const App = () => (
  <Admin dataProvider={myProvider}>
    <Resource name="conversations" list={ListGuesser} />
  </Admin>
);
