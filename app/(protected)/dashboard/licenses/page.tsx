import { LicenseDashboard } from "./components/license-dashboard"
import { getUserLicenses } from "./queries"

export default async function LicensesPage() {
    const licenses = await getUserLicenses()

    return (
        <div className="container mx-auto py-6">
            <LicenseDashboard initialLicenses={licenses} />
        </div>
    )
}