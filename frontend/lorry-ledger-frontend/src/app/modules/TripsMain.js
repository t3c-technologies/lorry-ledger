import { useState } from "react";
import Trips from "./Trips";
import TripsDetail from "./TripsDetail";

const TripsMain = () => {
  const [view, setView] = useState("list");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const viewTripDetails = (trip) => {
    setSelectedTrip(trip);
    setView("details");
  };

  const handleBack = () => {
    setView("list");
  };

  const renderContent = () => {
    switch (view) {
      case "list":
        return <Trips onSelectTrip={viewTripDetails} />;
      case "details":
        return <TripsDetail trip={selectedTrip} onBack={handleBack} />;
      default:
        return <Trips onSelectTrip={viewTripDetails} />;
    }
  };

  return <div>{renderContent()}</div>;
};

export default TripsMain;
