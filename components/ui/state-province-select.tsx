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
  const [selectedValue, setSelectedValue] = useState<string>("")

  // 加载州/省列表
  useEffect(() => {
    if (countryCode) {
      const statesList = State.getStatesOfCountry(countryCode)
      setStates(statesList)
    } else {
      setStates([])
    }
  }, [countryCode])

  // 处理 value 变化，支持代码和名称
  useEffect(() => {
    if (value && states.length > 0) {
      // 检查是否已经是 isoCode
      const stateByCode = states.find(state => state.isoCode === value)
      if (stateByCode) {
        setSelectedValue(value)
        return
      }
      
      // 检查是否是州/省名称
      const stateByName = states.find(state => state.name === value)
      if (stateByName) {
        setSelectedValue(stateByName.isoCode)
        // 通知父组件正确的代码
        if (stateByName.isoCode !== value) {
          onChange(stateByName.isoCode)
        }
        return
      }
      
      // 如果既不是代码也不是名称，设置为空
      setSelectedValue("")
    } else {
      setSelectedValue("")
    }
  }, [value, states, onChange])

  // 处理选择变化
  const handleChange = (newValue: string) => {
    setSelectedValue(newValue)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="state">{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Select
        value={selectedValue}
        onValueChange={handleChange}
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