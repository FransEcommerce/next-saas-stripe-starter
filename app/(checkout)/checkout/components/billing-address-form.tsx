import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Country, CountryDropdown } from "@/components/ui/country-dropdown"
import { PhoneInput, CountryData } from "@/components/ui/phone-input"
import { State, City } from "country-state-city"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  React.useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.alpha2)
      setStates(states)
    }
  }, [selectedCountry])

  React.useEffect(() => {
    if (formData.state) {
      const cities = City.getCitiesOfState(selectedCountry?.alpha2 || "", formData.state)
      setCities(cities)
    }
  }, [formData.state, selectedCountry])

  return (
    <motion.form
      {...fadeIn}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
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
                setFormData((prev: any) => ({ ...prev, country: country.alpha3 }))
                setSelectedCountry(country)
                setCountryData(country)
                setFormData((prev: any) => ({ ...prev, phone: country.countryCallingCodes[0] }))
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
            placeholder="123 Main St"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">State / Province</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, state: value }))}
              disabled={states.length === 0}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder={states.length === 0 ? "No states available" : "Select state"} />
              </SelectTrigger>
              <SelectContent>
                {states.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No states available for this country</div>
                ) : (
                  states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.isoCode}>
                      {state.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, city: value }))}
              disabled={cities.length === 0}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder={cities.length === 0 ? "No cities available" : "Select city"} />
              </SelectTrigger>
              <SelectContent>
                {cities.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-2">No cities available for this state</div>
                ) : (
                  cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
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
              value={formData.phone}
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
