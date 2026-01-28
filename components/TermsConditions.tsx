import { Separator } from "./ui/separator";

export function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-primary">Terms & Conditions</h1>
      <Separator className="mb-8" />
      
      <div className="prose max-w-none text-foreground space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p>
            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Radha Sarees ("we," "us," or "our"), 
            concerning your access to and use of the radhasarees.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Products</h2>
          <p>
            We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. 
            However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, 
            and your electronic display may not accurately reflect the actual colors and details of the products.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Purchases and Payment</h2>
          <p>
            We accept the following forms of payment: Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD). 
            You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. 
            You further agree to promptly update your account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Return Policy</h2>
          <p>
            Please review our Return Policy posted on the Site prior to making any purchases. All refunds will be processed within 7-10 business days after the returned item is received and inspected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Intellectual Property Rights</h2>
          <p>
            Unless otherwise indicated, the Site and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") 
            and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Modifications</h2>
          <p>
            We reserve the right to change, modify, or remove the contents of the Site at any time or for any reason at our sole discretion without notice. 
            However, we have no obligation to update any information on our Site. We also reserve the right to modify or discontinue all or part of the Site without notice at any time.
          </p>
        </section>
      </div>
    </div>
  );
}
