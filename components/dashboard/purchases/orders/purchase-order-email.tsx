// PurchaseOrderEmail.tsx
import * as React from 'react';
import { 
  Html, 
  Body, 
  Container, 
  Head, 
  Heading, 
  Hr, 
  Img, 
  Preview, 
  Section, 
  Text, 
  Column, 
  Row,
  Button,
  Link
} from '@react-email/components';
import { formatPrice } from '@/lib/formatPrice';

// Define the primary color - brand red
const PRIMARY_COLOR = '#e11d48';

interface PurchaseOrderEmailProps {
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  companyName: string;
  companyLogo?: string | null;
  supplierName?: string | null;
  supplierAddress?: string | null;
  supplierEmail?: string | null;
  supplierPhone?: string | null;
  confirmationUrl?: string | null;
  items: Array<{
    name: string;
    sku?: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  vat: number;
  total: number;
  paymentTerms?: string | null;
  deliveryAddress?: string | null;
  contactInfo: {
    email: string;
    phone: string;
  };
  notes?: string | null;
  status?: string | null;
}

export function PurchaseOrderEmail({
  poNumber,
  orderDate,
  expectedDeliveryDate,
  companyName,
  companyLogo,
  supplierName = "Supplier Name",
  supplierAddress,
  supplierEmail,
  supplierPhone,
  items,
  subtotal,
  vat,
  total,
  paymentTerms = "Net 40",
  deliveryAddress,
  contactInfo,
  notes,
  status = "Draft",
  confirmationUrl
}: PurchaseOrderEmailProps) {

  

  // Create mailto link for the confirmation button as fallback
  const replySubject = `RE: Purchase Order ${poNumber} Confirmation`;
  const emailConfirmationLink = `mailto:${contactInfo.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(`Dear ${companyName},\n\nWe confirm receipt of purchase order ${poNumber}.\n\nExpected delivery date: [Please specify delivery date]\n\nBest regards,\n[Your name/company]`)}`;

  // Determine which confirmation link to use (web or email)
  const confirmationLink = confirmationUrl || emailConfirmationLink;

  return (
    <Html>
      <Head />
      <Preview>Purchase Order {poNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Row>
              <Column style={{ padding: '0 24px' }}>
                <Text style={headerCompanyText}>{companyName}</Text>
                <Text style={headerPurchaseOrderText}>Purchase Order {poNumber}</Text>
              </Column>
            </Row>
          </Section>

          {/* PO Number and Status */}
          <Section style={poNumberSection}>
            <Row>
              <Column>
                <Text style={poNumberText}>PO: <span style={poNumberHighlightText}>{poNumber}</span></Text>
                <Text style={dateText}>Date: {orderDate}</Text>
              </Column>
              <Column align="right">
                <Text style={statusText}>Status:</Text>
                <Text style={statusValueText}>{status}</Text>
              </Column>
            </Row>
          </Section>

          {/* Supplier Info */}
          {supplierName && (
            <Section style={supplierSection}>
              <Text style={sectionTitleText}>Supplier: {supplierName}</Text>
              {supplierAddress && <Text style={normalText}>{supplierAddress}</Text>}
              {(supplierEmail || supplierPhone) && (
                <Row style={{ marginTop: '8px' }}>
                  <Column>
                    {supplierEmail && (
                      <Link href={`mailto:${supplierEmail}`} style={linkStyle}>
                        {supplierEmail}
                      </Link>
                    )}
                    {supplierEmail && supplierPhone && " • "}
                    {supplierPhone && (
                      <Link href={`tel:${supplierPhone}`} style={linkStyle}>
                        {supplierPhone}
                      </Link>
                    )}
                  </Column>
                </Row>
              )}
            </Section>
          )}

          {/* Items Table */}
          <Section style={orderItemsSection}>
            <Text style={sectionTitleText}>Order Items</Text>
            
            {/* Table Header */}
            <Row style={tableHeaderRow}>
              <Column style={tableHeaderItem}>Item</Column>
              <Column style={tableHeaderQty}>Qty</Column>
              <Column style={tableHeaderPrice}>Unit Price</Column>
              <Column style={tableHeaderTotal}>Total</Column>
            </Row>
            
            {/* Table Items */}
            {items.map((item, index) => (
              <Row key={index} style={tableItemRow}>
                <Column style={tableItemColumn}>
                  {item.name}
                  {item.sku && <div style={skuText}>SKU: {item.sku}</div>}
                </Column>
                <Column style={tableQtyColumn}>{item.quantity}</Column>
                <Column style={tablePriceColumn}>{formatPrice(item.unitPrice)}</Column>
                <Column style={tableTotalColumn}>{formatPrice(item.total)}</Column>
              </Row>
            ))}
            
            {/* Totals */}
            <Row>
              <Column style={{ width: '70%' }}></Column>
              <Column style={{ width: '30%' }}>
                <Row style={totalRow}>
                  <Column style={totalLabelColumn}>Subtotal:</Column>
                  <Column style={totalValueColumn}>{formatPrice(subtotal)}</Column>
                </Row>
                <Row style={totalRow}>
                  <Column style={totalLabelColumn}>Tax:</Column>
                  <Column style={totalValueColumn}>{formatPrice(vat)}</Column>
                </Row>
                <Row style={totalRowFinal}>
                  <Column style={totalLabelColumnFinal}>Total:</Column>
                  <Column style={totalValueColumnFinal}>{formatPrice(total)}</Column>
                </Row>
              </Column>
            </Row>
          </Section>

          {/* Expected Delivery */}
          <Section style={deliverySection}>
            <Text style={sectionTitleText}>Expected Delivery</Text>
            <Text style={normalText}>{expectedDeliveryDate || orderDate}</Text>
          </Section>

          {/* Payment Terms */}
          <Section style={paymentTermsSection}>
            <Text style={sectionTitleText}>Payment Terms</Text>
            <Text style={normalText}>{paymentTerms}</Text>
          </Section>

          {/* Notes */}
          {notes && (
            <Section style={notesSection}>
              <Text style={sectionTitleText}>Notes</Text>
              <Text style={normalText}>{notes}</Text>
            </Section>
          )}

          {/* Confirm Button */}
          <Section style={confirmButtonSection}>
          
              <Button style={confirmButton}
              href={confirmationLink}
              >Confirm This Order</Button>
           
            <Text style={confirmText}>Please reply to confirm this order</Text>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Created by: System Admin<br />
              Created on: {orderDate}
            </Text>
            
            <Text style={footerContactText}>
              If you have any questions regarding this purchase order, please contact us at<br />
              <Link href={`mailto:${contactInfo.email}`} style={footerLinkStyle}>
                {contactInfo.email}
              </Link> or call <Link href={`tel:${contactInfo.phone}`} style={footerLinkStyle}>{contactInfo.phone}</Link>.
            </Text>
          </Section>
          
          {/* Company Details */}
          <Section style={companySection}>
            <Text style={companyDetailText}>
              {companyName} | {deliveryAddress || "Your Address"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  color: '#333333',
};

const container = {
  margin: '0 auto',
  width: '100%',
  maxWidth: '600px',
  border: '1px solid #e0e0e0',
};

const headerSection = {
  backgroundColor: PRIMARY_COLOR,
  padding: '20px 0',
  color: '#ffffff',
};

const headerCompanyText = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  color: '#ffffff',
};

const headerPurchaseOrderText = {
  fontSize: '16px',
  margin: '5px 0 0',
  color: '#ffffff',
};

const poNumberSection = {
  padding: '20px 24px',
  borderBottom: '1px solid #eaeaea',
};

const poNumberText = {
  fontSize: '16px',
  margin: '0',
  fontWeight: 'normal',
};

const poNumberHighlightText = {
  color: PRIMARY_COLOR,
  fontWeight: 'bold',
};

const dateText = {
  fontSize: '14px',
  color: '#666666',
  margin: '5px 0 0',
};

const statusText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
  textAlign: 'right' as const,
};

const statusValueText = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '5px 0 0',
  textAlign: 'right' as const,
};

const supplierSection = {
  padding: '15px 24px',
  borderBottom: '1px solid #eaeaea',
};

const sectionTitleText = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: PRIMARY_COLOR,
  margin: '0 0 10px',
};

const normalText = {
  fontSize: '14px',
  margin: '5px 0',
  lineHeight: '1.5',
};

const linkStyle = {
  color: '#0066cc',
  textDecoration: 'none',
};

const orderItemsSection = {
  padding: '15px 24px',
  borderBottom: '1px solid #eaeaea',
};

const tableHeaderRow = {
  borderBottom: '1px solid #eaeaea',
  backgroundColor: '#f9f9f9',
};

const tableHeaderItem = {
  padding: '10px 5px',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '40%',
};

const tableHeaderQty = {
  padding: '10px 5px',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '15%',
  textAlign: 'center' as const,
};

const tableHeaderPrice = {
  padding: '10px 5px',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '20%',
  textAlign: 'right' as const,
};

const tableHeaderTotal = {
  padding: '10px 5px',
  fontSize: '14px',
  fontWeight: 'bold',
  width: '25%',
  textAlign: 'right' as const,
};

const tableItemRow = {
  borderBottom: '1px solid #eaeaea',
};

const tableItemColumn = {
  padding: '10px 5px',
  fontSize: '14px',
  width: '40%',
};

const skuText = {
  fontSize: '12px',
  color: '#666666',
  marginTop: '4px',
};

const tableQtyColumn = {
  padding: '10px 5px',
  fontSize: '14px',
  width: '15%',
  textAlign: 'center' as const,
};

const tablePriceColumn = {
  padding: '10px 5px',
  fontSize: '14px',
  width: '20%',
  textAlign: 'right' as const,
};

const tableTotalColumn = {
  padding: '10px 5px',
  fontSize: '14px',
  width: '25%',
  fontWeight: 'bold',
  textAlign: 'right' as const,
};

const totalRow = {
  marginTop: '5px',
};

const totalLabelColumn = {
  fontSize: '14px',
  textAlign: 'right' as const,
  paddingRight: '10px',
  color: '#666666',
};

const totalValueColumn = {
  fontSize: '14px',
  textAlign: 'right' as const,
};

const totalRowFinal = {
  marginTop: '10px',
  borderTop: '1px solid #eaeaea',
  paddingTop: '10px',
};

const totalLabelColumnFinal = {
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  paddingRight: '10px',
};

const totalValueColumnFinal = {
  fontSize: '16px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  color: PRIMARY_COLOR,
};

const deliverySection = {
  padding: '15px 24px',
  borderBottom: '1px solid #eaeaea',
};

const paymentTermsSection = {
  padding: '15px 24px',
  borderBottom: '1px solid #eaeaea',
};

const notesSection = {
  padding: '15px 24px',
  borderBottom: '1px solid #eaeaea',
};

const confirmButtonSection = {
  padding: '25px 24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #eaeaea',
};

const confirmButtonLink = {
  textDecoration: 'none',
};

const confirmButton = {
  backgroundColor: PRIMARY_COLOR,
  color: '#ffffff',
  padding: '12px 24px',
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
};

const confirmText = {
  fontSize: '14px',
  color: '#666666',
  marginTop: '10px',
};

const footerSection = {
  padding: '20px 24px',
  borderBottom: '1px solid #eaeaea',
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 15px',
};

const footerContactText = {
  fontSize: '14px',
  color: '#666666',
  lineHeight: '1.5',
};

const footerLinkStyle = {
  color: '#0066cc',
  textDecoration: 'none',
};

const companySection = {
  padding: '15px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f9f9f9',
};

const companyDetailText = {
  fontSize: '12px',
  color: '#666666',
};

export default PurchaseOrderEmail;