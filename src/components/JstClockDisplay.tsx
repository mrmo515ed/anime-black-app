import React, { useState, useEffect } from "react";

export const JstClockDisplay = () => {
  const [jstTime, setJstTime] = useState("");

  useEffect(() => {
    const updateJst = () => {
      const now = new Date();
      // JST is UTC + 9
      const jst = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
      const hrs = String(jst.getHours()).padStart(2, "0");
      const mins = String(jst.getMinutes()).padStart(2, "0");
      const secs = String(jst.getSeconds()).padStart(2, "0");
      setJstTime(`${hrs}:${mins}:${secs}`);
    };
    updateJst();
    const interval = setInterval(updateJst, 1000);
    return () => clearInterval(interval);
  }, []);

  return <>{jstTime || "00:00:00"}</>;
};
