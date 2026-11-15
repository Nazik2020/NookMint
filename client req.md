# Multi-Category E-Commerce & Online Ordering Platform

> Built by **AspireV Technologies** · *Built Around Your Business*
> Version 1.0 · 05 November 2026 · Status: Initial requirements, pending client validation

A scalable, configurable online ordering platform for groceries, household items and clothing, designed to grow into new categories such as electric vehicles (EVs). Customers browse and order **without an online payment gateway**; the business receives and processes orders through an admin dashboard and **WhatsApp**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Goals](#goals)
3. [User Roles](#user-roles)
4. [Features](#features)
5. [Order Workflow](#order-workflow)
6. [WhatsApp Integration](#whatsapp-integration)
7. [Admin Dashboard](#admin-dashboard)
8. [Architecture](#architecture)
9. [Database Design](#database-design)
10. [Non-Functional Requirements](#non-functional-requirements)
11. [UI/UX Guidelines](#uiux-guidelines)
12. [Security](#security)
13. [Performance & SEO](#performance--seo)
14. [Tech Stack](#tech-stack)
15. [Testing & QA](#testing--qa)
16. [Deployment & Operations](#deployment--operations)
17. [Future Expansion](#future-expansion)
18. [Development Phases](#development-phases)
19. [Scope Boundaries](#scope-boundaries)
20. [Open Questions for the Client](#open-questions-for-the-client)
21. [Success Criteria](#success-criteria)
22. [Contact](#contact)

---

## Project Overview

The client needs a professional online platform where customers can browse products, add them to a cart and submit orders. Initial categories:

- 🛒 Groceries and food essentials
- 🏠 Household products and daily-use items
- 👕 Clothing and fashion

Future categories (e.g. **electric vehicles**) must be addable **without code changes or redesigning the database**. This is a configurable platform, not a fixed-category catalogue.

## Goals

Customers can:

1. Discover and browse products across categories
2. Search and filter products
3. View detailed product information
4. Select variations, quantities and options
5. Add products to a cart
6. Submit orders (no payment gateway)
7. Receive updates through WhatsApp or other agreed channels

Staff can manage products, categories, inventory and orders from a protected admin interface.

### Engineering principles

Separation of concerns · Modular and reusable architecture · Database normalisation · User-centred and mobile-first design · Secure development · Testing and QA · SEO · Scalability and maintainability

### Business requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | Establish an online presence | Must |
| BR-02 | Support multiple product categories | Must |
| BR-03 | Allow customers to submit orders online | Must |
| BR-04 | Order processing without a payment gateway | Must |
| BR-05 | Integrate WhatsApp into ordering/communication | Must |
| BR-06 | Administrative interface | Must |
| BR-07 | Product and order management | Must |
| BR-08 | Responsive on mobile, tablet, desktop | Must |
| BR-09 | Allow new product categories | Must |
| BR-10 | Support future EV and other product types | Should |
| BR-11 | Foundation for future integrations | Should |

## User Roles

| Role | Capabilities |
|---|---|
| **Customer** | Browse, search, filter, view details, manage cart, submit orders, contact via WhatsApp, track order (if included) |
| **Administrator** | Full dashboard access: products, categories, images, prices, stock, orders, statuses, promotions, reports |
| **Staff / Order Manager** | View orders, update status, contact customers, update fulfilment info. No automatic access to sensitive admin functions |
| **Future roles** | Inventory Manager, Delivery Manager, Branch Manager, EV Sales Representative |

## Features

### Homepage
Branding, promotional banner, search bar, category navigation, featured products, new arrivals, best sellers (if data exists), offers, cart access, WhatsApp contact, business info and footer links.

### Category Management
- Create, edit, activate/deactivate categories and subcategories
- Upload category images and control display order
- Assign products to categories
- Categories must **not** assume identical product attributes

### Product Management

| Attribute | Description |
|---|---|
| Product ID / SKU | System identifier / business code |
| Name, Description | Title and details |
| Category | Assigned category |
| Images | One or multiple |
| Selling Price / Previous Price | Current and optional original price |
| Stock Quantity / Availability | Inventory and status |
| Status | Active or inactive |
| Created / Updated Date | Timestamps |

**Category-specific attributes (configurable):**

| Category | Example Attributes |
|---|---|
| Groceries | Brand, weight/volume, unit, expiry, storage |
| Household | Brand, material, dimensions, colour, specs |
| Clothing | Size, colour, material, variations, size guide |
| EVs (future) | Manufacturer, model, type, battery capacity, range, charging, warranty |

### Product Discovery
Grid layout, name search, filters (category, price range, brand, availability, plus category-relevant filters such as size/colour), sort by price or newest.

### Product Detail Page
Name, gallery, price, description, specifications, variations, stock status, quantity selector, Add to Cart, WhatsApp enquiry, related products. Unavailable products and invalid quantities must be clearly blocked.

### Shopping Cart
- Add, remove, change quantity/variation
- Subtotal, delivery charges, estimated total
- Persistence via browser storage (guests), optional server-side persistence if accounts are added
- **Prices and stock are revalidated before an order is accepted**

### Checkout
Simple, mobile-friendly **guest checkout** (no account required unless the client requests it):

- Full name, contact number, WhatsApp number (if different)
- Delivery address, district/town, delivery instructions
- Payment method (if applicable), order notes
- Order review before submission

### Order Management
Each order gets a unique reference and stores customer details, items, variations, quantities, **price at time of order**, subtotal, delivery fee, total, date/time, delivery info, payment method/status and order status.

**Proposed statuses:** Pending → Confirmed → Processing → Ready for Dispatch → Out for Delivery → Completed (or Cancelled). Final statuses to be agreed with the client.

### Payment Approach
No online payment gateway initially. Possible arrangements (to be confirmed): cash on delivery, bank transfer with manual verification, or direct arrangement with the customer. No card data is collected.

## Order Workflow

**Customer journey**

```
Visit site → Browse categories → Search/filter → Product page → Select options
→ Add to cart → Review cart → Checkout → Enter details → Review → Submit
→ Validated & stored → Reference + confirmation → Business processes order
```

**Admin journey**

```
Sign in → Open order dashboard → Identify new order → Review details
→ Confirm availability → Contact customer → Update status
→ Prepare & deliver/collect → Mark completed
```

**Failure scenarios the system must handle:** invalid customer data, product unavailable mid-checkout, price changes, insufficient stock, database/network errors, duplicate submissions, WhatsApp failure.

> An order is only "submitted" once its database transaction succeeds. A WhatsApp failure must **not** erase a stored order; allow retry or manual follow-up.

## WhatsApp Integration

**Customer-facing:** contact button, product enquiry, order-related communication.
**Business-facing:** new-order notification with reference, summary, customer contact and (where supported) a link to the admin order.

**Notification flow**

1. Customer submits order
2. Backend validates
3. Order saved to database
4. Order reference generated
5. WhatsApp notification initiated/sent
6. Staff review the order
7. Staff contact the customer to confirm availability, delivery and payment

**Implementation options**

| Option | Description | Notes |
|---|---|---|
| **A. Click-to-chat** | Site generates a WhatsApp link with a prepared message; customer sends it | Simple, no API charges, requires customer action |
| **B. WhatsApp Business Platform / Cloud API** | Backend sends automated notifications | Needs account setup, approved templates, permissions, and Meta charges |

The database stays the **primary source of truth** for orders. WhatsApp is never a replacement for storing them.

## Admin Dashboard

- **Summary cards:** Total / Pending / Completed Orders, Total / Active Products, Low-Stock Products
- **Charts:** orders over time, orders by category, status distribution, best sellers (once data exists)
- **Products:** create/edit, images, categories, prices, stock, variations, activate/deactivate
- **Orders:** view all, search by reference, filter by status/date, customer info, full details, update status, internal notes, order history
- **Inventory:** stock updates, availability indicators, low-stock and out-of-stock handling, checkout stock validation

All figures must come from actual system records. Whether stock is deducted at order placement or at confirmation is **to be decided with the client**.

## Architecture

A modular, layered architecture:

| Layer | Contents |
|---|---|
| **Presentation** | Customer site, catalogue, cart, checkout, admin dashboard |
| **Application / Business Logic** | Products, categories, cart, checkout, orders, inventory validation, WhatsApp services |
| **Data Access** | Models, validation, queries, repository/service interfaces |
| **Data Storage** | Products, categories, attributes, customers, orders, order items, admin users, settings |
| **External Integrations** | WhatsApp, image storage, email (if needed), analytics/monitoring |

**Design principles:** Separation of Concerns, Modularity, Reusability, Scalability, Maintainability, Single Responsibility, and isolating external integrations behind service interfaces so providers can be swapped.

**Suggested modules:** Authentication · User Management · Product · Category · Product Attribute · Search & Filtering · Cart · Checkout · Order · Inventory · WhatsApp Integration · Admin Dashboard · Reporting · Configuration

## Database Design

| Entity | Responsibility |
|---|---|
| Users / Roles | Accounts and access levels |
| Categories | Category hierarchy |
| Products | Main product data |
| Product Attributes | Category-specific specs |
| Product Variants | Sizes, colours, etc. |
| Inventory | Stock records |
| Product Images | Image references |
| Carts / Cart Items | Server-side carts (if used) |
| Orders / Order Items | Order records and line items |
| Addresses | Saved addresses (if used) |
| Order Status History | Status change log |
| Notifications | Notification records and delivery status |
| System Settings | Business configuration |

**Key considerations**

- Unique identifiers and proper foreign keys
- Avoid duplicate data; index search and order queries
- Store order item prices at time of purchase
- Use decimal types for money; consistent timestamps
- Never delete historical orders when products become inactive
- Consider audit records for admin changes
- **Category-aware attribute model** instead of fixed columns per product type

## Non-Functional Requirements

| ID | Attribute | Requirement |
|---|---|---|
| NFR-01 | Usability | Understandable to non-technical customers |
| NFR-02 | Responsiveness | Mobile, tablet, desktop |
| NFR-03 | Performance | Efficient page and image loading |
| NFR-04 | Security | Protect admin access and sensitive data |
| NFR-05 | Scalability | Support new categories and data growth |
| NFR-06 | Maintainability | Modular, documented code |
| NFR-07 | Reliability | Validated, safely recorded orders |
| NFR-08 | Compatibility | Modern major browsers |
| NFR-09 | Accessibility | Follow recognised accessibility principles |
| NFR-10 | SEO | Discoverable public product/category pages |
| NFR-11 | Data Integrity | Consistent product, customer and order data |
| NFR-12 | Availability | Reliable hosting and backups |

Performance targets are to be measured and agreed during development, not promised up front.

## UI/UX Guidelines

- **User-centred and mobile-first:** comfortable touch targets, accessible search, visible cart, fewer checkout fields, no horizontal scrolling, optimised images
- **Navigation:** Home, Shop, Categories, Offers, About Us, Contact Us (mobile: Home, Shop, Categories, Cart, Account if enabled)
- **Product cards:** image, name, price, previous price, availability, variation info, quick add. Keep them uncluttered
- **Checkout:** minimal steps, clear labels, inline validation, preserved input after errors, visible order summary and delivery charges, duplicate-submission protection, clear success screen
- **Feedback:** confirmation on Add to Cart, immediate cart updates, helpful quantity errors, clear out-of-stock state, loading/success states, WhatsApp button opens the expected chat
- **Accessibility (WCAG):** colour contrast, keyboard access, focus indicators, alt text, semantic HTML, labelled forms, clear errors, appropriate text sizing

## Security

**Authentication & authorisation:** secure admin login, role-based access control, hashed passwords, session management and expiry, protection against unauthorised dashboard access.

**Application security:** server-side validation, SQL/NoSQL injection and XSS protection, CSRF protection, HTTPS, secured APIs, restricted admin operations, file-upload validation, no secrets in frontend code, rate limiting on sensitive endpoints.

**Data protection:** collect only necessary data, restrict access to customer details, protect backups, keep private info out of URLs, define a retention policy, never store payment credentials.

## Performance & SEO

**Performance:** optimised image formats/sizes, lazy loading, efficient queries, pagination, caching, minimal JavaScript, monitoring. Test against Core Web Vitals and Lighthouse.

**Technical SEO:** page titles, meta descriptions, semantic headings, clean URLs, XML sitemap, robots.txt, canonical URLs, image alt text, internal linking, structured data, mobile-friendly pages, Search Console readiness. SEO setup does not guarantee rankings.

## Tech Stack

*Proposed; final choices depend on deployment needs, team capability, traffic and maintainability.*

| Layer | Technology |
|---|---|
| Frontend | Next.js / React |
| UI | Tailwind CSS + reusable components |
| Backend | Next.js server-side functionality or a separate API |
| Database | MongoDB or PostgreSQL (decide after inventory requirements are confirmed) |
| Authentication | Secure session-based auth |
| Image Storage | Cloud object storage |
| WhatsApp | Click-to-chat or WhatsApp Business Cloud API |
| Version Control | Git and GitHub |
| Testing | Playwright, Jest or alternatives |
| Code Quality | ESLint, TypeScript, static analysis |
| Deployment | Cloud hosting platform |
| Analytics | Privacy-conscious analytics, if required |

## Testing & QA

| Type | Examples |
|---|---|
| Unit | Price calculations, quantity/stock validation, cart totals, order reference generation |
| Integration | Checkout ↔ database, product ↔ inventory, order ↔ notification, admin ↔ APIs |
| Functional | Product CRUD, search/filter, add to cart, checkout, order status updates |
| UI/UX | Navigation, responsiveness, readability, forms, errors, accessibility, checkout completion |
| Security | Login protection, role permissions, input validation, API access control, upload restrictions |
| Performance | Homepage, listings, search, images, queries, large catalogues |
| Cross-browser/device | Modern browsers and screen sizes |
| **UAT** | Client verifies product data, categories, ordering, WhatsApp workflow, admin operations |

### Traceability

| Requirement | Implementation | Acceptance Evidence |
|---|---|---|
| Multiple categories | Dynamic category module | Admin creates a new category |
| Product discovery | Search and filters | Customer finds products |
| Product variations | Variant management | Customer selects valid options |
| Cart | Cart module | Items and totals update correctly |
| Order submission | Checkout and order module | Order stored with a reference |
| No payment gateway | Manual payment arrangement | Checkout completes without online payment |
| WhatsApp | Notification/contact integration | Agreed workflow succeeds |
| Admin management | Protected dashboard | Staff manage products and orders |
| Inventory | Stock validation | Unavailable quantities cannot be ordered |
| Future expansion | Flexible category/attribute model | New category configured without restructuring |

## Deployment & Operations

**Deployment checklist:** production environment, domain, HTTPS, database, environment variables, admin account, initial products/categories, backups, final production testing, deployment verification.

**Ongoing operations:** regular backups, dependency and security updates, error monitoring, image storage management, domain/hosting renewal, recovery procedures.

Hosting, domains, third-party API charges and maintenance are agreed **separately** from the initial development scope.

## Future Expansion

**EV category** may need: brand/model info, galleries, technical specs, battery capacity, range, charging details, warranty, availability, enquiry forms, test-drive requests and WhatsApp sales enquiries. EVs may use an **enquiry/quotation workflow** instead of a normal cart and checkout, so the architecture should allow adding this later.

**Possible future modules:** customer accounts, order tracking, delivery management, multiple branches, advanced inventory, promo codes, loyalty programmes, reviews and ratings, email notifications, WhatsApp Business API notifications, analytics and sales reports, multiple payment methods, online payment gateway, supplier management, EV enquiry/booking management.

*These are not part of the initial delivery unless agreed.*

## Development Phases

| Phase | Activities |
|---|---|
| 01 Requirements Discovery | Client interviews, process analysis, requirements confirmation |
| 02 UX Research & Planning | User journeys, information architecture, navigation |
| 03 UI/UX Design | Wireframes, visual design, prototypes |
| 04 Architecture & Database Design | Modules, DB relationships, API planning |
| 05 Core Development | Catalogue, categories, cart, checkout |
| 06 Administration | Admin dashboard, product and order management |
| 07 Integrations | WhatsApp and agreed external services |
| 08 Testing & QA | Functional, integration, security, performance, usability |
| 09 Client UAT | Client review and acceptance |
| 10 Deployment | Production setup, launch, handover |

Each phase should have a clear deliverable and review point.

## Scope Boundaries

Unless separately agreed, the following are **not** included:

- Online payment gateway integration
- Full ERP implementation
- Accounting and financial management
- Supplier and procurement management
- Advanced warehouse management
- Multi-branch stock synchronisation
- Delivery fleet tracking
- Native Android/iOS apps
- Automated WhatsApp Business API messaging charges
- EV sales and test-drive management
- Advanced business intelligence and forecasting
- Ongoing content creation and product photography

## Open Questions for the Client

<details>
<summary><strong>Click to expand all 35 questions</strong></summary>

**A. Business and Product Information**
1. What is the official business name and brand identity?
2. Approximately how many products at launch?
3. How many categories and subcategories initially?
4. Will the client provide all product names, descriptions, prices and images?
5. Will products have multiple sizes, colours or variations?
6. Should products support discounts and promotional prices?

**B. Ordering and Checkout**

7. Can customers order without registering?
8. What customer details are required at checkout?
9. Can customers order multiple categories in one cart?
10. Can customers cancel orders?
11. Should order confirmation display immediately?
12. Should there be an order tracking page?

**C. WhatsApp Integration**

13. Should customers submit orders on the website and then receive a WhatsApp confirmation?
14. Should the business get automatic WhatsApp notifications for every new order?
15. Is the client using WhatsApp Business?
16. Are automated messages expected, or is a click-to-chat link enough?
17. Which WhatsApp number receives order notifications?

**D. Payment**

18. Which payment methods are accepted?
19. Is cash on delivery available?
20. Is bank transfer available?
21. Is payment confirmation handled manually by staff?

**E. Delivery and Fulfilment**

22. Which towns, districts or areas are covered?
23. Are delivery charges fixed, location-based or calculated otherwise?
24. Can customers collect orders?
25. Can customers choose a preferred delivery date or time?
26. How is stock availability confirmed?

**F. Administration**

27. How many people will manage the website?
28. Should staff have separate logins?
29. Should administrators manage inventory?
30. Are sales and order reports required?
31. Are multiple branches or warehouses needed?

**G. Future Expansion**

32. When will electric vehicles be introduced?
33. Will EVs be sold directly on the website or via enquiries/quotations?
34. Are other product categories planned?
35. Is multi-branch or wholesale selling expected?

</details>

## Success Criteria

The platform is successful when:

1. Customers can easily discover and browse products
2. Initial categories are properly implemented
3. Product information and variations display correctly
4. Customers can order without an online payment gateway
5. Every successful order is stored accurately
6. The agreed WhatsApp process works
7. Administrators can manage products, categories and orders
8. Inventory validation prevents invalid orders
9. Mobile and desktop experiences are consistent
10. Agreed security and quality requirements are met
11. The architecture supports future categories, including EVs
12. The client completes the agreed user acceptance tests

> **The objective is not simply to build a website that displays products. It is to engineer a digital ordering platform around the client's business operations and long-term growth.**

## Contact

**AspireV Technologies** · *Your Business. Your Requirements. Our Technology.*

- 🌐 Website: <https://aspirev-tech.pages.dev/>
- ✉️ Email: <hello.aspirev@gmail.com>
- 💬 WhatsApp: +94 78 784 4914
