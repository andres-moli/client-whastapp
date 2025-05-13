import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { LoagerPage } from "./pages/AuthPages/looager";
import GroupPage from "./pages/group";
import CellPage from "./pages/cell";
import BundlePage from "./pages/bundle";
import { UpdateBundlePage } from "./pages/bundle/updateModalBundle";
import { UpdateGroupPage } from "./pages/group/updateModalGroup";
import { CreateGroupPage } from "./pages/group/CreateGroupPage";
import ClassPage from "./pages/class";
import EditClassPage from "./pages/class/EditClassPage";
import SessionPage from "./pages/sesion";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route path="/looger/:token"  element={<LoagerPage />}/>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route index path="/groups" element={<GroupPage />} />
            <Route index path="/group/:id" element={<UpdateGroupPage />} />
            <Route index path="/group-create/" element={<CreateGroupPage />} />
            <Route index path="/cells" element={<CellPage />} />
            <Route index path="/bundles" element={<BundlePage />} />
            <Route index path="/bundle/:id" element={<UpdateBundlePage />} />
            <Route index path="/class" element={<ClassPage />} />
            <Route index path="/class/:id" element={<EditClassPage />} />
            <Route index path="/sesion" element={<SessionPage />} />
            
            
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
