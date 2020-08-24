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
    onChange?(
      value: string,
      data: CountryData | {},
      event: React.ChangeEvent<HTMLInputElement>,
      formattedValue: string
    ): void;
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
    onEnterKeyPress?(event: React.KeyboardEvent<HTMLInputElement>): void;
    isValid?: ((
      value: string,
      country: object,
      countries: object[],
      hiddenAreaCodes: object[],
    ) => boolean | string) | boolean;
  }

  export interface PhoneInputProps extends PhoneInputEventsProps, Style {
    country?: string | number;
    value?: string | null;

    onlyCountries?: string[];
    preferredCountries?: string[];
    excludeCountries?: string[];

    placeholder?: string;
    searchPlaceholder?: string;
    searchNotFound?: string;
    disabled?: boolean;

    autoFormat?: boolean;
    enableAreaCodes?: boolean;
    enableTerritories?: boolean;

    disableCountryCode?: boolean;
    disableDropdown?: boolean;
    enableLongNumbers?: boolean | number;
    countryCodeEditable?: boolean;
    enableSearch?: boolean;
    disableSearchIcon?: boolean;

    regions?: string | string[];

    inputProps?: object;
    localization?: object;
    masks?: object;
    areaCodes?: object;

    preserveOrder?: string[];

    defaultMask?: string;

    alwaysDefaultMask?: boolean;
    prefix?: string;
    copyNumbersOnly?: boolean;
    renderStringAsFlag?: string;
    autocompleteSearch?: boolean;
    jumpCursorToEnd?: boolean;
    priority?: object;
    enableAreaCodeStretch?: boolean;
    enableClickOutside?: boolean;
    showDropdown?: boolean;

    defaultErrorMessage?: string;
    specialLabel?: string;
    disableInitialCountryGuess?: boolean;
    disableCountryGuess?: boolean;
  }
  const PhoneInput: React.FC<PhoneInputProps>;
  export default PhoneInput;
}
