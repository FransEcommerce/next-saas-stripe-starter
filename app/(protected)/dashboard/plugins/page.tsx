import { PluginMarketplace } from "./components/plugin-marketplace"
import { getProductsAndPurchases } from "./queries"
// This is a server component
export default async function PluginsPage() {
    
    const products = await getProductsAndPurchases();
    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 max-w-full overflow-hidden">
            {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
            <PluginMarketplace initialProducts={products.products} initialUserPurchases={products.userPurchases} />
        </div>
    )
}
