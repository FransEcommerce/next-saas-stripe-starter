import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";
import { User } from "@prisma/client";

interface BillingInfo {
  billingName: string;
  billingEmail: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingZip: string;
  billingPhone: string;
}

interface CustomerFormProps {
  users: User[];
  selectedUserId: string;
  billingInfo: BillingInfo;
  onUserChange: (userId: string) => void;
  onBillingInfoChange: (info: BillingInfo) => void;
}

export function CustomerForm({
  users,
  selectedUserId,
  billingInfo,
  onUserChange,
  onBillingInfoChange,
}: CustomerFormProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase().trim();
    return (
      (user.name?.toLowerCase() || "").includes(searchLower) ||
      (user.email?.toLowerCase() || "").includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          Select a customer and fill in billing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">Customer</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedUserId ? (
                    <div className="flex flex-col items-start">
                      {users.find(u => u.id === selectedUserId)?.name}
                      <div className="text-xs text-muted-foreground">
                        {users.find(u => u.id === selectedUserId)?.email}
                      </div>
                    </div>
                  ) : (
                    "Select customer..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by email..."
                    value={search}
                    onValueChange={setSearch}
                    className="h-9"
                  />
                  {filteredUsers.length === 0 ? (
                    <CommandEmpty>No customer found.</CommandEmpty>
                  ) : (
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {filteredUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => {
                            onUserChange(user.id);
                            setOpen(false);
                          }}
                          className="cursor-pointer hover:bg-accent"
                        >
                          <button
                            type="button"
                            className="flex flex-col w-full text-left"
                            onClick={() => {
                              onUserChange(user.id);
                              setOpen(false);
                            }}
                          >
                            <div>{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingName">Full Name</Label>
              <Input
                id="billingName"
                value={billingInfo.billingName}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Email</Label>
              <Input
                id="billingEmail"
                value={billingInfo.billingEmail}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingEmail: e.target.value })}
                type="email"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Address</Label>
            <Input
              id="billingAddress"
              value={billingInfo.billingAddress}
              onChange={(e) => onBillingInfoChange({ ...billingInfo, billingAddress: e.target.value })}
              placeholder="123 Street Name"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                value={billingInfo.billingCity}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingCity: e.target.value })}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingState">State</Label>
              <Input
                id="billingState"
                value={billingInfo.billingState}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingState: e.target.value })}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingZip">ZIP Code</Label>
              <Input
                id="billingZip"
                value={billingInfo.billingZip}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingZip: e.target.value })}
                placeholder="ZIP"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingCountry">Country</Label>
              <Input
                id="billingCountry"
                value={billingInfo.billingCountry}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingCountry: e.target.value })}
                placeholder="Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingPhone">Phone</Label>
              <Input
                id="billingPhone"
                value={billingInfo.billingPhone}
                onChange={(e) => onBillingInfoChange({ ...billingInfo, billingPhone: e.target.value })}
                type="tel"
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
