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

  // 加载城市列表
  useEffect(() => {
    if (countryCode && stateCode) {
      console.log("CitySelect: 加载城市列表", countryCode, stateCode);
      const citiesList = City.getCitiesOfState(countryCode, stateCode)
      setCities(citiesList)
    } else {
      setCities([])
    }
  }, [countryCode, stateCode])

  // 处理 value 变化
  useEffect(() => {
    if (value && cities.length > 0) {
      console.log("CitySelect: 处理城市值", value);
      
      // 检查 value 是否在城市列表中
      const cityExists = cities.some(city => city.name === value)
      
      if (cityExists) {
        console.log("CitySelect: 城市存在于列表中", value);
        setSelectedValue(value)
      } else {
        // 尝试查找名称匹配的城市（不区分大小写）
        const matchingCity = cities.find(city => 
          city.name.toLowerCase() === value.toLowerCase()
        )
        
        if (matchingCity) {
          console.log("CitySelect: 找到匹配的城市", value, "->", matchingCity.name);
          setSelectedValue(matchingCity.name)
          // 通知父组件正确的城市名称
          if (matchingCity.name !== value) {
            onChange(matchingCity.name)
          }
        } else {
          console.log("CitySelect: 城市不存在于列表中", value);
          // 如果城市不存在于列表中，保持当前值，让用户自己选择
          setSelectedValue("")
        }
      }
    } else {
      setSelectedValue("")
    }
  }, [value, cities, onChange])

  // 处理选择变化
  const handleChange = (newValue: string) => {
    console.log("CitySelect: 选择变更", newValue);
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