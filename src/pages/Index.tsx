import { useNavigate } from "react-router-dom";

const Index = () => {
  // Redirect handled by App.tsx route — this page is unused
  const navigate = useNavigate();
  navigate("/", { replace: true });
  return null;
};

export default Index;
