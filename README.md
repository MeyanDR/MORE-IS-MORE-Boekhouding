VZW Boekhoudsysteem: Complete Implementatiegids
Google Apps Script en Airtable Integratie voor MORE IS MORE! Agency

Gebaseerd op de geüploade documenten en codes, hier is de volledige implementatiegids voor het professionele VZW boekhoudsysteem.
1. Uitgebreide NACE Codes voor Kunst & Cultuur
Complete Culturele Sector Codes (40+ codes)

Het systeem ondersteunt alle relevante NACE-BEL 2025 codes voor de kunst- en cultuursector:

Podiumkunsten & Performances

    90.01: Podiumkunsten (theater, concerten, dans, cabarets)
    90.02: Ondersteunende podiumkunsten (techniek, geluids- en lichtbeheer)
    90.03: Artistieke creatie (choreografie, regie, schrijven)
    90.04: Exploitatie van kunst- en cultuurcentra

Audiovisuele Productie

    59.11: Productie van films, video's en televisieprogramma's
    59.12: Postproductie van films (montage, effecten, geluid)
    59.13: Distributie van films en video's
    59.14: Vertoning van films (bioscopen, festivals)
    59.20: Maken en uitgeven van geluidsopnamen (studio's, labels)

Media & Uitzendingen

    60.10: Radio-uitzendingen (lokale en commerciële radio)
    60.20: Televisie-uitzendingen (tv-productie, streaming)
    63.12: Webportals (online platforms, culturele websites)

Uitgeverij & Publishing

    58.11: Uitgeverij van boeken (literatuur, kunstboeken)
    58.13: Uitgeverij van kranten (culturele pers)
    58.14: Uitgeverij van tijdschriften (culturele magazines)
    58.19: Overige uitgeverij (catalogi, programmaboekjes)
    58.29: Uitgeverij van software (educatieve, creatieve tools)

Design & Creatieve Diensten

    74.10: Ontwerpen en vormgeving (grafisch, industrieel design)
    74.20: Fotografische activiteiten (kunstfotografie, evenementen)
    73.11: Reclamebureaus (creatieve marketing, campagnes)
    71.11: Architectenactiviteiten (culturele gebouwen, tentoonstellingen)

Evenementen & Recreatie

    82.30: Evenementorganisatie (festivals, culturele events)
    93.29: Overige recreatieve activiteiten (workshops, culturele tours)
    93.21: Kermisattracties en pretparken (themaparken, interactieve ervaringen)

Onderwijs & Training

    85.52: Cultureel onderwijs (muziek-, kunst-, dansscholen)
    85.59: Overige vormen van onderwijs (workshops, masterclasses)

Musea & Erfgoed

    91.02: Museumactiviteiten (tentoonstellingen, collectiebeheer)
    91.03: Beheer van monumenten en historische gebouwen
    91.04: Botanische en zoölogische tuinen (natuureducatie)

Ambacht & Kunstnijverheid

    32.12: Vervaardiging van juwelen en bijouterieën
    32.20: Vervaardiging van muziekinstrumenten
    32.99: Overige ambachtelijke vervaardiging (kunstobjecten)

Digitale Cultuur

    62.01: Ontwikkelen van computerprogramma's (culturele apps, games)
    62.09: Overige ICT-diensten (digitale archieven, VR-ervaringen)
    58.21: Uitgeverij van computergames

2. Factuur Template Analyse & Reproductie
Analyse van Voorbeeldfactuur (2025-001)

Template Structuur:

    Header: MORE IS MORE! Agency logo/naam (groot, gecentreerd)
    Bedrijfsgegevens: Adres, telefoon, email, ondernemingsnummer
    Factuurdetails: Nummer, datum, vervaldatum, referentie (rechts uitgelijnd)
    Klantadres: Volledige adresgegevens
    Projectdetails: Naam, periode, account manager
    Diensten tabel: Omschrijving, aantal, eenheidsprijs, BTW, bedrag
    Totalen: Subtotaal, korting (optioneel), totaal te betalen
    Betalingsgegevens: Bank, IBAN, BIC, mededeling
    Algemene voorwaarden: Betalingstermijn, boetes, rechtsbevoegdheid
    Footer: Bedrijfsgegevens herhaling

Exacte Reproductie Specificaties:
Bedrijfsinformatie:
- Naam: MORE IS MORE! Agency
- Adres: Abdissenstraat 11, 1190 Vorst, België
- Telefoon: +32 497 16.24.90 / +32 475 84.72.32
- Email: moreismoreagency2024@gmail.com
- Ondernemingsnummer: 1017.971.844
- IBAN: BE12 5230 8164 6692
- BIC: TRIONL2U
- Bank: Triodos Bank

Factuurnummering: YYYY-XXX formaat (2025-001, 2025-002, etc.)
BTW-behandeling: 21% standaardtarief
Betalingstermijn: 30 dagen

Factuur Generatie Features

Automatische nummerreeks: Sequential numbering per jaar
Client autocomplete: Zoeken en automatisch invullen klantgegevens
Multi-service ondersteuning: Meerdere diensten per factuur
BTW berekening: Automatische berekening per service
PDF export: Professionele layout matching template
Email integratie: Directe verzending naar klant (optioneel)

3. Executive Rapport Template Analyse & Reproductie
Analyse van Voorbeeldrapport
Rapport Structuur:

Header: "EXECUTIVE BUSINESS REPORT" met bedrijfsnaam
KPI Dashboard: 4 hoofdstatistieken in kaarten

Totale Omzet (€962,00)
Totale Kosten (€1.515,50)
Netto Winst (€-553,50)
Winstmarge (-57.5%)


Business Insights: Automatische analyses met iconen

🔴 Verlies Situatie
🏆 Top Presterende Project
💰 Grootste Uitgavencategorie


Project Performance Tabel: Per project analyse

Project naam, omzet, kosten, winst, marge %, transacties


Gedetailleerd Transactie Overzicht: Volledige transactielijst

Datum, type, referentie, project, beschrijving, bedragen, status



Exacte Styling Reproductie:

Kleurenschema: Blauw (#1e40af) voor headers, groen voor positieve bedragen, rood voor negatieve
Typografie: Sans-serif, verschillende groottes voor hiërarchie
Layout: Kaarten voor KPIs, tabellen voor data, badges voor status
Iconen: Emoji's voor visuele impact (📊, 🔴, 🏆, 💰)

Automatische Rapport Generatie

Periode selectie: Maand, kwartaal, jaar, custom range
Project filtering: Alle projecten of specifieke selectie
Type filtering: Inkomsten, uitgaven, of beide
Export formaten: PDF (executive style), Excel voor data analyse
Automatische insights: AI-generated business aanbevelingen

4. Systeem Configuratie & Integratie
Airtable Configuratie
const CONFIG = {
  production: {
    airtableToken: 'patGyvyT913BTnau0.c7200073a6a99aaeb420fd5a8beaecc85494adecbcc18cfed98f54cdee86f743',
    airtableBase: 'appPwcdZUr8yfiGvP',
    debugMode: false,
    rateLimitDelay: 200
  }

Google Drive Folders Identificatie
const DRIVE_FOLDERS = {
  INVOICES: '1JotWJZtejm6r5FGF4qzC29JYq3XJm7VT',    // Facturen opslag
  REPORTS: '1aPVb4sWg-D5fE0pg3hSI4xlx3Sfqrpp5',     // Rapporten archief
  EXPENSES: '1T0dz62ya_-IQc96Uk0eVQfNtVm0Jgqll'     // Uitgaven bijlagen
};

Beveiliging & Toegang

API Rate Limiting: 200ms delay tussen calls
Data Validatie: Input sanitization en type checking
Toegangscontrole: Domain-based gebruikersbeheer
Error Handling: Comprehensive error logging en user feedback

5. Applicatie Onderdelen - Volledige Functionele Beschrijving
📊 1. Dashboard
Doel: Centraal overzicht van financiële status en recent activiteit
Kernfunctionaliteit:

Real-time KPIs: Totale inkomsten, uitgaven, netto resultaat, BTW dit jaar
Trend visualisatie: Grafische weergave van financiële ontwikkeling
Recente transacties: Laatste 10 transacties met snelle statusweergave
Alert systeem: Waarschuwingen voor openstaande facturen, overschrijdingen
Quick actions: Snelle toegang tot meest gebruikte functies

Gebruikerservaring:

Kleurgecodeerde statistieken (groen voor winst, rood voor verlies)
Interactive charts voor trend analyse
Klikbare elementen voor diepere drill-down
Mobile-responsive design voor onderweg gebruik

💳 2. Transacties
Doel: Complete registratie en beheer van alle financiële bewegingen
Kernfunctionaliteit:

Dual entry systeem: Inkomsten en uitgaven in één interface
NACE code integratie: Automatische koppeling aan culturele activiteiten
Project allocatie: Koppeling van kosten en inkomsten aan specifieke projecten
BTW berekening: Automatische berekening volgens Belgische tarieven (0%, 6%, 21%)
Bulk import: CSV upload voor grote datasets
Audit trail: Complete wijzigingshistorie voor compliance

Geavanceerde Features:

Recurring transactions: Automatische maandelijkse kosten
Template systeem: Voorgedefinieerde transactietypes
Approval workflow: Multi-level goedkeuring voor grote bedragen
Bank reconciliation: Automatische matching met bankafschriften

📂 3. Projecten
Doel: Organisatie en tracking van culturele projecten en initiatieven
Kernfunctionaliteit:

Project lifecycle: Van planning tot afsluiting
Budget tracking: Begroting vs werkelijke kosten
Team management: Toewijzing van teamleden en rollen
Milestone tracking: Voortgang en deadlines
Profitability analysis: ROI berekening per project
Document storage: Centraal archief van projectdocumenten

Project Types Support:

Band/DJ optredens
Event organisatie
Film/video productie
Workshops en training
Management & booking
Samenwerkingsprojecten

🧾 4. Facturen
Doel: Professionele facturatie met volledige Belgische compliance
Kernfunctionaliteit:

Client autocomplete: Intelligente klant database met zoekfunctie
Template matching: Exacte reproductie van MORE IS MORE! styling
Multi-service billing: Complexe facturen met verschillende diensten
Automatic numbering: Sequential factuurnummering per jaar
PDF generation: High-quality PDF met exacte layout matching
Email integration: Directe verzending naar klanten
Payment tracking: Status monitoring en herinneringen

Compliance Features:

Belgische BTW regels: Correcte tarieven en berekeningen
Sequential numbering: Verplichte opeenvolgende nummering
Legal requirements: Alle verplichte velden en vermeldingen
7-year retention: Automatisch archivering voor wettelijke bewaartermijn

💸 5. Uitgaven
Doel: Complete uitgavenbeheer met digitaal bewijsmateriaal
Kernfunctionaliteit:

Receipt upload: Drag & drop bestandsupload (PDF, afbeeldingen)
Automatic categorization: AI-powered expense categorization
Vendor management: Leveranciers database met historie
Approval workflow: Goedkeuringsproces voor grote uitgaven
Expense reports: Automatische onkostendeclaraties
Tax deduction tracking: Aftrekbare kosten identificatie

File Management:

Organized storage: Automatische folder structuur per categorie/maand
OCR processing: Automatische tekstextractie uit bonnetjes
Duplicate detection: Voorkoming van dubbele registraties
Bulk processing: Meerdere uitgaven tegelijk verwerken

📈 6. Rapporten
Doel: Executive-level financial reporting en business intelligence
Kernfunctionaliteit:

Executive dashboard: High-level KPI overzicht voor management
Detailed analytics: Diepgaande financiële analyses
Project profitability: ROI analyse per project type
Tax reporting: BTW overzichten en jaarafsluitingen
Custom reports: Flexibele rapportage naar behoefte
Benchmark analysis: Vergelijking met sector gemiddelden

Report Types:

Monthly financials: Maandelijkse resultatenrekening
Project performance: Winstgevendheid per project
Cash flow: Liquiditeitsvoorspellingen
Tax compliance: BTW aangiftes en jaarrekeningen
Board reports: Executive summaries voor bestuur

⚙️ 7. Instellingen
Doel: Systeemconfiguratie en gebruikersbeheer
Kernfunctionaliteit:

User management: Rollen en rechten beheer
System configuration: Aangepaste instellingen per organisatie
Integration setup: API connecties en synchronisatie
Backup management: Automatische data backups
Audit logging: Complete activiteitenlog voor compliance
Notification settings: Alert configuratie per gebruiker

Security Features:

Two-factor authentication: Extra beveiligingslaag
Session management: Automatische logout en sessiecontrole
Data encryption: Versleuteling van gevoelige gegevens
Access logs: Volledige audit trail van systeemtoegang

*Information Flow Architecture*
Centrale Data Flow: Alles via Transacties Tabel
KERN PRINCIPE: Alles draait rond ÉÉN centrale tabel: "Transacties"
📊 TRANSACTIES TABEL (Airtable)
├── Inkomsten (Type: "Inkomsten")
│   ├── Factuur 2025-001 → MORE IS MORE! Agency
│   ├── Factuur 2025-002 → Client X
│   └── Betaling Project Y
│
└── Uitgaven (Type: "Uitgaven") 
    ├── UIT-2025-0001 → Kantoorkosten
    ├── UIT-2025-0002 → Materiaal Project
    └── UIT-2025-0003 → Software licentie
  Automatische Nummering Systeem
    Facturen (Inkomsten
    generateInvoiceNumber() → "2025-001", "2025-002", "2025-003"
// Opgeslagen in Transacties tabel met:
// - Type: "Inkomsten" 
// - Name: "2025-001"
// - Beschrijving: "Factuur 2025-001 - Client Name"
Uitgaven
generateExpenseNumber() → "UIT-2025-0001", "UIT-2025-0002"
// Opgeslagen in Transacties tabel met:
// - Type: "Uitgaven"
// - Name: "UIT-2025-0001" 
// - Beschrijving: "Uitgave beschrijving"

Complete Information Flow: 
1. INVOER → Transacties Tabel (Airtable)
   ├── Via Factuur Module → Record Type: "Inkomsten"
   ├── Via Uitgaven Module → Record Type: "Uitgaven"  
   └── Via Handmatige Invoer → Record Type: "Inkomsten/Uitgaven"

2. TRANSACTIES TABEL → Alle Modules
   ├── Dashboard → Leest alle records voor KPIs
   ├── Rapporten → Filtert op Type + Project + Periode
   ├── Project Overzicht → Filtert op Project naam
   └── Belasting Overzicht → Berekent BTW per Type

3. SECUNDAIRE TABELLEN (Ondersteuning)
   ├── Klanten → Voor autocomplete facturen
   ├── Projecten → Voor dropdown selecties
   └── NACE Codes → Voor compliance rapportage

   Data Synchronisatie & Consistentie
   Waarom deze architectuur?
Waarom deze architectuur?

Single Source of Truth: Alle financiële data in één tabel
Consistente nummering: Automatische sequential numbering per type
Unified reporting: Alle rapporten gebruiken dezelfde databron
BTW compliance: Centraal beheer van BTW berekeningen
Audit trail: Complete geschiedenis in één locatie

Voorbeeld Record in Transacties Tabel:
{
  id: "recXXXXXXXXXXXXXX",
  fields: {
    Name: "2025-001",                    // Auto-generated nummer
    Date: "2025-01-15",                  // Datum
    Select: "Inkomsten",                 // Type: Inkomsten/Uitgaven  
    Project: "Video Productie Client X", // Project koppeling
    Beschrijving: "Video montage en effecten",
    Bedrag: 1500.00,                     // Netto bedrag
    "BTW Percentage": 21,                // BTW tarief
    "BTW Bedrag": 315.00,               // Berekende BTW
    Totaal: 1815.00,                     // Bruto bedrag
    Status: "Betaald",                   // Betaalstatus
    "NACE Code": "59.12",               // Voor compliance
    Leverancier: null,                   // Alleen voor uitgaven
    Categorie: null                      // Alleen voor uitgaven
  }
}
🔧 Module Integratie met Centrale Tabel
1. Dashboard Module:

Leest alle records uit Transacties tabel
Filtert op Type voor inkomsten/uitgaven
Berekent KPIs real-time

2. Facturen Module:

Creëert record Type: "Inkomsten"
Genereert automatisch factuurnummer
Koppelt aan Klanten tabel voor gegevens

3. Uitgaven Module:

Creëert record Type: "Uitgaven"
Genereert automatisch uitgavennummer
Uploadt bijlagen naar Google Drive

4. Rapporten Module:

Query's op Transacties tabel met filters
Groepeert per Project, Type, Periode
Exporteert naar PDF met executive styling

5. Projecten Module:

Filtert Transacties tabel op Project naam
Berekent project winstgevendheid
Toont gekoppelde inkomsten en uitgaven

Airtable Database Schema - Exacte Specificatie
🗂️ TABEL 1: "Transacties" (Hoofdtabel - Centrale Data Hub)
Dit is de belangrijkste tabel waar alle financiële bewegingen worden opgeslagen, zowel inkomsten als uitgaven.
Verplichte Velden:
Name - Single line text veld
Auto-gegenereerde unieke identifier zoals "2025-001" voor facturen of "UIT-2025-0001" voor uitgaven. Dit veld wordt automatisch gevuld door het systeem.
Date - Date veld
Datum van de transactie in DD/MM/YYYY formaat. Verplicht voor alle transacties.
Select - Single select veld
Dropdown met twee opties: "Inkomsten" en "Uitgaven". Bepaalt het type transactie.
Beschrijving - Long text veld
Vrije tekstinvoer voor omschrijving van de transactie. Verplicht veld.
Bedrag - Currency veld (EUR)
Het netto bedrag exclusief BTW. Verplicht veld.
Totaal - Currency veld (EUR)
Het bruto bedrag inclusief BTW (Bedrag + BTW Bedrag). Verplicht veld.
Optionele Velden:
Project - Single select veld
Dropdown met opties: "Algemeen", "TROMKLUB", en dynamisch gevulde projecten uit de Projecten tabel.
BTW Percentage - Single select veld
Dropdown met opties: "0", "6", "12", "21" (Belgische BTW tarieven).
BTW Bedrag - Currency veld (EUR)
Automatisch berekend bedrag op basis van Bedrag × BTW Percentage.
Status - Single select veld
Dropdown met opties: "Betaald (betaalde facturen/uitgaven)", "Verzonden (verzonden facturen)", "In Behandeling (nieuwe uitgaven)", "Openstaand", "Overdue".
NACE Code - Single select veld
Dropdown met alle 40+ culturele NACE codes voor compliance doeleinden.
Velden Specifiek voor Uitgaven:
Leverancier - Single line text veld
Naam van de leverancier, alleen gebruikt bij uitgaven.
Categorie - Single select veld
Dropdown met opties: "Kantoorkosten", "Marketing", "Reiskosten", "Materiaal", "Software", "Algemeen".
Betaalmethode - Single select veld
Dropdown met opties: "Bankoverschrijving", "Creditcard", "Contant", "Bancontact".
Bijlage URL - URL veld
Link naar het bijbehorende Google Drive bestand (bonnetje, factuur).
Bijlage Bestandsnaam - Single line text veld
Originele bestandsnaam van de bijlage.

👥 TABEL 2: "Klanten" (Client Database)
Deze tabel bevat alle klantgegevens voor het automatisch invullen van facturen.
Verplichte Velden:
Klantgegevens - Single line text veld
De bedrijfsnaam of organisatienaam. Dit is het hoofdveld voor identificatie.
Contactpersoon - Single line text veld
Naam van de contactpersoon binnen de organisatie.
Optionele Velden:
Adres - Single line text veld
Straatnaam en huisnummer.
Postcode - Single line text veld
Postcode in Belgisch of Nederlands formaat.
Stad - Single line text veld
Naam van de stad.
Land - Single select veld
Dropdown met opties: "België", "Nederland", "Frankrijk", "Duitsland", "Luxemburg", "Overig".
BTW-nummer - Single line text veld
BTW nummer in BE of NL formaat (bijvoorbeeld BE0123456789).
Email - Email veld
Email adres van de contactpersoon.
Telefoon - Phone number veld
Telefoonnummer van de klant.

📂 TABEL 3: "Projecten" (Project Management)
Deze tabel beheert alle projectinformatie en wordt gebruikt voor dropdowns in andere tabellen.
Verplichte Velden:
Naam - Single line text veld
Unieke projectnaam die gebruikt wordt in de Transacties tabel.
Type - Single select veld
Dropdown met opties: "Band/DJ", "Event", "Productie", "Workshop", "Management/Booking", "Samenwerking", "Overig".
Aangemaakt - Date veld
Automatisch ingevulde datum wanneer het project wordt aangemaakt.
Optionele Velden:
Beschrijving - Long text veld
Uitgebreide omschrijving van het project.

🏷️ TABEL 4: "NACE_Codes" (Compliance Reference)
Deze referentietabel bevat alle relevante NACE codes voor de culturele sector.
Veldstructuur:
Code - Single line text veld
De officiële NACE code zoals "90.01" of "59.12".
Beschrijving - Single line text veld
Nederlandse omschrijving van de activiteit.
Categorie - Single select veld
Groepeert codes in categorieën zoals "Performances", "Audiovisueel", "Media", "Publishing", "Design", "Events", "Educatie", "Erfgoed", "Ambacht", "Digitaal".
Complete NACE Code Lijst:
Podiumkunsten & Performances:
Code 90.01 voor Podiumkunsten, Code 90.02 voor Ondersteunende podiumkunsten, Code 90.03 voor Artistieke creatie, Code 90.04 voor Exploitatie van kunst- en cultuurcentra.
Audiovisuele Productie:
Code 59.11 voor Productie van films, Code 59.12 voor Postproductie van films, Code 59.13 voor Distributie van films, Code 59.14 voor Vertoning van films, Code 59.20 voor Maken en uitgeven van geluidsopnamen.
Media & Uitzendingen:
Code 60.10 voor Radio-uitzendingen, Code 60.20 voor Televisie-uitzendingen, Code 63.12 voor Webportals.
Uitgeverij & Publishing:
Code 58.11 voor Uitgeverij van boeken, Code 58.13 voor Uitgeverij van kranten, Code 58.14 voor Uitgeverij van tijdschriften, Code 58.19 voor Overige uitgeverij, Code 58.29 voor Uitgeverij van software.
Design & Creatieve Diensten:
Code 74.10 voor Ontwerpen en vormgeving, Code 74.20 voor Fotografische activiteiten, Code 73.11 voor Reclamebureaus, Code 71.11 voor Architectenactiviteiten.
Evenementen & Recreatie:
Code 82.30 voor Evenementorganisatie, Code 93.29 voor Overige recreatieve activiteiten, Code 93.21 voor Kermisattracties en pretparken.
Onderwijs & Training:
Code 85.52 voor Cultureel onderwijs, Code 85.59 voor Overige vormen van onderwijs.
Musea & Erfgoed:
Code 91.02 voor Museumactiviteiten, Code 91.03 voor Beheer van monumenten, Code 91.04 voor Botanische en zoölogische tuinen.
Ambacht & Kunstnijverheid:
Code 32.12 voor Vervaardiging van juwelen, Code 32.20 voor Vervaardiging van muziekinstrumenten, Code 32.99 voor Overige ambachtelijke vervaardiging.
Digitale Cultuur:
Code 62.01 voor Ontwikkelen van computerprogramma's, Code 62.09 voor Overige ICT-diensten, Code 58.21 voor Uitgeverij van computergames.

🔗 Tabel Relaties & Automatisering
Gekoppelde Velden:
Het Project veld in de Transacties tabel is gekoppeld aan de Naam velden in de Projecten tabel via een lookup functie. Het NACE Code veld in de Transacties tabel gebruikt de codes uit de NACE_Codes tabel. De koppeling tussen Facturen en Klanten gebeurt via de API zoekfunctie, niet via directe Airtable links.
Automatische Berekeningen:
Het BTW Bedrag wordt automatisch berekend als Bedrag maal BTW Percentage gedeeld door honderd. Het Totaal veld is de som van Bedrag plus BTW Bedrag. Het Name veld wordt automatisch gegenereerd door Google Apps Script met sequential numbering per jaar.
Data Validatie:
Voor Inkomsten zijn verplicht: Name, Date, Select als "Inkomsten", Beschrijving, en Bedrag groter dan nul. Voor Uitgaven zijn verplicht: Name, Date, Select als "Uitgaven", Beschrijving, Leverancier, Categorie, en Bedrag groter dan nul.

🗂️ Airtable Views (Weergaven)
Transacties Tabel Views:
De "Alle Transacties" view toont alle records chronologisch met nieuwste eerst. De "Inkomsten" view filtert alleen records waar Select gelijk is aan "Inkomsten". De "Uitgaven" view filtert alleen records waar Select gelijk is aan "Uitgaven". De "Per Project" view groepeert alle transacties op Project naam. De "Openstaand" view filtert records waar Status niet gelijk is aan "Betaald".
Klanten Tabel Views:
De "Alle Klanten" view toont alle klanten alfabetisch gesorteerd op Klantgegevens. De "Actieve Klanten" view toont klanten die recent gebruikt zijn voor facturen.
Projecten Tabel Views:
De "Actieve Projecten" view toont alle projecten gesorteerd op Aangemaakt datum met nieuwste eerst. De "Per Type" view groepeert projecten op hun Type veld.
