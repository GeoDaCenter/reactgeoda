import dynamic from "next/dynamic";
import {Provider as ReduxProvider} from "react-redux";
import store from "../store";

const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <ReduxProvider store={store}>
        <DynamicMap />
      </ReduxProvider>
    </div>
  );
}
