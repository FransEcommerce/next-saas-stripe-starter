import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Country, CountryDropdown } from "@/components/ui/country-dropdown"
import { PhoneInput, CountryData } from "@/components/ui/phone-input"
import { State, City } from "country-state-city"
import { countries } from "country-data-list"
import { StateProvinceSelect } from "@/components/ui/state-province-select"
import { CitySelect } from "@/components/ui/city-select"

interface BillingAddressFormProps {
  formData: {
    email: string
    name: string
    company: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
  }
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFormDataChange?: (data: Partial<any>) => void
  onNext: () => void
}

export function BillingAddressForm({
  formData,
  handleInputChange,
  handleFormDataChange,
  onNext
}: BillingAddressFormProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null)
  const [countryData, setCountryData] = React.useState<CountryData>()
  const [states, setStates] = React.useState<any[]>([])
  const [cities, setCities] = React.useState<any[]>([])
  const [countryCode, setCountryCode] = React.useState<string | null>(null)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  React.useEffect(() => {
    if (formData.country && !selectedCountry) {
      const country = countries.all.find((c) => c.alpha3 === formData.country) || countries.all.find((c) => c.name.toLowerCase() === formData.country.toLowerCase());
      if (country) {
        setSelectedCountry(country as Country);
        setCountryData(country as CountryData);
        setCountryCode(country.alpha3);
      }
    }
  }, [formData.country, selectedCountry]);

  React.useEffect(() => {
    if (selectedCountry) {
      const statesList = State.getStatesOfCountry(selectedCountry.alpha2);
      setStates(statesList);
      if (formData.state) {
        const stateByCode = statesList.find(s => s.isoCode === formData.state);
        if (stateByCode) {
        } else {
          const stateByName = statesList.find(s => s.name === formData.state);
          if (stateByName && handleFormDataChange) {
            handleFormDataChange({ state: stateByName.isoCode });
          }
        }
      }
    }
  }, [selectedCountry, formData.state, handleFormDataChange]);

  React.useEffect(() => {
    if (selectedCountry?.alpha2 && formData.state) {
      const citiesList = City.getCitiesOfState(selectedCountry.alpha2, formData.state);
      setCities(citiesList);
      if (formData.city && citiesList.length > 0) {
        const cityExists = citiesList.some(c => c.name === formData.city);
        if (!cityExists && handleFormDataChange) {
        }
      }
    }
  }, [selectedCountry, formData.state, formData.city, handleFormDataChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCountry && handleFormDataChange) {
      const countryName = selectedCountry.name;
      
      let stateName = formData.state;
      if (selectedCountry.alpha2 && formData.state) {
        const stateObj = State.getStateByCodeAndCountry(formData.state, selectedCountry.alpha2);
        if (stateObj) {
          stateName = stateObj.name;
        }
      }
      
      handleFormDataChange({
        state: stateName,
        country: countryName
      });
    }
    onNext();
  };

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setCountryData(country);
    setCountryCode(country.alpha3);
    if (handleFormDataChange) {
      handleFormDataChange({ 
        country: country.alpha3,  
        state: "",
        city: ""
      });
      if (country.countryCallingCodes && country.countryCallingCodes.length > 0) {
        handleFormDataChange({ phone: country.countryCallingCodes[0] });
      }
    }
  };

  const handleStateChange = (value: string) => {
    if (handleFormDataChange) {
      handleFormDataChange({ 
        state: value,
        city: "" 
      });
    }
  };

  const handleCityChange = (value: string) => {
    if (handleFormDataChange) {
      handleFormDataChange({ city: value });
    }
  };

  const handlePhoneChange = (value: string) => {
    if (handleFormDataChange) {
      handleFormDataChange({ phone: value });
    }
  };

  return (
    <motion.form
      {...fadeIn}
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <CountryDropdown
              placeholder="Select country"
              defaultValue={countryCode || formData.country}
              onChange={handleCountryChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              name="company"
              placeholder="Acme Inc."
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="Street address, P.O. box, apartment, suite, etc."
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StateProvinceSelect
            countryCode={selectedCountry?.alpha2}
            value={formData.state || ""}
            onChange={handleStateChange}
            required
          />
          <CitySelect
            countryCode={selectedCountry?.alpha2}
            stateCode={formData.state || ""}
            value={formData.city || ""}
            onChange={handleCityChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP / Postal code</Label>
            <Input
              id="zip"
              name="zip"
              placeholder="94103"
              value={formData.zip}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <PhoneInput
              value={formData.phone || ""}
              onChange={handlePhoneChange}
              defaultCountry={selectedCountry?.alpha2}
              onCountryChange={setCountryData}
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Continue to payment
      </Button>
    </motion.form>
  )
}
