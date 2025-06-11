import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title and meta description
document.title = "Chicago Chronic Disease Data Commons - Rush University";

const metaDescription = document.querySelector('meta[name="description"]');
if (metaDescription) {
  metaDescription.setAttribute('content', 'Explore chronic disease prevalence across Chicago neighborhoods with interactive maps and comprehensive health data analytics from Rush University Health Equity Analytics Studio.');
}

createRoot(document.getElementById("root")!).render(<App />);
