import React, { useEffect, useState } from "react"
import { City } from "country-state-city"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CitySelectProps {
  countryCode?: string
  stateCode: string
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export function CitySelect({
  countryCode,
  stateCode,
  value,
  onChange,
  label = "City",
  required = false
}: CitySelectProps) {
  const [cities, setCities] = useState<any[]>([])
  const [selectedValue, setSelectedValue] = useState(value)

  useEffect(() => {
    if (countryCode && stateCode) {
      const citiesList = City.getCitiesOfState(countryCode, stateCode)
      setCities(citiesList)
    } else {
      setCities([])
    }
  }, [countryCode, stateCode])

  useEffect(() => {
    if (value && cities.length > 0) {
      const cityExists = cities.some(city => city.name === value)

      if (cityExists) {
        setSelectedValue(value)
      } else {
        const matchingCity = cities.find(city =>
          city.name.toLowerCase() === value.toLowerCase()
        )

        if (matchingCity) {
          setSelectedValue(matchingCity.name)
          if (matchingCity.name !== value) {
            onChange(matchingCity.name)
          }
        } else {
          setSelectedValue("")
        }
      }
    } else {
      setSelectedValue("")
    }
  }, [value, cities, onChange])

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="city">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Select
        value={selectedValue}
        onValueChange={handleChange}
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
  )
}