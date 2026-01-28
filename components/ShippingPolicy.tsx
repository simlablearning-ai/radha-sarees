import { Separator } from "./ui/separator";

export function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-primary">Shipping Policy</h1>
      <Separator className="mb-8" />
      
      <div className="prose max-w-none text-foreground space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Shipping Zones</h2>
          <p>
            Radha Sarees ships to all pin codes across India. We also offer international shipping to select countries. 
            Please check the eligibility of your location at checkout.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Processing Time</h2>
          <p>
            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
            If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Shipping Rates & Delivery Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout.
          </p>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Delivery Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Standard Shipping</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5-7 business days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Free (Orders above ₹999)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Express Shipping</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2-3 business days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹250</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Shipment Confirmation & Order Tracking</h2>
          <p>
            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). 
            The tracking number will be active within 24 hours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Damages</h2>
          <p>
            Radha Sarees is not liable for any products damaged or lost during shipping. If you received your order damaged, 
            please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
          </p>
        </section>
      </div>
    </div>
  );
}
