import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthLayout from './Layouts/AuthLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/signup';
import SetPassword from './pages/signup/SubPages/SetPassword';
import SignWithEmail from './pages/signup/SubPages/SignWithEmail';
import VerifyOtp from './pages/signup/SubPages/VerifyOtp';
import Homepage from './pages/Homepage';
import SignUpLoading from './pages/signup/SubPages/Loading';
import ForgotPassword from './pages/ForgotPassword';
import PasswordMail from './pages/ForgotPassword/SubPages/CheckMail';
import ResetPassword from './pages/ForgotPassword/SubPages/ResetPassword';
import SignInWithEmail from './pages/SignIn/SubPages/SignWithEmail';
import EventDetails from './pages/SingleEvent';
import Events from './pages/Events';
import DashboardLayout from './Layouts/DashBoardLayout';
import SingleEvent from './pages/SingleEvent';
import CreateEvent from './pages/CreateEvent';
import Gift from './pages/Gift';
import GiftDetails from './pages/Gifts/GiftDetails';
import Marketplace from './pages/Marketplace'
import Market from './pages/Marketplace/subpages/Market/Market'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route element={<AuthLayout />} path="/">
          <Route path="signin" element={<SignIn />} />
          <Route path="signin_with_email" element={<SignInWithEmail />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="signup_with_email" element={<SignWithEmail />} />
          <Route path="signup_verify_otp" element={<VerifyOtp />} />
          <Route path="signup_set_password" element={<SetPassword />} />
          <Route path="signup_loading" element={<SignUpLoading />} />
          <Route path="forgot_password" element={<ForgotPassword />} />
          <Route path="forgot_password_mail" element={<PasswordMail />} />
          <Route path="change_password" element={<ResetPassword />} />
        </Route>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index path="" element={<Events />} />
          <Route path="/dashboard/gifts" element={<Gift />} />
          <Route path="/dashboard/marketplace" element={<Marketplace />} />
          <Route path="/dashboard/marketplace/market" element={<Market />} />
          <Route path="/dashboard/event_details" element={<EventDetails />} />
          <Route
            path="/dashboard/event_details/:id"
            element={<SingleEvent />}
          />
          <Route
            path="/dashboard/gift/gift_details/:id"
            element={<GiftDetails />}
          />
        </Route>
        {/* <Route path="/gift_details/:id" element={<GiftDetails />} /> */}
        <Route path="/create_event" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
