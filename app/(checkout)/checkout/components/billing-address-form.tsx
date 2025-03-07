import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Country, CountryDropdown } from "@/components/ui/country-dropdown"
import { PhoneInput, CountryData } from "@/components/ui/phone-input"
import { State, City } from "country-state-city"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  setFormData: React.Dispatch<React.SetStateAction<any>>
  onNext: () => void
}

export function BillingAddressForm({
  formData,
  handleInputChange,
  setFormData,
  onNext
}: BillingAddressFormProps) {
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null)
  const [countryData, setCountryData] = React.useState<CountryData>()
  const [states, setStates] = React.useState<any[]>([])
  const [cities, setCities] = React.useState<any[]>([])
  const [isInitialized, setIsInitialized] = React.useState(false)

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  React.useEffect(() => {
    if (formData.country && !selectedCountry) {
      const country = countries.all.find((c) => c.alpha3 === formData.country);
      if (country) {
        setSelectedCountry(country as Country);
        setCountryData(country as CountryData);
      }
    }
  }, [formData.country, selectedCountry]);

  React.useEffect(() => {
    if (selectedCountry) {
      const statesList = State.getStatesOfCountry(selectedCountry.alpha2);
      setStates(statesList);
    }
  }, [selectedCountry]);

  React.useEffect(() => {
    if (selectedCountry?.alpha2 && formData.state && !isInitialized) {
      const citiesList = City.getCitiesOfState(selectedCountry.alpha2, formData.state);
      setCities(citiesList);
      setIsInitialized(true);
    }
  }, [selectedCountry, formData.state, isInitialized]);

  // 添加一个函数来获取州名
  const getStateName = (countryCode: string, stateCode: string) => {
    const state = State.getStateByCodeAndCountry(stateCode, countryCode)
    return state?.name || stateCode
  }

  return (
    <motion.form
      {...fadeIn}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        
        // 在提交前转换州代码为州名
        if (selectedCountry?.alpha2 && formData.state) {
          const stateName = getStateName(selectedCountry.alpha2, formData.state)
          setFormData(prev => ({
            ...prev,
            state: stateName,
            country: selectedCountry.name  // 使用国家名称而不是代码
          }))
        }
        
        onNext()
      }}
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
              defaultValue={formData.country}
              onChange={(country) => {
                setFormData((prev: any) => ({ 
                  ...prev, 
                  country: country.name,  // 保存国家名称而不是代码
                  state: "",
                  city: ""
                }));
                setSelectedCountry(country);
                setCountryData(country);
                if (country.countryCallingCodes && country.countryCallingCodes.length > 0) {
                  setFormData((prev: any) => ({ 
                    ...prev, 
                    phone: country.countryCallingCodes[0] 
                  }));
                }
              }}
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
            onChange={(value) => setFormData((prev: any) => ({ 
              ...prev, 
              state: value,
              city: "" 
            }))}
            required
          />
          <CitySelect
            countryCode={selectedCountry?.alpha2}
            stateCode={formData.state || ""}
            value={formData.city || ""}
            onChange={(value) => setFormData((prev: any) => ({ ...prev, city: value }))}
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
              onChange={(value) => setFormData((prev: any) => ({ ...prev, phone: value }))}
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
