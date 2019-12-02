import rawCountries from './rawCountries'

// let allCountryCodes = {}
//
// function addCountryCode(iso2, dialCode, priority) {
//   if (!(dialCode in allCountryCodes)) {
//     allCountryCodes[dialCode] = [];
//   }
//   const index = priority || 0;
//   allCountryCodes[dialCode][index] = iso2;
// }

function initCountriesAndAreaCodes(enableAreaCodes) { // boolean || array of iso2 codes
  let enableAllCodes;
  if (typeof enableAreaCodes === 'boolean') { enableAllCodes = true }
  else { enableAllCodes = false }

  return [].concat(...rawCountries.map((country) => {
    const countryItem = {
      name: country[0],
      regions: country[1],
      iso2: country[2],
      dialCode: country[3],
      format: country[4] || undefined,
      priority: country[5] || 0,
      hasAreaCodes: country[6] ? true : false,
    };

    const areaItems = [];

    country[6] && (enableAllCodes || enableAreaCodes.includes(country[2])) && country[6].map((areaCode) => {
      const areaItem = {...countryItem};
      areaItem.regions = country[1];
      areaItem.dialCode = country[3] + areaCode;
      areaItem.isAreaCode = true;

      areaItems.push(areaItem);

      // addCountryCode(country[2], areaItem.dialCode);
    });

    // addCountryCode(
    //   countryItem.iso2,
    //   countryItem.dialCode,
    //   countryItem.hasAreaCodes
    // );

    if (areaItems.length > 0) {
      countryItem.mainCode = true;
      return [countryItem, ...areaItems];
    } else {
      return [countryItem];
    }
  }))
}

function initCountries() {
  return rawCountries.map((country) => ({
    name: country[0],
    regions: country[1],
    iso2: country[2],
    dialCode: country[3],
    format: country[4] || undefined,
    priority: country[5] || 0,
    hasAreaCodes: country[6] ? true : false,
  }))
}


export default class CountryData {
  constructor (
    enableAreaCodes, regions,
    onlyCountries, preferredCountries, excludeCountries, preserveOrder,
    localization, masks, areaCodes,
    predecessor
  ) {
    let filteredCountries = enableAreaCodes ? initCountriesAndAreaCodes(enableAreaCodes) : initCountries();
    if (regions) filteredCountries = this.filterRegions(regions, filteredCountries);

    this.onlyCountries = this.excludeCountries(
      this.extendCountries(
        this.getFilteredCountryList(onlyCountries, filteredCountries, preserveOrder.includes('onlyCountries')),
        localization, masks, areaCodes,
        predecessor
      ),
      excludeCountries
    );

    this.preferredCountries = preferredCountries.length === 0 ? [] :
      this.extendCountries(
        this.getFilteredCountryList(preferredCountries, filteredCountries, preserveOrder.includes('preferredCountries')),
        localization, masks, areaCodes,
        predecessor
      );
  }

  filterRegions = (regions, filteredCountries) => {
    if (typeof regions === 'string') {
      const region = regions;
      return filteredCountries.filter((country) => {
        return country.regions.some((element) => {
          return element === region;
        });
      });
    }

    return filteredCountries.filter((country) => {
      const matches = regions.map((region) => {
        return country.regions.some((element) => {
          return element === region;
        });
      });
      return matches.some(el => el);
    });
  }

  getFilteredCountryList = (countryCodes, sourceCountryList, preserveOrder) => {
    if (countryCodes.length === 0) return sourceCountryList;

    let filteredCountries;
    if (preserveOrder) {
      // filter using user-defined order
      filteredCountries = countryCodes.map(countryCode => {
        const country = sourceCountryList.find(country => country.iso2 === countryCode);
        if (country) return country;
      }).filter(country => country); // remove any not found
    }
    else {
      // filter using alphabetical order
      filteredCountries = sourceCountryList.filter((country) => {
        return countryCodes.some((element) => {
          return element === country.iso2;
        });
      });
    }

    return filteredCountries;
  }

  extendCountries = (countries, localization, masks, areaCodes, predecessor) => {
    for (let i = 0; i < countries.length; i++) {
      if (localization[countries[i].iso2] !== undefined) {
        countries[i].localName = localization[countries[i].iso2];
      }
      else if (localization[countries[i].name] !== undefined) {
        countries[i].localName = localization[countries[i].name];
      }

      if (masks[countries[i].iso2] !== undefined) {
        countries[i].format = masks[countries[i].iso2];
      }
      else if (masks[countries[i].name] !== undefined) {
        countries[i].format = masks[countries[i].name];
      }
    }

    if (Object.keys(areaCodes).length > 0) {
      let updCountries = [];
      let foundCountry = null;

      for (let i = 0; i < countries.length; i++) {
        updCountries.push(countries[i]);

        if (areaCodes[countries[i].iso2] !== undefined) {
          if (!foundCountry) foundCountry = countries[i];
          if (countries[i+1] && countries[i+1].iso2 === foundCountry.iso2) continue;
          this.getCustomAreas(foundCountry, areaCodes[countries[i].iso2]).forEach(o => {
            updCountries.push(o);
          });
          foundCountry = null;
        }
        else if (areaCodes[countries[i].name] !== undefined) {
          if (!foundCountry) foundCountry = countries[i];
          // skip until all native area codes pushed
          if (countries[i+1] && countries[i+1].iso2 === foundCountry.iso2) continue;
          this.getCustomAreas(foundCountry, areaCodes[countries[i].name]).forEach(o => {
            updCountries.push(o);
          });
          foundCountry = null;
        }
      }
      return predecessor == '+' ? updCountries : this.modifyPredecessor(updCountries, predecessor);
    }
    return predecessor == '+' ? countries : this.modifyPredecessor(countries, predecessor);
  }

  getCustomAreas = (country, areaCodes) => {
    let customAreas = [];
    for (let i = 0; i < areaCodes.length; i++) {
      let newCountry = JSON.parse(JSON.stringify(country));
      newCountry.dialCode += areaCodes[i];
      customAreas.push(newCountry);
    }
    return customAreas;
  }

  modifyPredecessor = (countries, predecessor) => {
    return countries.map(o => {
      if (o.format && o.format.slice(0, 1) == '+') o.format = predecessor+o.format.slice(1)
      return o;
    });
  }

  excludeCountries = (selectedCountries, excludedCountries) => {
    if (excludedCountries.length === 0) {
      return selectedCountries;
    } else {
      return selectedCountries.filter((selCountry) => {
        return !excludedCountries.includes(selCountry.iso2);
      });
    }
  }
}
