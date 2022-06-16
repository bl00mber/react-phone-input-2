import React from "react";
import { useState } from "react";
import PhoneInput from "../../src";

export const PhoneInputWithparentState = () => {
  const [countryState, setCountryState] = useState({
    dialCode: "+1",
    iso2: "us",
  });

  return (
    <div>
      <p>Input with Country State being bubbled up to Parent component</p>
      <p>+{countryState.dialCode} is the currently selected country's code</p>
      <p>{countryState.iso2} is the currently selected country's iso2</p>
      <PhoneInput
        country="us"
        countryCodeNextToFlag
        disableCountryCode
        placeholder=""
        disableCountryGuess
        setCountryForParent={setCountryState}
        value="+12015550123"
        disableInitialCountryGuess
        enableLongNumbers
      />
    </div>
  );
};
