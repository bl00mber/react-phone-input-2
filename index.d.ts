declare module "react-phone-input-2" {
  import React from "react";

  interface CountryData {
    name: string;
    dialCode: string;
    countryCode: string;
    format: string;
  }

  interface Style {
    containerClass?: string;
    inputClass?: string;
    buttonClass?: string;
    dropdownClass?: string;
    searchClass?: string;

    containerStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    buttonStyle?: React.CSSProperties;
    dropdownStyle?: React.CSSProperties;
    searchStyle?: React.CSSProperties;
  }

  interface PhoneInputEventsProps {
    onChange?(value: string, data: CountryData | {}): void;
    onFocus?(
      event: React.FocusEvent<HTMLInputElement>,
      data: CountryData | {}
    ): void;
    onBlur?(
      event: React.FocusEvent<HTMLInputElement>,
      data: CountryData | {}
    ): void;
    onClick?(
      event: React.MouseEvent<HTMLInputElement>,
      data: CountryData | {}
    ): void;
    onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
  }

  export interface PhoneInputProps extends PhoneInputEventsProps, Style {
    country?: string;
    value?: string;
    onlyCountries?: string[];
    preferredCountries?: string[];
    excludeCountries?: string[];
    placeholder?: string;
    searchPlaceholder?: string;
    inputProps?: object;

    autoFormat?: boolean;
    disabled?: boolean;
    disableDropdown?: boolean;
    disableCountryCode?: boolean;
    enableAreaCodes?: boolean;
    enableTerritories?: boolean;
    enableLongNumbers?: boolean;
    countryCodeEditable?: boolean;
    enableSearch?: boolean;
    disableSearchIcon?: boolean;
  }
  const PhoneInput: React.FC<PhoneInputProps>;
  export default PhoneInput;
}
