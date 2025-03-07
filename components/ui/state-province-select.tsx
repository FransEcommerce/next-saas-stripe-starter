import React, { useEffect, useState } from "react"
import { State } from "country-state-city"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface StateProvinceSelectProps {
  countryCode?: string
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
}

export function StateProvinceSelect({
  countryCode,
  value,
  onChange,
  label = "State / Province",
  required = false
}: StateProvinceSelectProps) {
  const [states, setStates] = useState<any[]>([])

  useEffect(() => {
    if (countryCode) {
      const statesList = State.getStatesOfCountry(countryCode)
      setStates(statesList)
    } else {
      setStates([])
    }
  }, [countryCode])

  return (
    <div className="space-y-2">
      <Label htmlFor="state">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Select
        value={value}
        onValueChange={onChange}
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
  )
} 