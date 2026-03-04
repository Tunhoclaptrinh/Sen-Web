import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    // console.log("GA initialized with ID:", GA_MEASUREMENT_ID);
  } else {
    console.warn("GA Measurement ID not found in environment variables.");
  }
};

export const sendPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const sendEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
